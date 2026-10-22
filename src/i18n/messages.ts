import type en from "./locales/en.ts";

type Widen<T> = T extends string
  ? string
  : T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

/**
 * The shape every language file must match: the same keys as `en.ts`,
 * with any string allowed. A missing or misspelled key fails the build.
 */
export type Messages = Widen<typeof en>;
