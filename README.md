# portfolio

Welcome to my interactive portfolio as an security engineer. Type commands to navigate through the portfolio.
(`help`, `use experience`, `show projects`, `set theme dracula`) instead
of scrolling through pages.

Built with vanilla HTML + CSS + ES modules.



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

## License

MIT 
