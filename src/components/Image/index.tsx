import { useState } from "react";
import styles from "./Image.module.css";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
}

export function Image({
  src,
  alt,
  fallback,
  className = "",
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {!loaded && !error && <div className={styles.skeleton} />}
      {error && fallback ? (
        fallback
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${styles.image} ${loaded ? styles.loaded : ""}`}
          style={{ display: error ? "none" : "block" }}
          {...props}
        />
      )}
    </div>
  );
}
