import type { Page } from "@playwright/test";
import en from "../src/i18n/locales/en.ts";
import { expect, gotoReady, test, topOf } from "./fixtures";

const SECTIONS = ["about", "skills", "projects", "oss", "experience", "education", "awards", "contact"];

async function expectAtTop(page: Page, id: string) {
  await expect
    .poll(
      async () => {
        const top = await topOf(page, `#${id}`);
        const atBottom = await page.evaluate(
          () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
        );
        return Math.abs(top) <= 120 || atBottom;
      },
      { timeout: 8_000 },
    )
    .toBe(true);
}

async function openMenuIfCompact(page: Page) {
  const hamburger = page.getByRole("button", { name: en.navMenuLabel.open });
  if (await hamburger.isVisible()) {
    await hamburger.click();
    return true;
  }
  return false;
}

test("each nav link scrolls to its section", async ({ page }) => {
  await gotoReady(page);
  for (const id of SECTIONS) {
    const label = en.navLinks[id as keyof typeof en.navLinks].label;
    const inDrawer = await openMenuIfCompact(page);
    const scope = inDrawer ? page.locator('[class*="drawer"]') : page.locator("nav");
    await scope.getByRole("button", { name: label, exact: true }).click();
    await expectAtTop(page, id);
  }
});

test("the 'hire me' status lands on Contact (mobile regression)", async ({ page }) => {
  await gotoReady(page);
  await page.locator("#hero button").first().click();
  await expectAtTop(page, "contact");
});

test("a #hash deep link scrolls once the sections exist", async ({ page }) => {
  await gotoReady(page, "/#experience");
  await expectAtTop(page, "experience");
});

test("the skip link jumps to the main content", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard only");
  await gotoReady(page);
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  expect(new URL(page.url()).hash).toBe("#main-content");
});
