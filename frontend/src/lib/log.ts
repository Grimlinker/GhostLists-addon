const isDev = import.meta.env.MODE === "development";

export function log(...args: any[]) {
  if (isDev) {
    console.log("%c[GhostLists]", "color: violet; font-weight: bold", ...args);
  }
}

export function warn(...args: any[]) {
  if (isDev) {
    console.warn("%c[GhostLists:warn]", "color: orange; font-weight: bold", ...args);
  }
}

export function error(...args: any[]) {
  console.error("%c[GhostLists:error]", "color: red; font-weight: bold", ...args);
}
