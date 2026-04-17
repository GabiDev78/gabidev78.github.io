/**
 * ASCII banners for boot + the `banner` command.
 *
 * Each banner has a `wide` (≥ ~70 cols) and `narrow` (≤ ~36 cols) variant.
 * `pickBanner(viewportPx)` chooses one at random suited for the viewport.
 *
 * Stylistic homage to msfconsole: bold ASCII, faux-version line attached
 * by the boot sequence (not here).
 */

export const BANNERS = [
  {
    name: "skull",
    wide: String.raw`
        .-"""""-.
       /         \
      |  .-. .-.  |        portfolio :: cybersecurity
      |  | | | |  |
      |  '-' '-'  |          [ interactive terminal v1.0 ]
       \    ^    /
        '. ___ .'         "type 'help' to get started"
         /     \
        /_______\
`,
    narrow: String.raw`
   .-""""-.
  / .-. .-. \
 |  | | | |  |
  \ '-' '-' /
   '. ___ .'
   /_______\
   portfolio
`,
  },

  {
    name: "matrix-block",
    wide: String.raw`
   ____   ___   ____  _____ _____ ___  _     ___ ___
  |  _ \ / _ \ |  _ \|_   _|  ___/ _ \| |   |_ _/ _ \
  | |_) | | | || |_) | | | | |_ | | | | |    | | | | |
  |  __/| |_| ||  _ <  | | |  _|| |_| | |___ | | |_| |
  |_|    \___/ |_| \_\ |_| |_|   \___/|_____|___\___/

         . . :: interactive terminal :: . .
`,
    narrow: String.raw`
  ____   ___  ____ _____
 |  _ \ / _ \|  _ \_   _|
 | |_) | | | | |_) || |
 |  __/| |_| |  _ < | |
 |_|    \___/|_| \_\|_|
   portfolio terminal
`,
  },

  {
    name: "neon-grid",
    wide: String.raw`
  ╔══════════════════════════════════════════╗
  ║   ____   ___  ____ _____ _____ ___       ║
  ║  |  _ \ / _ \|  _ \_   _|  ___/ _ \      ║
  ║  | |_) | | | | |_) || | | |_ | | | |     ║
  ║  |  __/| |_| |  _ < | | |  _|| |_| |     ║
  ║  |_|    \___/|_| \_\|_| |_|   \___/      ║
  ║                                          ║
  ║   :: cybersecurity engineer's CLI ::     ║
  ╚══════════════════════════════════════════╝
`,
    narrow: String.raw`
 ╔══════════════════════╗
 ║   PORTFOLIO ▌▌▌      ║
 ║   cybersecurity      ║
 ║   interactive CLI    ║
 ╚══════════════════════╝
`,
  },
];

/** Return one banner string, sized for the viewport. */
export function pickBanner(viewportPx = window.innerWidth) {
  const banner = BANNERS[Math.floor(Math.random() * BANNERS.length)];
  return viewportPx < 540 ? banner.narrow : banner.wide;
}
