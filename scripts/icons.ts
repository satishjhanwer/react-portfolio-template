import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "../src/site.config.ts";

// Regenerates the logo, favicon and PWA icons with the letters as outlines
// from the real Inter font files, so they render the same on every device
// (an SVG used as an image can't load web fonts). Run with `npm run icons`.

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (file: string) => resolve(root, "public", file);
const { initials, logoCursor } = siteConfig.site;

const brand = {
  from: "#686bf2",
  to: "#34d399",
  tile: "#10102a",
  bg: "#080818",
};

const inter = (weight: 800 | 900) =>
  readFileSync(resolve(root, `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

const fonts = [
  {
    name: "Inter",
    weight: 800 as const,
    style: "normal" as const,
    data: inter(800),
  },
  {
    name: "Inter",
    weight: 900 as const,
    style: "normal" as const,
    data: inter(900),
  },
];

type Style = Record<string, string | number>;
interface Node {
  type: string;
  props: { style?: Style; children?: (Node | string)[] };
}

const box = (style: Style, ...children: (Node | string)[]): Node => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

const gradientText = (text: string, fontSize: number, fontWeight: 800 | 900): Node =>
  box(
    {
      fontFamily: "Inter",
      fontSize,
      fontWeight,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      backgroundImage: `linear-gradient(135deg, ${brand.from}, ${brand.to})`,
      backgroundClip: "text",
      color: "transparent",
    },
    text,
  );

const render = (node: Node, width: number, height: number) =>
  satori(node as unknown as Parameters<typeof satori>[0], {
    width,
    height,
    fonts,
  });

const centered = (size: number, style: Style, child: Node) =>
  box(
    {
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
      ...style,
    },
    child,
  );

async function main() {
  const logo = await render(
    box(
      { width: 240, height: 108, alignItems: "center", paddingLeft: 6 },
      gradientText(initials + logoCursor, 90, 800),
    ),
    240,
    108,
  );
  writeFileSync(out("logo.svg"), logo);

  const favicon = await render(
    centered(32, { background: brand.tile, borderRadius: 6 }, gradientText(initials, 18, 900)),
    32,
    32,
  );
  writeFileSync(out("favicon.svg"), favicon);

  // Maskable: launchers may crop to a circle, so the mark stays well inside
  // the central 80% safe zone.
  const icon = await render(
    centered(512, { background: brand.bg }, gradientText(initials + logoCursor, 176, 800)),
    512,
    512,
  );
  for (const size of [512, 192]) {
    const png = new Resvg(icon, { fitTo: { mode: "width", value: size } }).render().asPng();
    writeFileSync(out(`logo${size}.png`), png);
  }

  console.log("Wrote logo.svg, favicon.svg, logo192.png, logo512.png");
}

await main();
