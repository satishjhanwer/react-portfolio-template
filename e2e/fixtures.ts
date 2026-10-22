import { test as base, expect, type Page } from "@playwright/test";

export const THEMES = ["copper", "night", "sakura"] as const;

export const test = base.extend<{ allowNetworkErrors: boolean; pageErrors: string[] }>({
  allowNetworkErrors: [false, { option: true }],
  pageErrors: [
    async ({ page, allowNetworkErrors }, use) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() !== "error") {
          return;
        }
        if (allowNetworkErrors && msg.text().startsWith("Failed to load resource")) {
          return;
        }
        errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));
      await page.addInitScript(() => {
        document.addEventListener("securitypolicyviolation", (e) => {
          console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
        });
      });
      await use(errors);
      expect(errors, "console errors or CSP violations").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function gotoReady(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator("#main-content")).toBeVisible();
  await page.waitForFunction(() => !document.querySelector('[style*="scaleX("]'), null, { timeout: 10_000 });
}

export async function loadAllSections(page: Page) {
  for (const id of ["about", "skills", "projects", "oss", "experience", "education", "awards", "contact"]) {
    await expect
      .poll(async () =>
        page.evaluate((sectionId) => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ block: "start" });
          return !!el?.querySelector(".sec-hdr");
        }, id),
      )
      .toBe(true);
  }
  await page.evaluate(() => document.querySelector("footer")?.scrollIntoView());
  await page.evaluate(() => window.scrollTo(0, 0));
}

export async function topOf(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => Math.round(el.getBoundingClientRect().top));
}
