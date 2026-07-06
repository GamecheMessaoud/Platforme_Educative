import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-entity': any;
      'a-camera': any;
      'a-cursor': any;
      'a-box': any;
      'a-plane': any;
      'a-sky': any;
      'a-text': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-sphere': any;
      'a-cylinder': any;
      'a-image': any;
      'a-video': any;
      'a-light': any;
      'a-link': any;
      'a-sound': any;
      'a-curve': any;
      'a-draw-curve': any;
      'a-marker': any;
    }
  }
}
