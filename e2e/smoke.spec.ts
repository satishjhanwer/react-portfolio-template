import { siteConfig } from "../src/site.config";
import { THEMES, expect, gotoReady, loadAllSections, test } from "./fixtures";

for (const theme of THEMES) {
  test(`loads cleanly in the ${theme} theme`, async ({ page }) => {
    await gotoReady(page, `/?theme=${theme}`);
    const attr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(attr).toBe(theme === "copper" ? "copper" : theme);
    await loadAllSections(page);
  });
}

test("picks the theme from the time of day", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 21, 20, 0));
  await gotoReady(page);
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-theme"))).toBe("night");
});

test("fills in the years of experience everywhere", async ({ page, request }) => {
  await gotoReady(page);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toMatch(/\d+\+ years/);
  const manifest = await (await request.get("/manifest.json")).text();
  expect(manifest).not.toContain("{{");
  expect(await page.content()).not.toContain("{{YEARS_EXPERIENCE}}");
});

test("loads the analytics beacon on the production host without a CSP violation", async ({ page }) => {
  const { cloudflareToken, hosts } = siteConfig.analytics;
  test.skip(!cloudflareToken || !hosts.length, "analytics are off in site.config.ts");
  const beaconRequests: string[] = [];
  await page.route(`https://${hosts[0]}/**`, async (route) => {
    const url = new URL(route.request().url());
    const res = await page.request.get(`http://localhost:4173${url.pathname}${url.search}`);
    await route.fulfill({ response: res });
  });
  await page.route("https://static.cloudflareinsights.com/**", (route) => {
    beaconRequests.push(route.request().url());
    return route.fulfill({ contentType: "text/javascript", body: "window.__beacon = true;" });
  });
  await page.goto(`https://${hosts[0]}/`);
  await page.waitForFunction(() => (window as { __beacon?: boolean }).__beacon === true);
  expect(beaconRequests).toEqual(["https://static.cloudflareinsights.com/beacon.min.js"]);
});

test("never loads analytics on localhost", async ({ page }) => {
  const beaconRequests: string[] = [];
  await page.route("https://static.cloudflareinsights.com/**", (route) => {
    beaconRequests.push(route.request().url());
    return route.abort();
  });
  await gotoReady(page);
  await page.waitForTimeout(1500);
  expect(beaconRequests).toEqual([]);
});
