import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { api, mediaUrl } from "../../shared/api/http";
import type { Category, Named, PageResult, ProductCard } from "../../shared/api/types";
import { formatInr } from "../../shared/format";
import { Notice, buttonClass, quietButton, usePageMeta } from "../../shared/ui";

type ProductDetail = ProductCard & {
  description: string;
  sku: string;
  categories: Category[];
  attributes: { id: string; name: string; value: string }[];
  media: { id: string; url: string }[];
  brand: Named | null;
  manufacturer: Named | null;
};

function ProductGrid({ products }: { products: ProductCard[] }) {
  if (products.length === 0) {
    return <Notice kind="empty" message="No products to show." />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link key={product.id} to={`/products/${product.slug}`} className="rounded-2xl border border-marigold/50 bg-white p-4">
          {product.image_url ? <img alt="" src={mediaUrl(product.image_url) ?? ""} className="mb-3 h-36 w-full rounded-xl object-cover" /> : null}
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-saffron-deep">{formatInr(product.price)}</p>
        </Link>
      ))}
    </div>
  );
}

export function CategoriesPage() {
  const [rows, setRows] = useState<Category[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Categories · Mahavir Farsan Mart", "Browse farsan and sweet categories.");
  useEffect(() => {
    api<Category[]>("/api/v1/categories", { auth: false }).then(setRows).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load categories"));
  }, []);
  if (error) return <Notice kind="error" message={error} />;
  if (!rows) return <Notice kind="loading" message="Loading categories…" />;
  if (rows.length === 0) return <Notice kind="empty" message="No categories yet." />;
  return (
    <div className="flex flex-wrap gap-3">
      {rows.map((row) => (
        <Link key={row.id} to={`/categories/${row.slug}`} className="rounded-full border border-saffron/40 bg-white px-4 py-2">
          {row.name}
        </Link>
      ))}
    </div>
  );
}

export function CategoryPage() {
  const { slug = "" } = useParams();
  const [title, setTitle] = useState(slug);
  const [products, setProducts] = useState<ProductCard[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta(`${title} · Mahavir Farsan Mart`, `Products in ${title}.`);
  useEffect(() => {
    let cancelled = false;
    api<Category>(`/api/v1/categories/by-slug/${slug}`, { auth: false })
      .then(async (category) => {
        if (cancelled) return;
        setTitle(category.name);
        const page = await api<PageResult<ProductCard>>(`/api/v1/products?category_id=${category.id}`, { auth: false });
        if (!cancelled) setProducts(page.items);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Category not found");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  if (error) return <Notice kind="error" message={error} />;
  if (!products) return <Notice kind="loading" message="Loading products…" />;
  return (
    <div>
      <h1 className="mb-6 text-3xl font-semibold">{title}</h1>
      <ProductGrid products={products} />
    </div>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [products, setProducts] = useState<ProductCard[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Search · Mahavir Farsan Mart", "Search the Mahavir Farsan Mart catalog.");
  useEffect(() => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    api<PageResult<ProductCard>>(`/api/v1/products?${query.toString()}`, { auth: false })
      .then((page) => setProducts(page.items))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Search failed"));
  }, [q]);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setParams({ q: String(data.get("q") ?? "") });
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold">Search</h1>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input name="q" defaultValue={q} className="w-full rounded-lg border border-saffron/40 bg-white px-3 py-2" placeholder="Search products" />
        <button className={buttonClass}>Search</button>
      </form>
      <div className="mt-6">
        {error ? <Notice kind="error" message={error} /> : null}
        {!products && !error ? <Notice kind="loading" message="Searching…" /> : null}
        {products ? <ProductGrid products={products} /> : null}
      </div>
    </div>
  );
}

export function ProductPage() {
  const { slug = "" } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  usePageMeta(product ? `${product.name} · Mahavir Farsan Mart` : "Product · Mahavir Farsan Mart", product?.description || "Product details");
  useEffect(() => {
    api<ProductDetail>(`/api/v1/products/by-slug/${slug}`, { auth: false })
      .then(setProduct)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Product not found"));
  }, [slug]);
  async function add(path: string) {
    if (!product) return;
    try {
      await api(path, { method: "POST", body: JSON.stringify({ product_id: product.id, quantity: 1 }) });
      setNote("Saved.");
    } catch (reason: unknown) {
      setNote(reason instanceof Error ? reason.message : "Unable to save");
    }
  }
  if (error) return <Notice kind="error" message={error} />;
  if (!product) return <Notice kind="loading" message="Loading product…" />;
  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div>
        {product.media[0] ? <img alt="" src={mediaUrl(product.media[0].url) ?? ""} className="w-full rounded-2xl object-cover" /> : <div className="flex h-64 items-center justify-center rounded-2xl bg-marigold/30">No image</div>}
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="mt-2 text-xl text-saffron-deep">{formatInr(product.price)}</p>
        {product.mrp ? <p className="text-sm text-ink/60">MRP {formatInr(product.mrp)}</p> : null}
        <p className="mt-4 text-ink/80">{product.description}</p>
        <dl className="mt-4 space-y-1 text-sm">
          {product.attributes.map((row) => (
            <div key={row.id} className="flex justify-between gap-4">
              <dt className="text-ink/60">{row.name}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex gap-3">
          <button className={buttonClass} onClick={() => void add("/api/v1/cart/items")}>
            Add to cart
          </button>
          <button className={quietButton} onClick={() => void add("/api/v1/wishlist/items")}>
            Save
          </button>
        </div>
        {note ? <p className="mt-3 text-sm">{note}</p> : null}
      </div>
    </article>
  );
}

export function CampaignPage() {
  const { slug = "" } = useParams();
  const [campaign, setCampaign] = useState<{ name: string; description: string; products: ProductCard[] } | null>(null);
  const [error, setError] = useState("");
  usePageMeta(campaign ? `${campaign.name} · Mahavir Farsan Mart` : "Campaign · Mahavir Farsan Mart", campaign?.description || "Festival campaign");
  useEffect(() => {
    api<{ name: string; description: string; products: ProductCard[] }>(`/api/v1/campaigns/${slug}`, { auth: false })
      .then(setCampaign)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Campaign not found"));
  }, [slug]);
  if (error) return <Notice kind="error" message={error} />;
  if (!campaign) return <Notice kind="loading" message="Loading campaign…" />;
  return (
    <div>
      <h1 className="text-3xl font-semibold">{campaign.name}</h1>
      <p className="mt-2 max-w-2xl text-ink/70">{campaign.description}</p>
      <div className="mt-8">
        <ProductGrid products={campaign.products} />
      </div>
    </div>
  );
}
