import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { siteConfig } from "../src/site.config.ts";
import en from "../src/i18n/locales/en.ts";

const site = { name: siteConfig.site.name, tagline: en.site.tagline };
const recruiter = { headline: en.recruiter.headline, meta: en.recruiter.meta };
const impact = siteConfig.impact.map((metric) => ({
  ...metric,
  ...en.impact[metric.id as keyof typeof en.impact],
}));
const availability = {
  open: siteConfig.availability.open,
  full: en.availability.full,
};
const printResume = { siteUrl: siteConfig.printSiteUrl };

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const INSET_X = 72;
const INSET_Y = 48;
const PHOTO = 300;
const PHOTO_ZOOM = 1;

// Copper theme (the default `:root` palette in src/globals.css).
const color = {
  bg: "#0c0500",
  primary: "#e8843a",
  primaryLight: "#f4a96a",
  secondary: "#38bdf8",
  text: "#f0e0d0",
  muted: "#c8a882",
};

type Style = Record<string, string | number>;
interface Node {
  type: string;
  props: { style?: Style; src?: string; children?: (Node | string)[] };
}

const h = (type: string, style: Style, ...children: (Node | string | false)[]): Node => ({
  type,
  props: { style, children: children.filter((c) => c !== false) },
});

const font = (root: string, pkg: string, file: string) =>
  readFileSync(resolve(root, "node_modules/@fontsource", pkg, "files", file));

function photoDataUri(root: string) {
  const path = resolve(root, "public/og-photo.jpg");
  if (!existsSync(path)) {
    return null;
  }
  return `data:image/jpeg;base64,${readFileSync(path).toString("base64")}`;
}

function card(photo: string | null): Node {
  const [first, ...rest] = site.name.split(" ");
  const metrics = impact.slice(0, 2);

  const pill = (label: string, accent: string) =>
    h(
      "div",
      {
        display: "flex",
        alignItems: "center",
        padding: "8px 18px",
        borderRadius: 999,
        border: `1.5px solid ${accent}55`,
        background: `${accent}14`,
        color: accent,
        fontSize: 20,
        fontWeight: 600,
      },
      label,
    );

  const left = h(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
      paddingRight: 36,
    },
    availability.open &&
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: color.secondary,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          marginBottom: 22,
        },
        h("div", {
          width: 12,
          height: 12,
          borderRadius: 999,
          background: color.secondary,
        }),
        availability.full,
      ),
    h(
      "div",
      {
        display: "flex",
        flexWrap: "wrap",
        fontFamily: "Space Grotesk",
        fontSize: 84,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        color: color.text,
      },
      h("span", { marginRight: 22 }, first),
      h("span", { color: color.primary }, rest.join(" ")),
    ),
    h(
      "div",
      {
        marginTop: 20,
        fontSize: 28,
        fontWeight: 600,
        color: color.text,
        lineHeight: 1.3,
      },
      recruiter.headline,
    ),
    h(
      "div",
      { display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 },
      ...recruiter.meta.map((m, i) => pill(m, i === 0 ? color.primaryLight : color.secondary)),
    ),
    h(
      "div",
      { display: "flex", gap: 44, marginTop: 34 },
      ...metrics.map((m) =>
        h(
          "div",
          { display: "flex", flexDirection: "column" },
          h(
            "div",
            {
              fontFamily: "Space Grotesk",
              fontSize: 48,
              fontWeight: 700,
              color: color.primaryLight,
              lineHeight: 1,
            },
            `${m.value}${m.suffix ?? ""}`,
          ),
          h("div", { fontSize: 20, color: color.muted, marginTop: 6 }, m.label),
        ),
      ),
    ),
  );

  const right =
    photo !== null &&
    h(
      "div",
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: PHOTO,
        height: PHOTO,
        borderRadius: 999,
        border: `3px solid ${color.primary}`,
        boxShadow: `0 0 60px ${color.primary}66`,
        padding: 10,
      },
      h(
        "div",
        {
          display: "flex",
          position: "relative",
          width: PHOTO - 26,
          height: PHOTO - 26,
          borderRadius: 999,
          overflow: "hidden",
        },
        {
          type: "img",
          props: {
            src: photo,
            style: {
              position: "absolute",
              left: (-(PHOTO - 26) * (PHOTO_ZOOM - 1)) / 2,
              top: (-(PHOTO - 26) * (PHOTO_ZOOM - 1)) / 2,
              width: (PHOTO - 26) * PHOTO_ZOOM,
              height: (PHOTO - 26) * PHOTO_ZOOM,
            },
          },
        },
      ),
    );

  return h(
    "div",
    {
      display: "flex",
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fontFamily: "Inter",
      color: color.text,
      backgroundColor: color.bg,
      backgroundImage: `radial-gradient(circle at 85% 20%, ${color.primary}33, transparent 45%), radial-gradient(circle at 10% 95%, ${color.secondary}22, transparent 40%)`,
    },
    h(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        margin: `${INSET_Y}px ${INSET_X}px`,
      },
      h("div", { display: "flex", alignItems: "center", flex: 1 }, left, right),
      h(
        "div",
        {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1.5px solid ${color.primary}33`,
          paddingTop: 18,
          fontSize: 24,
        },
        h("div", { color: color.secondary, fontWeight: 600 }, printResume.siteUrl),
        h("div", { color: color.muted }, site.tagline),
      ),
    ),
  );
}

export async function renderOgImage(root: string) {
  const svg = await satori(card(photoDataUri(root)) as unknown as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      {
        name: "Inter",
        weight: 400,
        style: "normal",
        data: font(root, "inter", "inter-latin-400-normal.woff"),
      },
      {
        name: "Inter",
        weight: 600,
        style: "normal",
        data: font(root, "inter", "inter-latin-600-normal.woff"),
      },
      {
        name: "Space Grotesk",
        weight: 700,
        style: "normal",
        data: font(root, "space-grotesk", "space-grotesk-latin-700-normal.woff"),
      },
    ],
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}

function cacheKey(root: string) {
  const hash = createHash("sha256");
  hash.update(readFileSync(fileURLToPath(import.meta.url)));
  hash.update(JSON.stringify({ site, recruiter, impact, availability }));
  hash.update(printResume.siteUrl);
  const photo = resolve(root, "public/og-photo.jpg");
  if (existsSync(photo)) {
    hash.update(readFileSync(photo));
  }
  return hash.digest("hex").slice(0, 16);
}

/** Renders the card, reusing the last PNG when none of its inputs changed. */
export async function renderOgImageCached(root: string) {
  const dir = resolve(root, "node_modules/.cache/og-image");
  const file = resolve(dir, `${cacheKey(root)}.png`);
  if (existsSync(file)) {
    return readFileSync(file);
  }
  const png = await renderOgImage(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, png);
  return png;
}
