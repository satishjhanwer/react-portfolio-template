import sprite from "../../assets/icons/sprite.svg?raw";

export function IconSprite() {
  return <div style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: sprite }} />;
}
