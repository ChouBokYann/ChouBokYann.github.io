import { motionAllowed } from './preferences';

type AnimeModule = typeof import('animejs');

let activeObserver: IntersectionObserver | undefined;

function markEnhanced(elements: HTMLElement[]): void {
  elements.forEach((element) => {
    element.dataset.motionState = 'enhanced';
  });
}

function runReveal(elements: HTMLElement[], anime: AnimeModule, delay = 0): void {
  if (elements.length === 0) return;

  markEnhanced(elements);
  anime.animate(elements, {
    opacity: { from: 0, to: 1 },
    y: { from: 18, to: 0 },
    delay: anime.stagger(72, { start: delay }),
    duration: 720,
    ease: 'out(4)',
  });
}

function runAmbientLayers(root: ParentNode, anime: AnimeModule): void {
  const layers = Array.from(
    root.querySelectorAll<HTMLElement>('[data-ambient-layer]:not([data-motion-state])'),
  );

  layers.forEach((layer) => {
    const depth = Number.parseFloat(layer.dataset.depth ?? '0');
    if (!Number.isFinite(depth) || depth === 0) return;

    layer.dataset.motionState = 'enhanced';
    const travel = Math.max(-10, Math.min(10, depth * 1.5));
    anime.animate(layer, {
      x: [{ to: travel }, { to: 0 }],
      y: [{ to: travel * -0.45 }, { to: 0 }],
      duration: 9000 + Math.abs(depth) * 500,
      ease: 'inOut(2)',
      loop: true,
      alternate: true,
    });
  });
}

export async function enhanceMotion(root: ParentNode = document): Promise<void> {
  if (!motionAllowed()) return;

  const targets = Array.from(
    root.querySelectorAll<HTMLElement>('[data-reveal]:not([data-motion-state])'),
  );
  const ambientLayers = root.querySelector('[data-ambient-layer]:not([data-motion-state])');
  if (targets.length === 0 && !ambientLayers) return;

  const anime = await import('animejs');
  activeObserver?.disconnect();
  activeObserver = undefined;

  const heroTargets = targets.filter((target) => target.dataset.reveal === 'hero');
  const scrollTargets = targets.filter((target) => target.dataset.reveal !== 'hero');

  runReveal(heroTargets, anime, 90);
  runAmbientLayers(root, anime);

  if (scrollTargets.length === 0) return;

  if (typeof globalThis.IntersectionObserver !== 'function') {
    runReveal(scrollTargets, anime);
    return;
  }

  const pending = new Set(scrollTargets);
  activeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target as HTMLElement;
        runReveal([target], anime);
        pending.delete(target);
        observer.unobserve(target);
      });

      if (pending.size === 0) {
        observer.disconnect();
        activeObserver = undefined;
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
  );

  scrollTargets.forEach((target) => activeObserver?.observe(target));
}
