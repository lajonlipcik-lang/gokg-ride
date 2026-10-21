/**
 * Мягкий звук подъезжающей и плавно останавливающейся машины.
 * Синтезируется через WebAudio API — внешний аудиофайл не нужен,
 * работает в Lovable из коробки.
 *
 * Возвращает функцию очистки (останавливает звук и снимает обработчики).
 */
export function playArrivalSound(): () => void {
  if (typeof window === "undefined") return () => {};

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return () => {};

  let ctx: AudioContext;
  try {
    ctx = new Ctor();
  } catch {
    return () => {};
  }

  let scheduled = false;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;

    const now = ctx.currentTime;
    const dur = 1.7; // длительность «подъезда»

    const master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);

    // Буфер белого шума (дорога / шины).
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // Шум дороги: частота фильтра падает — ощущение плавного торможения.
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(950, now);
    band.frequency.exponentialRampToValueAtTime(240, now + dur);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.0001, now);
    nGain.gain.exponentialRampToValueAtTime(0.38, now + 0.5);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    noise.connect(band);
    band.connect(nGain);
    nGain.connect(master);
    noise.start(now);
    noise.stop(now + dur);

    // Низкий гул мотора, тоже снижающийся к остановке.
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(72, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + dur);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 220;
    const oGain = ctx.createGain();
    oGain.gain.setValueAtTime(0.0001, now);
    oGain.gain.exponentialRampToValueAtTime(0.09, now + 0.4);
    oGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(lp);
    lp.connect(oGain);
    oGain.connect(master);
    osc.start(now);
    osc.stop(now + dur);

    // Мягкий «вздох» остановки в самом конце.
    const stopT = now + dur - 0.2;
    const puff = ctx.createBufferSource();
    puff.buffer = buf;
    const puffF = ctx.createBiquadFilter();
    puffF.type = "lowpass";
    puffF.frequency.value = 480;
    const puffG = ctx.createGain();
    puffG.gain.setValueAtTime(0.0001, stopT);
    puffG.gain.exponentialRampToValueAtTime(0.2, stopT + 0.03);
    puffG.gain.exponentialRampToValueAtTime(0.0001, stopT + 0.3);
    puff.connect(puffF);
    puffF.connect(puffG);
    puffG.connect(master);
    puff.start(stopT);
    puff.stop(stopT + 0.32);
  };

  let detach: (() => void) | null = null;

  if (ctx.state === "running") {
    schedule();
  } else {
    // Автовоспроизведение заблокировано до первого касания — запускаем при касании.
    const resume = () => {
      ctx
        .resume()
        .then(schedule)
        .catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
    detach = () => window.removeEventListener("pointerdown", resume);
  }

  return () => {
    detach?.();
    ctx.close().catch(() => {});
  };
}
