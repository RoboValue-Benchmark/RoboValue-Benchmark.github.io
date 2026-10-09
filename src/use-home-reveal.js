import { useEffect, useRef } from 'react';

// Enhance off-screen content only; an observer never hides the initial view.
export function useHomeReveal() {
  const root = useRef(null);

  useEffect(() => {
    const container = root.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!container || motion.matches || !('IntersectionObserver' in window)) return;

    const targets = [...container.querySelectorAll('.rv-reveal')];
    const pending = new Set();
    const entryInset = Math.min(96, Math.round(window.innerHeight * .12));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !pending.has(entry.target)) continue;
        pending.delete(entry.target);
        observer.unobserve(entry.target);
        entry.target.classList.remove('rv-reveal-pending');
        entry.target.classList.add('rv-reveal-enter');
      }
    }, { rootMargin: `0px 0px -${entryInset}px 0px`, threshold: 0 });

    const showImmediately = element => {
      if (!element) return;
      pending.delete(element);
      observer.unobserve(element);
      element.classList.remove('rv-reveal-pending', 'rv-reveal-enter');
    };
    const showAnchor = () => {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const anchor = document.getElementById(id);
      if (!anchor || !container.contains(anchor)) return;
      for (const target of targets) {
        if (anchor.contains(target) || target.contains(anchor)) showImmediately(target);
      }
    };
    const showFocused = event => showImmediately(event.target.closest('.rv-reveal'));
    const finishAnimation = event => {
      if (event.animationName === 'rv-content-reveal') event.target.classList.remove('rv-reveal-enter');
    };
    const reduceMotion = () => {
      if (!motion.matches) return;
      observer.disconnect();
      targets.forEach(showImmediately);
    };

    for (const target of targets) {
      if (target.getBoundingClientRect().top < window.innerHeight || target.contains(document.activeElement)) continue;
      pending.add(target);
      target.classList.add('rv-reveal-pending');
      observer.observe(target);
    }
    showAnchor();
    container.addEventListener('focusin', showFocused);
    container.addEventListener('animationend', finishAnimation);
    window.addEventListener('hashchange', showAnchor);
    motion.addEventListener('change', reduceMotion);

    return () => {
      observer.disconnect();
      targets.forEach(showImmediately);
      container.removeEventListener('focusin', showFocused);
      container.removeEventListener('animationend', finishAnimation);
      window.removeEventListener('hashchange', showAnchor);
      motion.removeEventListener('change', reduceMotion);
    };
  }, []);

  return root;
}
