import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import en from "../src/i18n/locales/en.ts";
import { THEMES, expect, gotoReady, loadAllSections, test } from "./fixtures";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function violations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(TAGS);
  if (include) {
    builder = builder.include(include);
  }
  const { violations } = await builder.analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

for (const theme of THEMES) {
  test(`the whole page has no WCAG A/AA violations in ${theme}`, async ({ page, isMobile }) => {
    test.skip(isMobile && theme !== "copper", "colours don't change with width; one mobile scan covers layout rules");
    await gotoReady(page, `/?theme=${theme}`);
    await loadAllSections(page);
    await page.waitForTimeout(800);
    expect(await violations(page)).toEqual([]);
  });

  test(`every rotating hero status is accessible in ${theme}`, async ({ page, isMobile }) => {
    test.skip(isMobile, "the status markup is the same at every width");
    await gotoReady(page, `/?theme=${theme}`);
    const status = page.locator("#hero button").first();
    const seen = new Set<string>();
    for (let i = 0; i < en.availability.statuses.length; i++) {
      await expect.poll(async () => !seen.has((await status.textContent()) ?? ""), { timeout: 12_000 }).toBe(true);
      seen.add((await status.textContent()) ?? "");
      await page.waitForTimeout(400);
      expect(await violations(page, "#hero")).toEqual([]);
    }
  });
}

test("open overlays have no violations", async ({ page }) => {
  await gotoReady(page, "/?mode=recruiter");
  const recruiter = page.getByRole("dialog", { name: "Jane Doe" });
  await expect(recruiter).toBeVisible();
  await page.waitForTimeout(500);
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: en.a11yPrefsTrigger }).click();
  await expect(page.getByRole("dialog", { name: en.a11yPrefsCopy.title })).toBeVisible();
  await page.waitForTimeout(400);
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: new RegExp(en.commandPalette.triggerText) }).click();
  await expect(page.getByRole("dialog", { name: en.commandPalette.dialogLabel })).toBeVisible();
  await page.waitForTimeout(400);
  expect(await violations(page)).toEqual([]);
});

test("high contrast and 130% text stay accessible", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("a11y-prefs", JSON.stringify({ highContrast: true, textSize: "130", underlineLinks: true })),
  );
  await gotoReady(page, "/?theme=night");
  await loadAllSections(page);
  await page.waitForTimeout(800);
  expect(await violations(page)).toEqual([]);
});

test("the keyboard shortcuts sheet opens with ? and has no violations", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard");
  await gotoReady(page);
  await page.keyboard.press("Shift+Slash");
  const sheet = page.getByRole("dialog", { name: en.shortcutsCopy.title });
  await expect(sheet).toBeVisible();
  await page.waitForTimeout(300);
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});

for (const theme of THEMES) {
  test(`the accessibility & privacy statement has no violations in ${theme}`, async ({ page, isMobile }) => {
    test.skip(isMobile && theme !== "copper", "colours don't change with width");
    await gotoReady(page, `/?theme=${theme}#privacy`);
    const dialog = page.getByRole("dialog", { name: en.trustCopy.title });
    await expect(dialog).toBeVisible();
    await expect(page.locator("#trust-privacy")).toBeInViewport();
    await page.waitForTimeout(300);
    expect(await violations(page)).toEqual([]);
  });
}

test("the colophon shows this build's real numbers and has no violations", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "same content on every device");
  const info = await (await request.get("/build-info.json")).json();
  expect(info.js.initialKb).toBeGreaterThan(50);
  await gotoReady(page);
  await page.locator("footer").first().scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: en.colophonCopy.footerLink }).click();
  const dialog = page.getByRole("dialog", { name: en.colophonCopy.title });
  await expect(dialog).toContainText(en.colophonCopy.initialJs(String(info.js.initialKb), info.js.initialFiles));
  expect(await violations(page)).toEqual([]);
});
