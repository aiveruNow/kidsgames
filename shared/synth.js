// FÃ¦lles lydsyntese (Web Audio) til spil med korte toner. Spillet ejer selv, om lyden er slÃ¥et fra:
//   const { audio, tone, buzz } = KidsSynth.create(() => muted);
// audio() giver (og vÃ¦kker) den fÃ¦lles AudioContext, tone() spiller en kort tone, og buzz() vibrerer.
window.KidsSynth = (() => {
  "use strict";

  function create(isMuted) {
    let ac = null;
    function audio() {
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
      if (ac && ac.state === "suspended") ac.resume();
      return ac;
    }
    function tone(freq, dur = .15, type = "sine", vol = .12, delay = 0, slide = 0) {
      if (isMuted()) return;
      const a = audio();
      if (!a) return;
      const t = a.currentTime + delay;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + .012);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + dur + .03);
    }
    const buzz = (ms) => { if (!isMuted() && navigator.vibrate) navigator.vibrate(ms); };
    return { audio, tone, buzz };
  }

  return { create };
})();
