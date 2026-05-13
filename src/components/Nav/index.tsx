import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import styles from "./Nav.module.css";
import { navLinks } from "../../data";

export function Nav() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <m.nav
        className={styles.nav}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.logo} aria-label="Portfolio">
          &lt;/&gt;<span className={styles.logoCursor}>_</span>
        </div>

        <ul className={styles.links}>
          {navLinks.map((l) => (
            <li key={l.id}>
              <button className={styles.link} onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.status}>
          <span className={styles.dot} />
          available
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className={`${styles.bar} ${open ? styles.barTopOpen : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barMidOpen : ""}`} />
          <span className={`${styles.bar} ${open ? styles.barBotOpen : ""}`} />
        </button>
      </m.nav>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              className={styles.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            >
              <div className={styles.drawerStatus}>
                <span className={styles.dot} />
                available for work
              </div>
              <ul className={styles.drawerLinks}>
                {navLinks.map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05 }}
                  >
                    <button
                      className={styles.drawerLink}
                      onClick={() => scrollTo(l.id)}
                    >
                      {l.label}
                    </button>
                  </m.li>
                ))}
              </ul>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
