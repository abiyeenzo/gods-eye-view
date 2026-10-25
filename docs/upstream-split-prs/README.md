# Upstream contribution: 4 thematic PRs against bilawalsidhu/gods-eye-view

Prepared 2026-10-25 against upstream `main` = `abd81155f9ef89580ae0a42884444fb8f47c3339`.
Each branch lives on the fork `abiyeenzo/gods-eye-view` and opens a cross-repo PR to
`bilawalsidhu/gods-eye-view`, base `main`.

The sandbox GitHub token may push fork branches but cannot create PRs on the upstream
repository (`Resource not accessible by integration`). Open each PR in the browser with the
compare links below (title/body pre-composed under each section), or from your own machine:

```sh
gh pr create -R bilawalsidhu/gods-eye-view \
  --head abiyeenzo:upstream/<slug> --base main \
  --title "<title>" --body-file <body.md>
```

## Merge order (recommended)

1. `deps-refresh` (independent)
2. `french-locale` (independent)
3. `svg-icons` (independent content, see note)
4. `emdash-policy` LAST — it is stacked: on shared files it carries the final combined
   state of 1–3.

If `french-locale` merges BEFORE `emdash-policy`, apply
`docs/upstream-split-prs/fr-rekey.patch` to the `upstream/emdash-policy` branch before
merging it (renames the 107 em-dash keys in `fr.json`; catalog count stays 2682):

```sh
git checkout upstream/emdash-policy
git apply docs/upstream-split-prs/fr-rekey.patch
git commit -m "i18n: re-key fr.json after the em-dash sweep"
git push -f origin upstream/emdash-policy
```

Changelog convention upstream: one `changelog.d/<PR#>-slug.md` fragment per PR (number =
actual PR number). Add after opening each PR; suggested slugs: `deps-refresh`,
`french-locale`, `svg-icons`, `emdash-policy`.

---

## PR 1 — French locale

- Branch: `upstream/french-locale` @ `617574201454b443cb4ad9964f8c10bff7637b32`
- Open: <https://github.com/bilawalsidhu/gods-eye-view/compare/main...abiyeenzo:gods-eye-view:upstream%2Ffrench-locale?expand=1>
- Title: `i18n: ship a complete French locale`
- Verified (this tree, Node 22): `npm run i18n` → es/fr/ru/zh-CN 2682 messages, all
  complete; `npm run build` ✔; `npm run format:check` ✔; localePicker suite 11/11 ✔.

Body:

```md
A full, human-written fr translation of every catalogued UI message
(2682 messages, 100% complete against the current en source strings),
wired into the runtime locale picker.

- src/i18n/locales/fr.json: the catalog itself. Translated by hand for a
  professional register; aviation/HUD codes (HDG, BRG, SQUAWK, ADS-B,
  AIS, CCTV, GNSS...), product names and music genres intentionally
  stay in English.
- src/i18n/same-as-english.json declares those deliberate borrowings so
  the completeness gate does not flag them as untranslated.
- src/i18n/index.js + locale.js: register fr in the locale lists.
- src/ui/localePicker.test.mjs: covers the new option.
- docs/translations/fr.md documents the register and per-domain
  decisions for future translators; docs/TRANSLATORS.md gets the fr row.
- docs/CURRENT-STATE.md and scripts/package-boundaries.json updated to
  list the shipped locale.

Verified on this tree: npm run i18n reports es/fr/ru/zh-CN 2682 messages,
all complete; npm run build; npm test.
```

## PR 2 — Dependency refresh

- Branch: `upstream/deps-refresh` @ `5b99819f` (force-updated after engine adaptations)
- Open: <https://github.com/bilawalsidhu/gods-eye-view/compare/main...abiyeenzo:gods-eye-view:upstream%2Fdeps-refresh?expand=1>
- Title: `deps: refresh browser build stack (cesium 1.146, vite 8, prettier, sharp, ws)`
- Verified: `npm ci` clean; `npm run build` ✔; `npm run format:check` ✔;
  `npm run i18n` ✔; `npm test` → 8546 tests, 8521 pass, **0 failures**
  (23 live-network subtests cancel in the offline sandbox, same as main).

Body: see branch commit message (identical text). Highlights: cesium ^1.130 → ^1.146,
vite ^6 → ^8.3.5, prettier 3.9.10, puppeteer ^25.16.0, sharp ^0.35.5, ws ^8.22.0,
mgrs ^2.2.0, @jtarrio/signals ^0.10.3, @jtarrio/webrtlsdr ^3.0.7; satellite.js stays on
^6.0.2 (7.x = wasm/TLA, unbundlable here). Engine adaptations included:

- starrySky/cyberSonarGpu engine-contract pins revalidated + bumped to 1.146.0
- cyberSonar production transform emulated via `transformWithOxc`
- vite 8 native Host gate runs before plugin middlewares: refusal semantics asserted
  as-is; app responses still carry API policy + nosniff
- infrastructure consumer-build: rolldown lists `inputOwnership.js` in the entry graph

## PR 3 — SVG icons

- Branch: `upstream/svg-icons` @ `f7e4c5fb24e7cb26a5731c3dd9509f61806e886c`
- Open: <https://github.com/bilawalsidhu/gods-eye-view/compare/main...abiyeenzo:gods-eye-view:upstream%2Fsvg-icons?expand=1>
- Title: `ui: replace emoji glyphs with an inline SVG icon set`
- Verified: `npm run build` ✔; `npm run i18n` ✔; `npm run format:check` ✔;
  `npm test` → 8520 pass, the only failing file is the pre-existing live-network
  Kartverket heights suite (identical on unmodified main in this sandbox).

Body: see branch commit message (identical text). Contains: new `src/icons.js` +
`public/icon-moon.svg` + `public/icon-thermal.svg` + `docs/media/icons/status-*.svg`,
`iconSvg` registrations in 18 layers, panel/card/menu rendering, tier dots moved to CSS,
`TRANSIT_MODE_ICON` removal, es/ru/zh-CN emoji key renames (5 per catalog),
package-boundaries registration of `src/icons.js`.

## PR 4 — Em-dash policy (lands last, stacked)

- Branch: `upstream/emdash-policy` @ `20c26c7d9f54666339bba070939a1ab81d71bfb8`
- Open: <https://github.com/bilawalsidhu/gods-eye-view/compare/main...abiyeenzo:gods-eye-view:upstream%2Femdash-policy?expand=1>
- Title: `typography: enforce the no-em-dash style policy repo-wide`
- Verified: `npm run build` ✔; `npm run format:check` ✔;
  `npm run i18n` ✔; pin tests (actionSchemas, radioMarkup, firstRunExperience,
  names.sha256) re-derived and green on this tree; `npm test` → 8546 tests, 8521 pass,
  **0 failures** (23 live-network subtests cancel in the offline sandbox, same as main).

Body: see branch commit message (identical text). Notes for the reviewer:

- Stacked on PRs 1–3: on files they touch it ships the final combined state
  (icon edits + typography + catalog renames). It intentionally does NOT re-ship
  `i18n/index.js`, `i18n/locale.js`, `localePicker.test.mjs` or `fr.json`
  (owned by the French-locale PR).
- If it merges before `french-locale`, no follow-up is needed. If after, apply
  `fr-rekey.patch` (see merge order).

## Fork housekeeping

- Helper branch `sync/upstream-main` on the fork mirrors upstream `abd81155`; it only
  serves as a local review base and can be deleted.
- The fork's `main` (581eef3) already contains all of this work in merged form; the
  deps-adaptation fixes (vite 8 test/tooling adjustments, engine contract pins) are now
  backported on `arena/2a01c2e7-gods-eye-view` along with this document.
