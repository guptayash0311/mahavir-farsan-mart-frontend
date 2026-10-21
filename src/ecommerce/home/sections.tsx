import { Link } from "react-router-dom";

import { mediaUrl } from "../../shared/api/http";
import type { Section } from "../../shared/api/types";
import { formatInr } from "../../shared/format";

export function SectionView({ section }: { section: Section }) {
  if (section.type === "hero" || section.type === "announcement" || section.type === "contact_cta") {
    return (
      <section className="rounded-3xl bg-saffron-deep px-6 py-12 text-cream">
        <h2 className="text-3xl font-semibold">{section.title}</h2>
        {section.subtitle ? <p className="mt-2 max-w-xl text-marigold">{section.subtitle}</p> : null}
        {section.type === "contact_cta" ? (
          <Link to="/inquiry" className="mt-6 inline-block rounded-lg bg-marigold px-4 py-2 text-sm font-medium text-ink">
            Send an inquiry
          </Link>
        ) : null}
      </section>
    );
  }
  if (section.type === "rich_text" || section.type === "image_text") {
    const text = typeof section.config.text === "string" ? section.config.text : section.subtitle;
    return (
      <section>
        <h2 className="text-2xl font-semibold">{section.title}</h2>
        <p className="mt-2 max-w-2xl text-ink/70">{text}</p>
      </section>
    );
  }
  if (section.type === "banner") {
    return (
      <section className="grid gap-4 md:grid-cols-2">
        {section.banners.map((banner) => (
          <a key={banner.id} href={banner.link_url || "#"} className="overflow-hidden rounded-2xl border border-marigold/50 bg-white">
            {banner.image_url ? <img src={mediaUrl(banner.image_url) ?? ""} alt="" className="h-40 w-full object-cover" /> : null}
            <p className="p-4 font-medium">{banner.title}</p>
          </a>
        ))}
      </section>
    );
  }
  if (section.type === "product_grid" || section.type === "campaign_highlight") {
    return (
      <section>
        <h2 className="text-2xl font-semibold">{section.title || "Products"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="rounded-2xl border border-marigold/50 bg-white p-4">
              {product.image_url ? (
                <img src={mediaUrl(product.image_url) ?? ""} alt="" className="mb-3 h-36 w-full rounded-xl object-cover" />
              ) : null}
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-saffron-deep">{formatInr(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>
    );
  }
  if (section.type === "category_grid") {
    return (
      <section>
        <h2 className="text-2xl font-semibold">{section.title || "Categories"}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {section.categories.map((category) => (
            <Link key={category.id} to={`/categories/${category.slug}`} className="rounded-full border border-saffron/40 bg-white px-4 py-2 text-sm">
              {category.name}
            </Link>
          ))}
        </div>
      </section>
    );
  }
  return null;
}
