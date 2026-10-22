import { spawn, type ChildProcess } from "node:child_process";
import { expect, loadAllSections, test } from "./fixtures";

let server: ChildProcess | null = null;
let ORIGIN = "";

async function startServer() {
  const port = 4300 + test.info().parallelIndex;
  ORIGIN = `http://localhost:${port}`;
  const child = spawn(`npx vite preview --port ${port} --strictPort`, { shell: true, stdio: "ignore" });
  let exited = false;
  child.on("exit", () => {
    exited = true;
  });
  server = child;
  for (let i = 0; i < 100; i++) {
    if (exited) {
      throw new Error(`preview server on port ${port} exited (port in use?)`);
    }
    try {
      if ((await fetch(ORIGIN)).ok) {
        return;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error("preview server didn't start");
}

async function stopServer() {
  if (!server?.pid) {
    return;
  }
  const pid = server.pid;
  server = null;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    process.kill(-pid, "SIGTERM");
  }
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(ORIGIN);
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      return;
    }
  }
  throw new Error("preview server didn't stop");
}

test.describe("offline support", () => {
  test.describe.configure({ timeout: 90_000 });
  test.skip(({ isMobile }) => isMobile, "service worker behaviour is the same on every device");
  test.use({ serviceWorkers: "allow", allowNetworkErrors: true });

  test.afterEach(async () => {
    await stopServer();
  });

  test("works offline after one visit, lazy sections included", async ({ page }) => {
    await startServer();
    await page.goto(ORIGIN);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await loadAllSections(page);
    await page.waitForLoadState("networkidle");

    await stopServer();
    await page.reload();
    await expect(page.locator("#hero")).toBeVisible();
    await loadAllSections(page);
    await expect(page.locator("#contact .sec-hdr")).toBeVisible();
  });

  test("shows the offline page for pages it hasn't seen", async ({ page }) => {
    await startServer();
    await page.goto(ORIGIN);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await expect(page.locator("#contact .sec-hdr")).toBeAttached();
    await expect(page.locator("footer").first()).toBeAttached();
    await page.waitForLoadState("networkidle");

    await stopServer();
    await page.goto(`${ORIGIN}/never-visited`);
    await expect(page.locator("body")).toContainText(/offline/i);
  });
});
