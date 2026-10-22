import AxeBuilder from "@axe-core/playwright";
import en from "../src/i18n/locales/en.ts";
import ja from "../src/i18n/locales/ja.ts";
import { expect, gotoReady, test } from "./fixtures";

test("the command palette finds and runs a command", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard shortcut");
  await gotoReady(page);
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: en.commandPalette.dialogLabel });
  await expect(palette).toBeVisible();
  await page.keyboard.type("awards");
  await page.keyboard.press("Enter");
  await expect(palette).toBeHidden();
  await expect
    .poll(() => page.locator("#awards").evaluate((el) => Math.abs(el.getBoundingClientRect().top) < 140))
    .toBe(true);
});

test("recruiter mode opens from ?mode=recruiter and clears the URL on close", async ({ page }) => {
  await gotoReady(page, "/?mode=recruiter");
  const dialog = page.getByRole("dialog", { name: "Jane Doe" });
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: en.recruiter.closeLabel }).click();
  await expect(dialog).toBeHidden();
  expect(new URL(page.url()).searchParams.has("mode")).toBe(false);
});

test("accessibility prefs apply before first paint after a reload", async ({ page }) => {
  await gotoReady(page);
  await page.getByRole("button", { name: en.a11yPrefsTrigger }).click();
  const panel = page.getByRole("dialog", { name: en.a11yPrefsCopy.title });
  await panel.getByRole("switch", { name: new RegExp(en.a11yPrefsCopy.toggles.highContrast.label) }).check();
  await panel.getByRole("radio", { name: "130%" }).check();
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");

  const attrsAtFirstScript: string[] = [];
  await page.exposeFunction("__report", (v: string) => attrsAtFirstScript.push(v));
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      const r = document.documentElement;
      (window as unknown as { __report: (v: string) => void }).__report(
        `${r.getAttribute("data-contrast")}|${r.getAttribute("data-text-size")}`,
      );
    });
  });
  await page.reload();
  await expect.poll(() => attrsAtFirstScript[0]).toBe("high|130");
});

test("?lang=ja renders Japanese and the switcher persists the choice", async ({ page }) => {
  await gotoReady(page, "/?lang=ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator("nav")).toContainText(ja.navLinks.about.label);

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("combobox", { name: en.languageCopy.label }).selectOption("fr");
  await page.waitForLoadState("load");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("print shows only the résumé", async ({ page }) => {
  await gotoReady(page);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("[data-print-resume]")).toBeVisible();
  await expect(page.locator("#main-content")).toBeHidden();
  await expect(page.locator("nav")).toBeHidden();
});

test("the Konami code toggles retro mode", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard");
  await gotoReady(page);
  for (const key of [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ]) {
    await page.keyboard.press(key);
  }
  await expect(page.locator("html")).toHaveAttribute("data-easter", /.+/);
  await expect(page.getByText(en.easterEgg.toastOn)).toBeVisible();
});

test("a chosen theme applies before first paint, and auto hands back to the clock", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 22, 12, 0));
  await gotoReady(page);
  await page.getByRole("button", { name: en.a11yPrefsTrigger }).click();
  const panel = page.getByRole("dialog", { name: en.a11yPrefsCopy.title });
  await panel.getByRole("radio", { name: en.a11yPrefsCopy.theme.names.sakura }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "sakura");

  const atFirstScript: (string | null)[] = [];
  await page.exposeFunction("__reportTheme", (v: string | null) => atFirstScript.push(v));
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () =>
      (window as unknown as { __reportTheme: (v: string | null) => void }).__reportTheme(
        document.documentElement.getAttribute("data-theme"),
      ),
    );
  });
  await page.reload();
  await expect.poll(() => atFirstScript[0]).toBe("sakura");

  await page.getByRole("button", { name: en.a11yPrefsTrigger }).click();
  await page
    .getByRole("dialog", { name: en.a11yPrefsCopy.title })
    .getByRole("radio", { name: en.a11yPrefsCopy.theme.auto })
    .check();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
});

test("serves the contact card and QR codes, and the QR dialog is accessible", async ({ page, request, isMobile }) => {
  test.skip(isMobile, "same files on every device");
  const vcf = await request.get("/contact.vcf");
  expect(vcf.status()).toBe(200);
  expect(await vcf.text()).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  for (const f of ["/qr-site.svg", "/qr-recruiter.svg"]) {
    expect((await request.get(f)).status(), f).toBe(200);
  }

  await gotoReady(page);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: en.contactCardCopy.showQr }).click();
  const dialog = page.getByRole("dialog", { name: en.contactCardCopy.qrTitle });
  await expect(dialog.getByRole("img")).toHaveJSProperty("complete", true);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  await page.keyboard.press("Escape");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("[data-print-resume] img")).toBeVisible();
});
