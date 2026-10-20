export type Me = {
  id: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
};

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: string;
  mrp: string | null;
  is_featured: boolean;
  image_url: string | null;
  status: string;
  item_id?: string;
  quantity?: number;
};

export type PageResult<T> = {
  items: T[];
  page: number;
  page_size: number;
  total: number;
};

export type Category = { id: string; parent_id: string | null; name: string; slug: string };
export type Named = { id: string; name: string; slug: string };

export type Section = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  config: Record<string, unknown>;
  sort_order: number;
  products: ProductCard[];
  categories: Category[];
  banners: { id: string; title: string; link_url: string; image_url: string | null }[];
  campaign_id: string | null;
};

export type HomePageData = {
  id: string;
  slug: string;
  title: string;
  status: string;
  sections: Section[];
  active_campaign: { id: string; name: string; slug: string; description: string } | null;
};
