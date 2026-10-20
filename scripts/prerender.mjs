const api = (process.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function slugs(path) {
  const response = await fetch(`${api}${path}`);
  if (!response.ok) {
    return [];
  }
  const body = await response.json();
  const items = Array.isArray(body) ? body : body.items ?? [];
  return items.map((item) => item.slug).filter(Boolean);
}

function page(title, description) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

async function main() {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const products = await slugs("/api/v1/products?page_size=100");
  let campaigns = [];
  try {
    campaigns = await slugs("/api/v1/campaigns/active");
  } catch {
    campaigns = [];
  }
  for (const slug of products) {
    const dir = `dist/products/${slug}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, page(`${slug} · Mahavir Farsan Mart`, `Product ${slug}`));
  }
  for (const slug of campaigns) {
    const dir = `dist/campaigns/${slug}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, page(`${slug} · Mahavir Farsan Mart`, `Campaign ${slug}`));
  }
  console.log(`Prerendered ${products.length} products and ${campaigns.length} campaigns.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
