// Dark banner used at the top of information pages (Track Order, Terms, Realm Coins…).
export default function PageHero({ label, title, text, icon: Icon, children, compact = false }) {
  return (
    <section className={`page-hero ${compact ? 'compact' : ''}`}>
      <div className="container page-hero-inner">
        {Icon && <span className="page-hero-icon"><Icon width={26} height={26} /></span>}
        {label && <span className="page-hero-label">{label}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        {children}
      </div>
    </section>
  );
}
