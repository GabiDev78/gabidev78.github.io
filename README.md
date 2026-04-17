# portfolio

An interactive terminal-style portfolio. Visitors type commands
(`help`, `use experience`, `show projects`, `set theme dracula`) instead
of scrolling through pages.

Built with vanilla HTML + CSS + ES modules. No build step.
Designed to deploy to GitHub Pages by pushing files.

## Run locally

```sh
python3 -m http.server 5173
# → http://localhost:5173
```

Or whatever static server you prefer — anything that serves the files at
the repo root will work.

## Editing content

All CV data lives in [`js/data/`](js/data/). Each category is a JS module
exporting a `{ id, label, modules: [...] }` (or `groups` for skills) object.

| File                        | What to edit                                   |
|-----------------------------|------------------------------------------------|
| `js/data/profile.js`        | Name, tagline, contact, CV PDF path            |
| `js/data/experience.js`     | Professional roles                             |
| `js/data/education.js`      | Degrees                                        |
| `js/data/skills.js`         | Skill groups and levels                        |
| `js/data/projects.js`       | Personal / open-source projects                |
| `js/data/certifications.js` | Industry certifications                        |
| `js/data/banners.js`        | ASCII banners for the boot sequence            |
| `assets/cv.pdf`             | Downloadable CV (served by the `download` cmd) |

Every module uses the same shape:

```js
{
  id: "url-path-segment",
  title: "Role or project title",
  org: "Organization",
  period: "2023 — Present",
  tags: ["one", "two"],
  summary: "One-line summary for the table view.",
  detail: () => c`
    ${bold(accent("Header"))}
    Multi-line colored detail rendered by \`info\` / \`show\`.
  `,
  links: [{ label: "Writeup", url: "https://..." }],
}
```

`c` is a tagged-template helper from `js/render.js`; `bold`, `accent`, `dim`,
etc. are imported from the same module.

## Commands

| Command | What it does |
|---|---|
| `help [command]` | List commands, or show usage for one. `help --all` includes hidden ones. |
| `use <cat[/mod]>` | Enter a category or module. Prompt updates. |
| `show [...]` | Context-sensitive listing. `show`, `show modules`, `show options`. |
| `info <path>` | One-shot module detail without changing the prompt. |
| `search <term>` | Grep titles, tags, summaries. |
| `back` | Leave the current module. |
| `set <KEY> <VAL>` | Session variable. Special: `theme`, `PROMPT`. |
| `theme [name]` | Switch theme (`matrix`, `amber`, `dracula`, `solarized-dark`). |
| `contact` | Show email / github / linkedin. |
| `download cv` | Download `assets/cv.pdf`. |
| `history` / `history -c` | Show or clear history. |
| `clear` / `banner` / `whoami` / `echo` / `exit` | As you'd expect. |

Hidden fun: `sudo`, `nmap localhost`, `matrix`, `hack`, `cowsay`, `fortune`.

## Keybindings

| Key | Action |
|---|---|
| `Enter` | Run command |
| `Tab` | Autocomplete (verbs, then context-aware args) |
| `Tab Tab` | List candidates |
| `↑` / `↓` | Browse history |
| `Ctrl+C` | Cancel current input |
| `Ctrl+L` | Clear screen |

URL params: `?skip=1` skips the boot animation. `?theme=dracula` overrides
the stored theme for the session.

## Deploy to GitHub Pages

1. Create a repo — for a clean URL, use `<your-username>.github.io` (root domain).
2. Push `main`.
3. Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`.
4. Wait a minute; site is live.

All asset paths in the code are relative, so deploying under
`username.github.io/portfolio/` (subpath) works too.

## Project layout

```
index.html            single page; <noscript> fallback with full CV
404.html              redirects to index (SPA-ish deep links)
assets/               favicon, og-image, CV PDF
styles/               base, themes, terminal, animations, responsive
js/
  main.js             entry: wires everything, runs boot
  terminal.js         DOM I/O: print, table, echo, clear
  parser.js           tokenize → {verb, args, flags}
  registry.js         command registry + category index
  history.js          command history + localStorage
  autocomplete.js     Tab completion
  theme.js            ThemeManager
  boot.js             banner + boot sequence
  context.js          session state + prompt updater
  render.js           tagged-template → DocumentFragment
  mobile.js           helper row + virtual keyboard API
  commands/           core, msf, content, theme, easter
  data/               the CV content
```

## Accessibility

- `<noscript>` block in `index.html` provides the full CV as semantic HTML
  for crawlers, link previews, and readers without JavaScript.
- The transcript is wrapped in `role="log" aria-live="polite"`.
- Status messages use both color *and* an msfconsole-style prefix
  (`[+]`, `[!]`, `[*]`, `[-]`) — color-blind safe by construction.
- `prefers-reduced-motion` disables the boot typewriter and the cursor
  blink, and gates the `matrix` rain behind `--force`.

## License

MIT (or whichever you prefer — edit before publishing).
