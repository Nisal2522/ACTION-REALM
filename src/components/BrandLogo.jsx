import { SITE } from '../config/site';

// Brand lockup: the "R" mark + the ACTION REALM wordmark (both transparent PNGs cut from the
// official logo, so the lettering is the real brand font) + the slogan underneath.
// White artwork in dark mode, brand red in light mode (swapped in CSS).
export default function BrandLogo({ size = 'md', slogan = true }) {
  return (
    <span className={`brand-logo-lockup ${size}`}>
      <span className="bl-mark">
        <img src="/brand/mark-white.png" alt="" className="on-dark" />
        <img src="/brand/mark-red.png" alt="" className="on-light" />
      </span>
      <span className="bl-text">
        <span className="bl-word">
          <img src="/brand/wordmark-white.png" alt={SITE.name} className="on-dark" />
          <img src="/brand/wordmark-red.png" alt={SITE.name} className="on-light" />
        </span>
        {slogan && SITE.slogan && <span className="bl-slogan">{SITE.slogan}</span>}
      </span>
    </span>
  );
}
