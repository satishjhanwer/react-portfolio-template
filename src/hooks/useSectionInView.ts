import { useRef } from "react";
import { useInView } from "framer-motion";
import type { UseInViewOptions } from "framer-motion";

export function useSectionInView(margin: UseInViewOptions["margin"] = "-100px", once = true) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin });
  return { ref, inView };
}
