/*
  Backdrop continuity.

  The wave is meant to read as one continuous shot behind the whole journey —
  that is the point of giving the media a shared `hero-media` view-transition
  name. But every navigation built a fresh <video>, so playback snapped back to
  0:00 at each step and the wave visibly jumped exactly at the moment the
  transition was trying to carry it across. Measured: 2.46s on index.html became
  0.35s one navigation later.

  Handing the position along in sessionStorage fixes that. Session-scoped
  deliberately: a new tab is a new demo and should open on the composed first
  frame the poster was cut from.

  The clip is authored as a seamless loop (frame 0 and frame 29.9 are the same
  image), so wrapping with % duration never shows a seam.
*/
(() => {
  const KEY = "hiver-omni-backdrop-time-v2";
  const video = document.querySelector("video[data-continuous]");
  if (!video) return;

  const read = () => {
    try {
      const saved = Number(sessionStorage.getItem(KEY));
      return Number.isFinite(saved) && saved > 0 ? saved : 0;
    } catch {
      return 0;
    }
  };

  const write = (value) => {
    try {
      sessionStorage.setItem(KEY, String(value));
    } catch {
      /* private mode — continuity is a nicety, never a hard dependency */
    }
  };

  function resume() {
    const saved = read();
    if (!saved || !video.duration || !Number.isFinite(video.duration)) return;

    /*
      The poster is frame 0. Keeping it while we seek elsewhere would flash the
      wrong frame before the right one, so it is dropped the moment we know we
      are resuming mid-clip. The element keeps its own painted frame until the
      seek completes, so nothing white shows through.
    */
    video.removeAttribute("poster");
    video.currentTime = saved % video.duration;
  }

  if (video.readyState >= 1) resume();
  else video.addEventListener("loadedmetadata", resume, { once: true });

  /*
    timeupdate fires ~4x/second, which is finer than needed and would mean a
    storage write per tick. Sampling on a timer keeps it to one write a second,
    and pagehide catches the real handoff — including the bfcache path, where
    unload never fires.
  */
  let sampler;
  const startSampling = () => {
    window.clearInterval(sampler);
    sampler = window.setInterval(() => {
      if (!video.paused) write(video.currentTime);
    }, 1000);
  };

  video.addEventListener("playing", startSampling);
  if (!video.paused) startSampling();

  window.addEventListener("pagehide", () => {
    window.clearInterval(sampler);
    write(video.currentTime);
  });

  /*
    Autoplay can be refused (a background tab, a strict policy) and the backdrop
    would then sit frozen on one frame. Retrying when the tab becomes visible
    costs nothing and recovers the common case.
  */
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && video.paused) {
      video.play().catch(() => {});
    }
  });
})();
