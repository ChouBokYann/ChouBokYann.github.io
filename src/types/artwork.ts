export interface ArtworkLayer {
  src: string;
  alt: '';
  width: number;
  height: number;
  depth: number;
}

export interface ArtworkScene {
  firstFrame: {
    src: string;
    width: number;
    height: number;
    alt: string;
    rendering?: 'auto' | 'pixelated';
  };
  ambientLayers?: ArtworkLayer[];
}
