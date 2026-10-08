import { useEffect } from 'react';
// @ts-ignore — lenis types may not be bundled
import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function useSmoothScroll(resetKey?: string) {
  useEffect(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    let raf: number;
    function loop(time: number) {
      lenis!.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis!.destroy();
      lenis = null;
    };
  }, []);

  // scroll to top on portal change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [resetKey]);
}
