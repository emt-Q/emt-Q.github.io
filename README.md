# Emmett Qin — personal website

A lightweight, dependency-free GitHub Pages portfolio with two ways to explore:

- `/`: view selector
- `/classic/`: full profile, projects, experience, education, and contact
- `/terminal/`: keyboard-accessible portfolio commands

The design takes inspiration from the classic/terminal navigation and green
academic aesthetic of [Siyuan Gong’s website](https://gooosy.github.io/).
The layout, styling, and terminal implementation are original to this site.

## Preview locally

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Use an HTTP server rather than opening files
directly so the terminal can load its profile data.

## Update content

Edit `classic/index.html`, then refresh the terminal’s static content:

```sh
python3 scripts/sync-terminal.py
```

Keep short introductions in `index.html` and `terminal/index.html` in sync
when your name, degree, or focus changes. Shared appearance lives in `style.css`.
There is no build step, package installation, external font service, or analytics.
The existing `.nojekyll` file supports direct static hosting on GitHub Pages.

## Interactions

- Original section bookmarks, such as `/#work`, redirect to `/classic/#work`.
- Project details use native expandable elements and work without JavaScript.
- Terminal commands: `help`, `whoami`, `about`, `projects`, `experience`,
  `education`, `skills`, `contact`, `classic`, `clear`.
- The terminal supports unique-prefix Tab completion, arrow-key history, and
  Ctrl+L to clear. It displays profile information only; it never executes code.
- The classic page remains readable without JavaScript. Motion respects the
  visitor’s reduced-motion setting.
