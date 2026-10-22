import AxeBuilder from "@axe-core/playwright";
import { THEMES, expect, test } from "./fixtures";

test.describe("404 page", () => {
  for (const theme of THEMES) {
    test(`is themed and accessible in ${theme}`, async ({ page, isMobile }) => {
      test.skip(isMobile && theme !== "copper", "colours don't change with width");
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto("/404.html");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
      await expect(page.locator("#path")).toHaveText("/404.html");
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    });
  }
});

test("works without JavaScript", async ({ browser, isMobile }) => {
  test.skip(isMobile, "same page on every device");
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: "http://localhost:4173" });
  const page = await context.newPage();
  await page.goto("/404.html");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  await expect(page.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "projects" })).toHaveAttribute("href", "/#projects");
  await context.close();
});
