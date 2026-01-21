# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React app. Core client code lives in `src/`:
- `src/main.jsx` bootstraps React and mounts `App`.
- `src/App.jsx` holds the main UI component.
- `src/index.css` and `src/App.css` contain global and component styles.
Static assets live in `public/` and `src/assets/`. The root also includes `vite.config.js`, `eslint.config.js`, and a `Dockerfile`/`compose.yaml` for containerized dev. There is an `App.tsx` at the repo root that is not referenced by the build; treat it as legacy unless you wire it in.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on port 3000 (binds to all interfaces).
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint against the project.
Docker dev: `docker compose up --build` runs the dev server with live-mounted source.

## Coding Style & Naming Conventions
Code is JavaScript/JSX (ES modules). The existing code uses 2-space indentation and mostly double quotes in `src/App.jsx`, while `src/main.jsx` uses single quotes—prefer matching the file you are editing. Components use PascalCase (`App`, `ThemeButton`). CSS class names are kebab-case or simple nouns (e.g., `.card`). ESLint is configured via `eslint.config.js` with React Hooks and React Refresh rules.

## Testing Guidelines
No test framework is configured yet. If you add tests, keep them close to source (e.g., `src/App.test.jsx`) and document the runner in `package.json` scripts.

## Commit & Pull Request Guidelines
Recent commits are short, descriptive, and often include Japanese text with a date prefix (e.g., `1/20 配列の検索とフィルタリング`). Follow that style for consistency. PRs should include a brief summary, list of changes, and screenshots/GIFs for UI changes. Link any relevant issues.

## Configuration Notes
The dev server is configured for port `3000` in `vite.config.js`, and Docker maps `3000:3000`. If you change ports, update both.
