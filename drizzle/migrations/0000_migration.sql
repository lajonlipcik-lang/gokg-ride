
create type public.app_role as enum ('passenger','driver','admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.admin_emails (email text primary key);
grant all on public.admin_emails to service_role;
alter table public.admin_emails enable row level security;
insert into public.admin_emails values ('lajonlipcik@gmail.com');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  phone_verified boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "update own name" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "admin update profiles" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(),'admin'));

create or replace function public.protect_profile_cols() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if current_user = 'authenticated' and not public.has_role(auth.uid(),'admin') then
    new.phone := old.phone; new.phone_verified := old.phone_verified;
    new.blocked := old.blocked; new.email := old.email;
  end if;
  return new;
end $$;
create trigger trg_protect_profile before update on public.profiles
for each row execute function public.protect_profile_cols();

create table public.user_settings (
  user_id uuid primary key,
  theme text not null default 'dark' check (theme in ('dark','light','system')),
  lang text not null default 'ru' check (lang in ('ru','ky')),
  vibration boolean not null default true,
  traffic boolean not null default false,
  no_call boolean not null default false,
  show_location boolean not null default true,
  notify_status boolean not null default true,
  notify_promo boolean not null default false,
  notify_news boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.user_settings to authenticated;
grant all on public.user_settings to service_role;
alter table public.user_settings enable row level security;
create policy "own settings" on public.user_settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug in ('privacy','terms','data')),
  lang text not null check (lang in ('ru','ky')),
  version int not null default 1,
  title text not null,
  body text not null,
  updated_at timestamptz not null default now(),
  unique(slug, lang)
);
grant select on public.legal_documents to anon, authenticated;
grant insert, update on public.legal_documents to authenticated;
grant all on public.legal_documents to service_role;
alter table public.legal_documents enable row level security;
create policy "public read legal" on public.legal_documents for select to anon, authenticated using (true);
create policy "admin edit legal" on public.legal_documents for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  doc_slug text not null,
  version int not null,
  accepted_at timestamptz not null default now()
);
grant select, insert on public.consents to authenticated;
grant all on public.consents to service_role;
alter table public.consents enable row level security;
create policy "own consents read" on public.consents for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own consents insert" on public.consents for insert to authenticated
  with check (user_id = auth.uid());

create table public.app_config (key text primary key, value text not null default '');
grant select on public.app_config to anon, authenticated;
grant insert, update on public.app_config to authenticated;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
create policy "public read config" on public.app_config for select to anon, authenticated using (true);
create policy "admin config" on public.app_config for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.app_config values ('map_key',''),('emergency_phone','112'),('support_phone','+996 000 000 000');

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null, center_lat double precision not null, center_lng double precision not null,
  radius_km double precision not null default 30
);
grant select on public.zones to anon, authenticated;
grant insert, update, delete on public.zones to authenticated;
grant all on public.zones to service_role;
alter table public.zones enable row level security;
create policy "read zones" on public.zones for select to anon, authenticated using (true);
create policy "admin zones" on public.zones for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.tariffs (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.zones(id) on delete cascade,
  class text not null check (class in ('economy','comfort')),
  base numeric not null, per_km numeric not null, per_min numeric not null,
  min_price numeric not null, multiplier numeric not null default 1,
  fastest_surcharge numeric not null default 20,
  unique(zone_id, class)
);
grant select on public.tariffs to anon, authenticated;
grant insert, update, delete on public.tariffs to authenticated;
grant all on public.tariffs to service_role;
alter table public.tariffs enable row level security;
create policy "read tariffs" on public.tariffs for select to anon, authenticated using (true);
create policy "admin tariffs" on public.tariffs for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

with b as (insert into public.zones(name,center_lat,center_lng,radius_km) values ('Бишкек',42.8746,74.5698,30) returning id),
     j as (insert into public.zones(name,center_lat,center_lng,radius_km) values ('Джалал-Абад',40.9333,73.0017,20) returning id)
insert into public.tariffs(zone_id,class,base,per_km,per_min,min_price)
select id,'economy',60,18,3,100 from b union all
select id,'comfort',90,24,4,150 from b union all
select id,'economy',50,15,2.5,80 from j union all
select id,'comfort',75,20,3.5,120 from j;

create table public.drivers (
  user_id uuid primary key,
  status text not null default 'pending' check (status in ('draft','pending','approved','rejected')),
  reject_reason text,
  online boolean not null default false,
  lat double precision, lng double precision, location_updated_at timestamptz,
  rating numeric not null default 5, rides_count int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.drivers to authenticated;
grant all on public.drivers to service_role;
alter table public.drivers enable row level security;
create policy "driver own row" on public.drivers for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null unique,
  make text not null, model text not null, color text not null, plate text not null,
  year int not null, class text not null default 'economy' check (class in ('economy','comfort'))
);
grant select on public.vehicles to authenticated;
grant all on public.vehicles to service_role;
alter table public.vehicles enable row level security;
create policy "own vehicle" on public.vehicles for select to authenticated
  using (driver_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  kind text not null check (kind in ('license','passport','tech_passport','selfie')),
  path text not null,
  created_at timestamptz not null default now(),
  unique(driver_id, kind)
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "own docs" on public.documents for all to authenticated
  using (driver_id = auth.uid() or public.has_role(auth.uid(),'admin'))
  with check (driver_id = auth.uid());

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid,
  driver_id uuid,
  status text not null default 'searching' check (status in ('searching','driver_assigned','driver_arrived','in_progress','completed','cancelled','no_drivers')),
  class text not null check (class in ('fastest','economy','comfort')),
  zone_id uuid references public.zones(id),
  from_addr text not null, from_lat double precision not null, from_lng double precision not null,
  entrance text,
  to_addr text not null, to_lat double precision not null, to_lng double precision not null,
  distance_km numeric not null, duration_min numeric not null, price numeric not null,
  comment text, options jsonb not null default '{}'::jsonb, no_call boolean not null default false,
  idempotency_key text not null,
  candidate_ids uuid[] not null default '{}',
  share_token text unique default encode(gen_random_bytes(12),'hex'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz, arrived_at timestamptz, started_at timestamptz,
  completed_at timestamptz, cancelled_at timestamptz,
  unique(passenger_id, idempotency_key)
);
create unique index one_active_ride_passenger on public.rides(passenger_id)
  where status in ('searching','driver_assigned','driver_arrived','in_progress');
create unique index one_active_ride_driver on public.rides(driver_id)
  where status in ('driver_assigned','driver_arrived','in_progress');
grant select on public.rides to authenticated;
grant all on public.rides to service_role;
alter table public.rides enable row level security;
create policy "ride participants" on public.rides for select to authenticated
  using (passenger_id = auth.uid() or driver_id = auth.uid()
    or (status='searching' and auth.uid() = any(candidate_ids))
    or public.has_role(auth.uid(),'admin'));

create table public.ride_events (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  status text not null, actor uuid, created_at timestamptz not null default now()
);
grant select on public.ride_events to authenticated;
grant all on public.ride_events to service_role;
alter table public.ride_events enable row level security;
create policy "events of my rides" on public.ride_events for select to authenticated
  using (exists(select 1 from public.rides r where r.id=ride_id and (r.passenger_id=auth.uid() or r.driver_id=auth.uid()))
    or public.has_role(auth.uid(),'admin'));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null unique references public.rides(id) on delete cascade,
  amount numeric not null, method text not null default 'cash',
  created_at timestamptz not null default now()
);
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments of my rides" on public.payments for select to authenticated
  using (exists(select 1 from public.rides r where r.id=ride_id and (r.passenger_id=auth.uid() or r.driver_id=auth.uid()))
    or public.has_role(auth.uid(),'admin'));

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null unique references public.rides(id) on delete cascade,
  from_user uuid, to_user uuid,
  stars int not null check (stars between 1 and 5), comment text,
  created_at timestamptz not null default now()
);
grant select on public.ratings to authenticated;
grant all on public.ratings to service_role;
alter table public.ratings enable row level security;
create policy "my ratings" on public.ratings for select to authenticated
  using (from_user=auth.uid() or to_user=auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete set null,
  user_id uuid not null, text text not null check (length(text) between 3 and 2000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.complaints to authenticated;
grant all on public.complaints to service_role;
alter table public.complaints enable row level security;
create policy "own complaints" on public.complaints for select to authenticated
  using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "create complaint" on public.complaints for insert to authenticated with check (user_id=auth.uid());
create policy "admin complaints" on public.complaints for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.sos_events (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id) on delete set null,
  user_id uuid not null, lat double precision, lng double precision,
  created_at timestamptz not null default now()
);
grant select on public.sos_events to authenticated;
grant all on public.sos_events to service_role;
alter table public.sos_events enable row level security;
create policy "sos read" on public.sos_events for select to authenticated
  using (user_id=auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid, action text not null, details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
create policy "admin audit" on public.audit_log for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.sms_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  test_mode boolean not null default true,
  provider_name text not null default '',
  api_url text not null default '',
  method text not null default 'POST' check (method in ('POST','GET')),
  headers jsonb not null default '[]'::jsonb,
  body_format text not null default 'json' check (body_format in ('json','form')),
  body_template text not null default '{"to":"{phone}","text":"{text}","from":"{sender}"}',
  sender text not null default 'GoKG',
  text_template text not null default 'GoKG: ваш код {code}',
  success_contains text not null default '',
  max_per_10min int not null default 3,
  max_attempts int not null default 5,
  ttl_min int not null default 5,
  has_key boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.sms_settings to authenticated;
grant all on public.sms_settings to service_role;
alter table public.sms_settings enable row level security;
create policy "admin sms settings" on public.sms_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
insert into public.sms_settings(id) values (1);

create table public.sms_secrets (id int primary key default 1 check (id=1), api_key_enc text);
grant all on public.sms_secrets to service_role;
alter table public.sms_secrets enable row level security;

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, phone text not null, code_hash text not null,
  attempts int not null default 0, used boolean not null default false,
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
grant all on public.otp_codes to service_role;
alter table public.otp_codes enable row level security;

create table public.sms_log (
  id uuid primary key default gen_random_uuid(),
  phone_masked text not null, status text not null, error text, test boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.sms_log to authenticated;
grant all on public.sms_log to service_role;
alter table public.sms_log enable row level security;
create policy "admin sms log" on public.sms_log for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.sms_required() returns boolean
language sql stable security definer set search_path=public as $$ select enabled from public.sms_settings where id=1 $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
declare r text;
begin
  insert into public.profiles(id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict do nothing;
  insert into public.user_settings(user_id) values (new.id) on conflict do nothing;
  r := coalesce(new.raw_user_meta_data->>'role','passenger');
  insert into public.user_roles(user_id, role) values (new.id, 'passenger') on conflict do nothing;
  if r = 'driver' then
    insert into public.user_roles(user_id, role) values (new.id, 'driver') on conflict do nothing;
    insert into public.drivers(user_id, status) values (new.id, 'draft') on conflict do nothing;
  end if;
  if exists(select 1 from public.admin_emails where email = lower(new.email)) then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  if (new.raw_user_meta_data->>'consent') = 'true' then
    insert into public.consents(user_id, doc_slug, version)
    select new.id, slug, max(version) from public.legal_documents where slug in ('privacy','terms') and lang='ru' group by slug;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.km_between(a_lat double precision, a_lng double precision, b_lat double precision, b_lng double precision)
returns double precision language sql immutable as $$
  select 6371 * 2 * asin(sqrt(power(sin(radians(b_lat-a_lat)/2),2) + cos(radians(a_lat))*cos(radians(b_lat))*power(sin(radians(b_lng-a_lng)/2),2)))
$$;

create or replace function public.nearest_zone(p_lat double precision, p_lng double precision) returns uuid
language sql stable set search_path=public as $$
  select id from public.zones order by public.km_between(p_lat,p_lng,center_lat,center_lng) limit 1
$$;

create or replace function public.calc_price(p_zone uuid, p_class text, p_km numeric, p_min numeric) returns numeric
language plpgsql stable set search_path=public as $$
declare t public.tariffs; p numeric;
begin
  select * into t from public.tariffs where zone_id=p_zone and class = case when p_class='comfort' then 'comfort' else 'economy' end;
  if t.id is null then return 0; end if;
  p := greatest(t.min_price, (t.base + p_km*t.per_km + p_min*t.per_min) * t.multiplier);
  if p_class='fastest' then p := p + t.fastest_surcharge; end if;
  return ceil(p/10)*10;
end $$;

create or replace function public.estimate_trip(p_from_lat double precision, p_from_lng double precision, p_to_lat double precision, p_to_lng double precision)
returns jsonb language plpgsql stable set search_path=public as $$
declare z uuid; km numeric; mins numeric;
begin
  z := public.nearest_zone(p_from_lat,p_from_lng);
  km := greatest(0.5, round((public.km_between(p_from_lat,p_from_lng,p_to_lat,p_to_lng)*1.3)::numeric, 1));
  mins := round(km/22*60 + 3);
  return jsonb_build_object('km',km,'min',mins,
    'fastest',public.calc_price(z,'fastest',km,mins),
    'economy',public.calc_price(z,'economy',km,mins),
    'comfort',public.calc_price(z,'comfort',km,mins));
end $$;
grant execute on function public.estimate_trip to anon, authenticated;

create or replace function public.nearby_drivers(p_lat double precision, p_lng double precision)
returns table(lat double precision, lng double precision, eta_min int, class text)
language sql stable security definer set search_path=public as $$
  select round(d.lat::numeric,4)::float8, round(d.lng::numeric,4)::float8,
    greatest(1, ceil(public.km_between(p_lat,p_lng,d.lat,d.lng)/25*60))::int, coalesce(v.class,'economy')
  from public.drivers d left join public.vehicles v on v.driver_id=d.user_id
  where d.online and d.status='approved' and d.location_updated_at > now() - interval '3 minutes'
    and public.km_between(p_lat,p_lng,d.lat,d.lng) < 5
    and not exists(select 1 from public.rides r where r.driver_id=d.user_id and r.status in ('driver_assigned','driver_arrived','in_progress'))
  order by 3 limit 10
$$;
grant execute on function public.nearby_drivers to authenticated;

create or replace function public.find_candidates(p_lat double precision, p_lng double precision, p_class text)
returns uuid[] language sql stable security definer set search_path=public as $$
  select coalesce(array_agg(user_id), '{}') from (
    select d.user_id from public.drivers d join public.vehicles v on v.driver_id=d.user_id
    join public.profiles p on p.id=d.user_id
    where d.online and d.status='approved' and not p.blocked
      and d.location_updated_at > now() - interval '3 minutes'
      and public.km_between(p_lat,p_lng,d.lat,d.lng) < 5
      and (p_class <> 'comfort' or v.class='comfort')
      and not exists(select 1 from public.rides r where r.driver_id=d.user_id and r.status in ('driver_assigned','driver_arrived','in_progress'))
    order by public.km_between(p_lat,p_lng,d.lat,d.lng) limit 5) s
$$;

create or replace function public.log_audit(p_action text, p_details jsonb) returns void
language sql security definer set search_path=public as $$
  insert into public.audit_log(actor, action, details) values (auth.uid(), p_action, p_details)
$$;

create or replace function public.create_ride(
  p_class text, p_from_addr text, p_from_lat double precision, p_from_lng double precision, p_entrance text,
  p_to_addr text, p_to_lat double precision, p_to_lng double precision,
  p_comment text, p_options jsonb, p_no_call boolean, p_idem text)
returns public.rides language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); r public.rides; z uuid; km numeric; mins numeric; c uuid[];
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if (select blocked from public.profiles where id=uid) then raise exception 'blocked'; end if;
  if p_class not in ('fastest','economy','comfort') then raise exception 'bad_class'; end if;
  select * into r from public.rides where passenger_id=uid and idempotency_key=p_idem;
  if r.id is not null then return r; end if;
  if exists(select 1 from public.rides where passenger_id=uid and status in ('searching','driver_assigned','driver_arrived','in_progress')) then
    raise exception 'active_ride_exists'; end if;
  z := public.nearest_zone(p_from_lat,p_from_lng);
  km := greatest(0.5, round((public.km_between(p_from_lat,p_from_lng,p_to_lat,p_to_lng)*1.3)::numeric,1));
  mins := round(km/22*60+3);
  c := public.find_candidates(p_from_lat,p_from_lng,p_class);
  insert into public.rides(passenger_id,status,class,zone_id,from_addr,from_lat,from_lng,entrance,to_addr,to_lat,to_lng,
    distance_km,duration_min,price,comment,options,no_call,idempotency_key,candidate_ids)
  values (uid, case when cardinality(c)=0 then 'no_drivers' else 'searching' end, p_class, z,
    left(p_from_addr,300),p_from_lat,p_from_lng,left(p_entrance,100),left(p_to_addr,300),p_to_lat,p_to_lng,
    km,mins,public.calc_price(z,p_class,km,mins),left(p_comment,500),coalesce(p_options,'{}'),coalesce(p_no_call,false),p_idem,c)
  returning * into r;
  insert into public.ride_events(ride_id,status,actor) values (r.id, r.status, uid);
  return r;
end $$;

create or replace function public.retry_ride(p_ride uuid) returns public.rides
language plpgsql security definer set search_path=public as $$
declare r public.rides; c uuid[];
begin
  select * into r from public.rides where id=p_ride and passenger_id=auth.uid() and status in ('no_drivers','searching');
  if r.id is null then raise exception 'not_found'; end if;
  c := public.find_candidates(r.from_lat,r.from_lng,r.class);
  update public.rides set candidate_ids=c, status = case when cardinality(c)=0 then 'no_drivers' else 'searching' end, created_at=now()
  where id=p_ride returning * into r;
  insert into public.ride_events(ride_id,status,actor) values (r.id, r.status, auth.uid());
  return r;
end $$;

create or replace function public.expire_search(p_ride uuid) returns void
language sql security definer set search_path=public as $$
  update public.rides set status='no_drivers' where id=p_ride and passenger_id=auth.uid() and status='searching'
$$;

create or replace function public.accept_ride(p_ride uuid) returns public.rides
language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); r public.rides;
begin
  if not exists(select 1 from public.drivers where user_id=uid and status='approved' and online) then raise exception 'not_online'; end if;
  if exists(select 1 from public.rides where driver_id=uid and status in ('driver_assigned','driver_arrived','in_progress')) then raise exception 'busy'; end if;
  update public.rides set driver_id=uid, status='driver_assigned', accepted_at=now(), candidate_ids='{}'
  where id=p_ride and status='searching' and driver_id is null and uid = any(candidate_ids)
  returning * into r;
  if r.id is null then raise exception 'already_taken'; end if;
  insert into public.ride_events(ride_id,status,actor) values (r.id,'driver_assigned',uid);
  return r;
end $$;

create or replace function public.decline_ride(p_ride uuid) returns void
language plpgsql security definer set search_path=public as $$
begin
  update public.rides set candidate_ids = array_remove(candidate_ids, auth.uid()) where id=p_ride and status='searching';
  update public.rides set status='no_drivers' where id=p_ride and status='searching' and cardinality(candidate_ids)=0;
end $$;

create or replace function public.advance_ride(p_ride uuid, p_status text) returns public.rides
language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); r public.rides;
begin
  select * into r from public.rides where id=p_ride and driver_id=uid for update;
  if r.id is null then raise exception 'not_found'; end if;
  if not ((r.status='driver_assigned' and p_status='driver_arrived') or
          (r.status='driver_arrived' and p_status='in_progress') or
          (r.status='in_progress' and p_status='completed')) then raise exception 'bad_transition'; end if;
  update public.rides set status=p_status,
    arrived_at = case when p_status='driver_arrived' then now() else arrived_at end,
    started_at = case when p_status='in_progress' then now() else started_at end,
    completed_at = case when p_status='completed' then now() else completed_at end
  where id=p_ride returning * into r;
  insert into public.ride_events(ride_id,status,actor) values (r.id,p_status,uid);
  if p_status='completed' then
    insert into public.payments(ride_id,amount) values (r.id, r.price) on conflict do nothing;
    update public.drivers set rides_count=rides_count+1 where user_id=uid;
  end if;
  return r;
end $$;

create or replace function public.cancel_ride(p_ride uuid) returns public.rides
language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); r public.rides;
begin
  update public.rides set status='cancelled', cancelled_at=now()
  where id=p_ride and ((passenger_id=uid and status in ('searching','driver_assigned','driver_arrived','no_drivers'))
     or (driver_id=uid and status in ('driver_assigned','driver_arrived')))
  returning * into r;
  if r.id is null then raise exception 'cannot_cancel'; end if;
  insert into public.ride_events(ride_id,status,actor) values (r.id,'cancelled',uid);
  return r;
end $$;

create or replace function public.rate_ride(p_ride uuid, p_stars int, p_comment text) returns void
language plpgsql security definer set search_path=public as $$
declare r public.rides;
begin
  select * into r from public.rides where id=p_ride and passenger_id=auth.uid() and status='completed';
  if r.id is null then raise exception 'not_found'; end if;
  insert into public.ratings(ride_id,from_user,to_user,stars,comment) values (r.id,auth.uid(),r.driver_id,least(5,greatest(1,p_stars)),left(p_comment,500))
  on conflict (ride_id) do nothing;
  update public.drivers set rating = (select round(avg(stars)::numeric,2) from public.ratings where to_user=r.driver_id) where user_id=r.driver_id;
end $$;

create or replace function public.trigger_sos(p_ride uuid, p_lat double precision, p_lng double precision) returns text
language plpgsql security definer set search_path=public as $$
begin
  insert into public.sos_events(ride_id,user_id,lat,lng) values (p_ride, auth.uid(), p_lat, p_lng);
  return (select value from public.app_config where key='emergency_phone');
end $$;

create or replace function public.ride_details(p_ride uuid) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare r public.rides; uid uuid := auth.uid();
begin
  select * into r from public.rides where id=p_ride;
  if r.id is null or not (r.passenger_id=uid or r.driver_id=uid or (r.status='searching' and uid=any(r.candidate_ids)) or public.has_role(uid,'admin')) then
    return null; end if;
  return jsonb_build_object(
    'ride', to_jsonb(r) - 'candidate_ids',
    'driver', (select jsonb_build_object('name',p.full_name,'phone',case when r.no_call then null else p.phone end,
        'rating',d.rating,'lat',d.lat,'lng',d.lng,'make',v.make,'model',v.model,'color',v.color,'plate',v.plate)
      from public.drivers d join public.profiles p on p.id=d.user_id left join public.vehicles v on v.driver_id=d.user_id
      where d.user_id=r.driver_id),
    'passenger', (select jsonb_build_object('name',p.full_name,'phone',p.phone,
        'show_location', coalesce(s.show_location,true))
      from public.profiles p left join public.user_settings s on s.user_id=p.id where p.id=r.passenger_id),
    'rated', exists(select 1 from public.ratings where ride_id=r.id));
end $$;

create or replace function public.get_shared_ride(p_token text) returns jsonb
language sql stable security definer set search_path=public as $$
  select jsonb_build_object('status',r.status,'from_addr',r.from_addr,'to_addr',r.to_addr,
    'from_lat',r.from_lat,'from_lng',r.from_lng,'to_lat',r.to_lat,'to_lng',r.to_lng,
    'driver_lat',d.lat,'driver_lng',d.lng,'car',concat_ws(' ',v.color,v.make,v.model),'plate',v.plate,
    'driver_name', split_part(p.full_name,' ',1))
  from public.rides r left join public.drivers d on d.user_id=r.driver_id
  left join public.vehicles v on v.driver_id=r.driver_id left join public.profiles p on p.id=r.driver_id
  where r.share_token=p_token and r.created_at > now() - interval '1 day'
$$;
grant execute on function public.get_shared_ride to anon, authenticated;

create or replace function public.driver_apply(p_make text, p_model text, p_color text, p_plate text, p_year int, p_class text)
returns void language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid();
begin
  insert into public.user_roles(user_id,role) values (uid,'driver') on conflict do nothing;
  if not exists(select 1 from public.profiles where id=uid and phone is not null) then raise exception 'phone_required'; end if;
  if (select count(*) from public.documents where driver_id=uid) < 4 then raise exception 'documents_required'; end if;
  insert into public.vehicles(driver_id,make,model,color,plate,year,class)
  values (uid,left(p_make,50),left(p_model,50),left(p_color,30),upper(left(p_plate,15)),p_year,case when p_class='comfort' then 'comfort' else 'economy' end)
  on conflict (driver_id) do update set make=excluded.make, model=excluded.model, color=excluded.color, plate=excluded.plate, year=excluded.year, class=excluded.class;
  insert into public.drivers(user_id,status) values (uid,'pending')
  on conflict (user_id) do update set status = case when public.drivers.status='approved' then 'approved' else 'pending' end, reject_reason=null;
end $$;

create or replace function public.driver_become() returns void
language plpgsql security definer set search_path=public as $$
begin
  insert into public.user_roles(user_id,role) values (auth.uid(),'driver') on conflict do nothing;
  insert into public.drivers(user_id,status) values (auth.uid(),'draft') on conflict do nothing;
end $$;

create or replace function public.driver_set_online(p_online boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
  if p_online and not exists(select 1 from public.drivers d join public.profiles p on p.id=d.user_id where d.user_id=auth.uid() and d.status='approved' and not p.blocked) then
    raise exception 'not_approved'; end if;
  update public.drivers set online=p_online where user_id=auth.uid();
end $$;

create or replace function public.driver_update_location(p_lat double precision, p_lng double precision) returns void
language sql security definer set search_path=public as $$
  update public.drivers set lat=p_lat, lng=p_lng, location_updated_at=now() where user_id=auth.uid()
$$;

create or replace function public.admin_moderate_driver(p_user uuid, p_approve boolean, p_reason text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.drivers set status = case when p_approve then 'approved' else 'rejected' end,
    reject_reason = case when p_approve then null else p_reason end, online = case when p_approve then online else false end
  where user_id=p_user;
  perform public.log_audit(case when p_approve then 'driver_approved' else 'driver_rejected' end, jsonb_build_object('user',p_user,'reason',p_reason));
end $$;

create or replace function public.admin_block_user(p_user uuid, p_blocked boolean) returns void
language plpgsql security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.profiles set blocked=p_blocked where id=p_user;
  if p_blocked then update public.drivers set online=false where user_id=p_user; end if;
  perform public.log_audit(case when p_blocked then 'user_blocked' else 'user_unblocked' end, jsonb_build_object('user',p_user));
end $$;

create or replace function public.admin_stats() returns jsonb
language plpgsql stable security definer set search_path=public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'rides', (select count(*) from public.rides),
    'completed', (select count(*) from public.rides where status='completed'),
    'revenue', (select coalesce(sum(amount),0) from public.payments),
    'online', (select count(*) from public.drivers where online),
    'avg_rating', (select round(coalesce(avg(stars),0)::numeric,2) from public.ratings),
    'users', (select count(*) from public.profiles),
    'pending_drivers', (select count(*) from public.drivers where status='pending'),
    'by_day', (select coalesce(jsonb_agg(x order by x->>'day'),'[]') from (
       select jsonb_build_object('day', to_char(g::date,'YYYY-MM-DD'),
         'rides', (select count(*) from public.rides where created_at::date=g::date),
         'revenue', (select coalesce(sum(p.amount),0) from public.payments p where p.created_at::date=g::date)) x
       from generate_series(current_date - 13, current_date, interval '1 day') g) s));
end $$;

create or replace function public.audit_trigger() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.audit_log(actor, action, details) values (auth.uid(), TG_TABLE_NAME || '_' || lower(TG_OP), to_jsonb(coalesce(new, old)) - 'body');
  return coalesce(new, old);
end $$;
create trigger audit_legal after insert or update on public.legal_documents for each row execute function public.audit_trigger();
create trigger audit_tariffs after insert or update or delete on public.tariffs for each row execute function public.audit_trigger();
create trigger audit_config after update on public.app_config for each row execute function public.audit_trigger();

create policy "driver uploads own docs" on storage.objects for insert to authenticated
  with check (bucket_id='driver-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "driver updates own docs" on storage.objects for update to authenticated
  using (bucket_id='driver-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "driver reads own docs or admin" on storage.objects for select to authenticated
  using (bucket_id='driver-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
