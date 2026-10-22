import { gzipSync } from "node:zlib";
import { expect, test } from "./fixtures";

const INITIAL_JS_BUDGET_KB = 150;

test.describe("SEO and sharing", () => {
  test.skip(({ isMobile }) => isMobile, "same HTML on every device");

  test("has a title, description and Open Graph tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Jane Doe/);
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:image"]',
      'meta[property="og:url"]',
      'meta[name="twitter:card"]',
      'meta[name="viewport"]',
    ]) {
      const content = await page.locator(selector).getAttribute("content");
      expect(content, selector).toBeTruthy();
      expect(content, selector).not.toContain("{{");
    }
  });

  test("serves the generated 1200×630 OG image", async ({ request, page }) => {
    const res = await request.get("/og-image.png");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const png = await res.body();
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    await page.goto("/");
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toBe(
      "https://your-domain.com/og-image.png",
    );
  });

  test("has valid Person structured data", async ({ page }) => {
    await page.goto("/");
    const json = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Person");
    expect(json.name).toBe("Jane Doe");
    expect(json.url).toBe("https://your-domain.com");
  });

  test("has robots.txt, a sitemap and a valid manifest", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://your-domain.com/sitemap.xml");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://your-domain.com/</loc>");

    const manifest = await (await request.get("/manifest.json")).json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).status(), icon.src).toBe(200);
    }
  });
});

test("initial JavaScript stays within budget", async ({ request, isMobile }) => {
  test.skip(isMobile, "same bundle on every device");
  const html = await (await request.get("/")).text();
  const urls = [
    ...new Set(
      [...html.matchAll(/<(?:script type="module"[^>]*src|link rel="modulepreload"[^>]*href)="([^"]+\.js)"/g)].map(
        (m) => m[1],
      ),
    ),
  ];
  expect(urls.length).toBeGreaterThan(0);
  let total = 0;
  for (const url of urls) {
    total += gzipSync(await (await request.get(url)).body()).length;
  }
  const kb = Math.round(total / 1024);
  console.log(`initial JS: ${kb} KB gzipped across ${urls.length} files`);
  expect(kb, "initial JS (KB gzipped)").toBeLessThanOrEqual(INITIAL_JS_BUDGET_KB);
});
