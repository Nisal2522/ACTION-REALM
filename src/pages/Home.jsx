import { SITE } from '../config/site';
import { getCategories, useProducts } from '../data/products';
import { collectionUrl } from '../data/collections';
import useTitle from '../hooks/useTitle';
import {
  BrandMarquee, CharacterGrid, CollectionGrid, Faq, HeroCarousel, Perks, ProductRail, ProductTabs,
  RecentlyViewed, Testimonials,
} from '../components/HomeSections';

// Section order and visibility are set in Admin → Homepage → Layout.
export default function Home() {
  useTitle();
  const products = useProducts();
  const trending = SITE.trendingFranchise;

  const SECTIONS = {
    hero: () => <HeroCarousel />,
    brands: () => <BrandMarquee />,
    perks: () => <Perks />,
    tabs: () => <ProductTabs />,
    characters: () => <CharacterGrid />,
    categories: () => <CollectionGrid title={SITE.homeTitles.categories} names={getCategories()} />,
    picks: () => <ProductRail title={SITE.homeTitles.picks} products={products.filter((p) => p.featured)} to="/collections/all" variant="showcase" />,
    trending: () => trending && (
      <ProductRail title={`${SITE.homeTitles.trending}: ${trending}`} products={products.filter((p) => p.franchise === trending).slice(0, 10)} to={collectionUrl(trending)} variant="ranked" />
    ),
    recent: () => <RecentlyViewed />,
    testimonials: () => <Testimonials />,
    faq: () => <Faq />,
  };

  return (
    <>
      {SITE.homeSections
        .filter((s) => s.enabled && SECTIONS[s.id])
        .map((s) => <div key={s.id} className="home-section">{SECTIONS[s.id]()}</div>)}
    </>
  );
}
