export interface ContactCard {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  url: string;
  location?: string;
  profiles: { label: string; href: string }[];
}

const MAX_LINE = 75;

function escape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= MAX_LINE) {
    return line;
  }
  const chunks: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const width = new TextEncoder().encode(ch).length;
    const limit = chunks.length === 0 ? MAX_LINE : MAX_LINE - 1;
    if (size + width > limit) {
      chunks.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += width;
  }
  chunks.push(current);
  return chunks.join("\r\n ");
}

function address(location: string) {
  const parts = location.split(",").map((p) => p.trim());
  const country = parts.length > 1 ? parts.pop()! : "";
  return `ADR;TYPE=WORK:;;;${escape(parts.join(", "))};;;${escape(country)}`;
}

export function buildVCard(card: ContactCard) {
  const fullName = `${card.firstName} ${card.lastName}`;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(card.lastName)};${escape(card.firstName)};;;`,
    `FN:${escape(fullName)}`,
    `TITLE:${escape(card.title)}`,
    `EMAIL;TYPE=INTERNET,WORK:${card.email}`,
    `URL:${card.url}`,
    ...(card.location ? [address(card.location)] : []),
    ...card.profiles.map((p) => `X-SOCIALPROFILE;TYPE=${p.label.toLowerCase()}:${p.href}`),
    "END:VCARD",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function qrPath(isDark: (row: number, col: number) => boolean, size: number, margin: number) {
  let d = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (isDark(row, col)) {
        d += `M${col + margin} ${row + margin}h1v1h-1z`;
      }
    }
  }
  const total = size + margin * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/><path fill="#000" d="${d}"/></svg>\n`;
}
