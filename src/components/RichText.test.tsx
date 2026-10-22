import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichText } from "./RichText";

const html = (source: string) => render(<RichText html={source} />).container.innerHTML;

describe("RichText", () => {
  it("renders plain text", () => {
    expect(html("Hello world")).toBe("Hello world");
  });

  it("renders the allowed inline tags", () => {
    expect(html("<b>bold</b> <em>em</em> <strong>s</strong> <i>i</i>")).toBe(
      "<b>bold</b> <em>em</em> <strong>s</strong> <i>i</i>",
    );
  });

  it("nests tags", () => {
    expect(html("<b>a <em>b</em> c</b>")).toBe("<b>a <em>b</em> c</b>");
  });

  it("renders <br> and self-closing tags", () => {
    expect(html("a<br>b<br/>c<b/>")).toBe("a<br>b<br>c<b></b>");
  });

  it("decodes known entities and keeps unknown ones as text", () => {
    expect(render(<RichText html="&amp; &lt;&gt; &quot;'&nbsp;&bogus;" />).container.textContent).toBe(
      "& <> \"' &bogus;",
    );
  });

  it("escapes disallowed tags instead of rendering them", () => {
    const { container } = render(<RichText html={'<script>alert(1)</script><img src=x onerror="x">'} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<script>");
  });

  it("keeps a stray closing tag as text", () => {
    expect(render(<RichText html="a</b>c" />).container.textContent).toBe("a</b>c");
  });

  it("keeps an unclosed tag as text with its content", () => {
    const { container } = render(<RichText html="x <b>open <em>inner</em>" />);
    expect(container.textContent).toBe("x <b>open inner");
    expect(container.querySelector("em")?.textContent).toBe("inner");
  });

  it("renders nothing for an empty string", () => {
    expect(html("")).toBe("");
  });
});
