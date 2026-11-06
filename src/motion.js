/* Eric.exe — motion layer (from skills/taste-skill references/motion.md).
   CSS scroll-driven reveals + one signature wordmark scale. No library, respects prefers-reduced-motion.
   Motion values: expo-out reveals 800ms, staggered by content; signature scales with scroll. */

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mark body so CSS can hide [data-reveal] until observed */
  document.body.classList.add('js-loaded');

  if (reduce) {
    /* in reduced-motion mode, immediately show all reveals */
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  /* --- reveals: elements with [data-reveal] rise into place once they enter ---
     The CSS animation (index.css) handles the visual; JS only toggles the class. */
  const revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('is-visible'));
  }

  /* --- signature: the giant "Eric.exe" scales with scroll (travel < 8%) --- */
  const wordmark = document.querySelector('[data-wordmark]');
  if (wordmark) {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wordmark.getBoundingClientRect();
        const viewH = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (viewH + rect.height)));
        const scale = 1 + progress * 0.06;
        wordmark.style.transform = `scale(${scale})`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- one moving picture: the hero portrait breathes via CSS (index.css).
     It is inside an overflow-hidden frame, so the drift never widens the page. */
})();
