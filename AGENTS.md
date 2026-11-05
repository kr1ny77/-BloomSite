# Repository Guidelines

## Project Structure & Module Organization

`main.go` serves the embedded site with Go `net/http`. Page content lives in
`templates/index.html`; presentation, motion, and media live under
`static/css/`, `static/js/`, and `static/images/`. `scripts/build.mjs` produces
the deployable `dist/` directory. Go tests stay beside the server in
`main_test.go`.

The `app/`, `components/`, `hooks/`, and `lib/` directories contain the Sites
React scaffold. The current Bloom experience uses the Go template and static
assets as its production source. Read `PRODUCT.md` before changing product
claims, scope, or terminology.

## Build, Test, and Development Commands

- `go run .` starts the local server at `http://localhost:8080`; set `PORT=8090`
  to choose another port.
- `go test ./...` runs the HTTP route and placeholder-link tests.
- `npm run build` generates the static Sites package in `dist/`.
- `npm run lint` checks JavaScript and TypeScript with Oxlint.
- `npm run format` formats supported source files with Oxfmt.
- `node --check static/js/app.js` performs a quick JavaScript syntax check.

## Coding Style & Naming Conventions

Format Go code with `gofmt` and follow standard library conventions. Use
two-space indentation and single quotes in JavaScript. Name JavaScript values
with `camelCase`; use `kebab-case` for CSS classes and media filenames. Keep
HTML semantic, Russian product copy precise, and interactive controls labeled
for assistive technology. Preserve readable content when motion is unavailable.

## Testing Guidelines

Use Go's `testing` and `httptest` packages. Name tests `TestXxx` and cover route
status, HTTP method behavior, embedded assets, and product constraints. Before
submission, run `go test ./...`, the JavaScript syntax check, and
`npm run build`. For layout or animation changes, inspect desktop and mobile,
forward and reverse scrolling, keyboard navigation, horizontal overflow, and
`prefers-reduced-motion`.

## Commit & Pull Request Guidelines

History uses short imperative subjects such as `Fix scroll layout and refine
Bloom product mockups`. Keep each commit focused on one reviewable behavior.
Pull requests should explain the user-visible result, list validation commands,
and link relevant issues. Include desktop and mobile screenshots or a short
recording for responsive or motion changes.

## Product and Configuration Safety

Keep store buttons as accessible placeholders until real destinations are
approved. Mark demonstration data clearly and use verified sources for product
claims. Keep credentials out of the repository and treat `dist/` as generated
output. Preserve `.openai/hosting.json` and `.impeccable/config.json` as project
configuration.
