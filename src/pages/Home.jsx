import { CATEGORIES, FRANCHISES, useProducts } from '../data/products';
import useTitle from '../hooks/useTitle';
import {
  BrandMarquee, CharacterGrid, CollectionGrid, Faq, HeroCarousel, Perks, ProductRail, ProductTabs,
  RecentlyViewed, Testimonials,
} from '../components/HomeSections';

export default function Home() {
  useTitle();
  const products = useProducts();
  return (
    <>
      <HeroCarousel />
      <BrandMarquee />
      <Perks />
      <ProductTabs />
      <CharacterGrid />
      <CollectionGrid title="Shop By Category" names={CATEGORIES} />
      <ProductRail title="Collector's Picks" products={products.filter((p) => p.featured)} to="/collections/all" />
      <CollectionGrid title="Shop By Franchise" names={FRANCHISES} />
      <ProductRail title="Trending: Marvel" products={products.filter((p) => p.franchise === 'Marvel')} to="/collections/marvel" />
      <RecentlyViewed />
      <Testimonials />
      <Faq />
    </>
  );
}
