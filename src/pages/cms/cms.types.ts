export type CmsCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  buttonLabel?: string;
  accent?: string;
};
export type GalleryCategory = {
  id: string;
  title: string;
  image: string;
  productTitle: string;
};
export type ProductShelf = {
  id: string;
  title: string;
  category: string;
  productImage: string | null;
  viewAllHref: string;
};
export type HomeModule = {
  key: string;
  title: string;
  description: string;
  image: string;
  enabled: boolean;
  buttonLabel: string;
  destination: { type: string; value: string | null };
};
export type HomeGalleryItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  destination: { type: string; value: string | null };
};
export type GalleryCms = {
  key: string;
  hero: { slides: CmsCard[] };
  categories: {
    initialVisible: number;
    revealStep: number;
    items: GalleryCategory[];
  };
  promos: CmsCard[];
  productShelves: ProductShelf[];
  genderBanners: CmsCard[];
  collections: CmsCard[];
  benefits: unknown[];
  newsletter: Record<string, unknown>;
  updatedAt: string;
};
export type HomeCms = {
  key: string;
  hero: {
    eyebrow: string;
    title: string;
    highlightedTitle: string;
    description: string;
    image: string;
    mobileImage: string | null;
    buttonLabel: string;
    destination: { type: string; value: string | null };
  };
  gallery: {
    title: string;
    viewAll: { label: string; destination: { type: string; value: string | null } };
    items: HomeGalleryItem[];
  };
  modules: { title: string; items: HomeModule[] };
  benefits: unknown;
  market: unknown;
  infoCards: unknown;
  updatedAt: string;
};
export type ProductDestination = {
  category?: "JEWELRY" | "COIN" | "BULLION";
  gender?: "WOMAN" | "MAN" | "UNISEX" | "KID";
  metal?: "GOLD" | "SILVER";
  label?: string;
  subtype?: string;
};
