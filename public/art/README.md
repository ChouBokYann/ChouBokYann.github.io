# Owner-approved hero art contract

The intended scene is a warm cinematic dawn with a red Kansai-inspired Japanese bridge, cherry blossoms, and a dark restrained field. This direction is not approval to invent the final bridge, people, portrait, or photography. The website intentionally renders no art until the owner approves a scene.

## Required delivery

- One meaningful static first frame with exact intrinsic width and height.
- Approved alt text that describes the scene's useful visual meaning.
- Optional transparent ambient layers, each exported at the first frame's dimensions with an empty alt value.
- Source files, creator attribution, license or ownership notes, and export settings.
- Desktop and mobile crop references approved by the owner.

## Pixel-art production rules

- Establish the native pixel canvas, palette, composition, bridge reference, and presence or absence of people during owner review.
- Export at an integer scale. Set `rendering: 'pixelated'` only for an intentionally pixel-scaled final export.
- Preserve one readable silhouette and one vermilion focal area. Do not add a game HUD, train, decorative copy, or generic stock-photo treatment.
- Keep the static first frame complete on its own. Ambient layers may add atmosphere but cannot carry essential content.

## Motion budget

- Ambient layers drift only on transform axes, with depth values kept between -6 and 6.
- The enhancement uses slow 9-12 second cycles and stops entirely for reduced-motion visitors.
- Avoid flashing, rapid particles, large parallax travel, and motion that competes with project evidence.
- Review the static frame first, then the animated desktop crop, then the mobile crop before acceptance.
