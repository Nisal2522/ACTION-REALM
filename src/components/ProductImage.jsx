import { useId, useState } from 'react';
import { productColors } from '../data/products';

// Shows product.image with a shimmer while it loads; falls back to generated artwork
// if there is no image or it fails. Variant 2 is a close-up crop (used on category tiles).
export default function ProductImage({ product, variant = 0, className = '', eager = false }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  if (product.image && failedSrc !== product.image) {
    const loaded = loadedSrc === product.image;
    return (
      <span className={`img-wrap ${loaded ? 'loaded' : 'loading'}`}>
        <img
          src={product.image}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          className={`product-img photo v${variant % 3} ${className}`}
          onLoad={() => setLoadedSrc(product.image)}
          onError={() => setFailedSrc(product.image)}
        />
      </span>
    );
  }
  return <Placeholder product={product} variant={variant} className={className} />;
}

function Placeholder({ product, variant, className }) {
  const gid = useId().replace(/:/g, '');
  const [c1, c2] = productColors(product);
  const transform = ['', 'translate(400 0) scale(-1 1)', 'translate(-100 -60) scale(1.5)'][variant % 3];

  return (
    <svg viewBox="0 0 400 500" className={`product-img ${className}`} role="img" aria-label={product.name}>
      <defs>
        <radialGradient id={`bg${gid}`} cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        <linearGradient id={`fig${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#bg${gid})`} />
      <g opacity="0.12" stroke="#fff">
        {[80, 160, 240, 320].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="500" />)}
      </g>
      <g transform={transform}>
        <ellipse cx="200" cy="445" rx="125" ry="20" fill="rgba(0,0,0,.45)" />
        <rect x="95" y="410" width="210" height="32" rx="6" fill="rgba(0,0,0,.6)" />
        <g fill={`url(#fig${gid})`}>
          <circle cx="200" cy="140" r="38" />
          <path d="M148 192 Q200 172 252 192 L285 290 L262 300 L240 240 L236 410 L210 410 L200 318 L190 410 L164 410 L160 240 L138 300 L115 290 Z" />
        </g>
      </g>
      <text x="200" y="58" textAnchor="middle" fill="rgba(255,255,255,.9)" fontSize="22" fontWeight="800" letterSpacing="5" fontFamily="Bebas Neue, sans-serif">
        {(product.franchise || '').toUpperCase()}
      </text>
    </svg>
  );
}
