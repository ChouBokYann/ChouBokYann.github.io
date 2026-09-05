
type RevertibleAnimation = { revert: () => unknown };

export function setupHeroMotion(scope: ParentNode = document): void {
  const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  scope.querySelectorAll<HTMLElement>('[data-hero-artwork]').forEach((artwork) => {
    if (artwork.dataset.heroMotion) return;

    const character = artwork.querySelector<HTMLElement>('[data-motion-layer="person"]');
    const alignCharacter = () => {
      if (!character) return;
      const ratio = matchMedia('(orientation: portrait)').matches ? 941 / 1672 : matchMedia('(min-aspect-ratio: 2/1)').matches ? 1915 / 821 : 1672 / 941;
      const width = Math.max(artwork.clientWidth, artwork.clientHeight * ratio);
      const height = width / ratio;
      for (const layer of [character, artwork.querySelector<HTMLElement>('[data-structured-trees]')]) {
      if (!layer) continue;
      Object.assign(layer.style, {
        width: `${width}px`, height: `${height}px`,
        left: `${(artwork.clientWidth - width) / 2}px`,
        top: `${(artwork.clientHeight - height) / 2}px`,
      });
      }
    };
    const resize = new ResizeObserver(alignCharacter);
    resize.observe(artwork);
    alignCharacter();
    let onscreen = true;
    const pauseAtmosphere = () => artwork.toggleAttribute('data-atmosphere-paused', !onscreen || document.hidden);
    const visibility = new IntersectionObserver(([entry]) => { onscreen = entry?.isIntersecting ?? false; pauseAtmosphere(); });
    visibility.observe(artwork);
    document.addEventListener('visibilitychange', pauseAtmosphere);
    document.addEventListener('astro:before-swap', () => { visibility.disconnect(); document.removeEventListener('visibilitychange', pauseAtmosphere); }, {once:true});
    document.addEventListener('astro:before-swap', () => resize.disconnect(), { once: true });

    if (reduceMotion) {
      artwork.dataset.heroMotion = 'reduced';
      return;
    }

    // Keep the plate still until branch cutouts and their clean background exist.
    // Warping the plate also bends the sky between branches, which is not sway.
    const person = artwork.querySelector<HTMLButtonElement>('[data-motion-layer="person"]');
    const animations: RevertibleAnimation[] = [];


    if (person) {
      const sprite = person.querySelector<HTMLElement>('.hero-artwork__wave');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const frames = [0, 1, 2, 3, 2, 3, 2, 1, 0];
      const settle = () => {
        clearTimeout(timer);
        person.dataset.personMotion = 'idle';
        if (sprite) sprite.style.backgroundPositionX = '0%';
        delete person.dataset.frame;
      };
      const activate = () => {
        if (person.dataset.personMotion === 'active' || !sprite) return;
        person.dataset.personMotion = 'active';
        let index = 0;
        const advance = () => {
          const frame = frames[index++];
          if (frame === undefined) { settle(); return; }
          sprite.style.backgroundPositionX = `${frame * 100 / 3}%`;
          person.dataset.frame = String(frame);
          timer = setTimeout(advance, 190);
        };
        advance();
      };
      person.addEventListener('pointerenter', activate);
      person.addEventListener('pointerleave', settle);
      person.addEventListener('focus', activate);
      person.addEventListener('blur', settle);
      person.addEventListener('click', activate);
      document.addEventListener('astro:before-swap', settle, { once: true });
    }

    artwork.dataset.heroMotion = 'running';
    document.addEventListener(
      'astro:before-swap',
      () => animations.forEach((animation) => animation.revert()),
      { once: true },
    );
  });
}
