# Open Industrial Collective

[Live website](https://openindustrialcollective.org) · [Offer a contribution](https://github.com/open-industrial-collective/website/issues/new?template=participation.yml) · [Submit a listing](https://github.com/open-industrial-collective/website/issues/new?template=listing.yml) · [Report a correction](https://github.com/open-industrial-collective/website/issues/new?template=correction.yml)

Free industrial tool discovery. React + Vite, static at runtime. This public repository contains the website, profile standard, approved listing snapshots and review workflow. Application source belongs to each project and may remain private. The four curated examples are attributed to their actual creators and are not maintainer submissions.

## People and participation

The `/community` page explains how to participate and shows a small reviewed stewardship roster from `src/people.ts`. It currently lists Grindstone Systems as founding initiator. GitHub organization membership is private by default and is never imported into the public page. Add an individual only after they accept a scoped role and separately approve the displayed fields; keep the consent record outside the published bundle. The live `Offer a contribution` Issue template is a public first-step invitation, not an application for organization access. OIC is still founder-led and does not promise a response time. See the private coordination handbook's `docs/governance/MEMBERSHIP_AND_STEWARDSHIP.md` for the full working model.

## Run

Node 22.13 or newer:

```sh
npm ci
npm run dev
npm run check
npm run preview
```

The coordinated development workspace also keeps this directory under `website/`; its private root contains historical engineering records that are not part of this public repository. Changes in the public repository must be reconciled into that workspace before its next publication.

## Author a profile

Start with [the v2 template](public/templates/project-v2.yaml), or use [the editor](https://openindustrialcollective.org/share). Commit `.oic/project.yaml` and its declared files in a public repository. OIC can host a listing-only repository if your source is private. The current Dimension Engine example is [here](https://github.com/open-industrial-collective/dimension-engine-listing).

The schema is [project-v2.schema.json](src/project-v2.schema.json), published at `https://openindustrialcollective.org/data/project-v2.schema.json`. V1 remains supported for existing listings. The editor imports and exports either version without dropping supported fields. Its simple form edits core details; YAML exposes all rich fields. It does not load repository files in the browser and labels that limitation explicitly.

Required: identity, publisher, description, category/tags/platforms, source availability, real license/terms URL, free-edition access notes, explicit requirements (including an empty list), actions with exactly one primary, lifecycle and visibility.

Optional: light/dark logos, ordered screenshots and external videos, captions/credits/rights, FAQs, documentation/wiki/support/issues/discussions/changelog links, and a release. No arbitrary page styling. Empty sections are hidden. `actions[].label` and `description` support useful project-specific calls to action without special page code.

Descriptions use `{text: ...}` or `{file: ./overview.md}`. Markdown supports paragraphs, lists, headings, emphasis, code and HTTPS links. HTML, embedded images and executable content are not rendered. Videos open their external destination; no autoplay, tracking iframe or OIC video hosting.

### Limits

- YAML: 64 KB, unique keys, no aliases or custom tags; supported keys only.
- Overview file: 20 KB. Up to 10 FAQs and 8 media entries.
- Static PNG/JPEG/WebP only: 2 MB per file, 12 megapixels, 20 MB total referenced input.
- Paths stay beneath the manifest directory at one pinned commit. No remote includes, path traversal, symlinks or submodules.
- Imported images are decoded, stripped of metadata, converted to WebP and stored under content hashes. Runtime pages never hotlink contributor images.
- HTTPS links without credentials. License and source availability are separate; a free edition is not necessarily open source.

## Submit and update

1. Open a **Submit a project** issue with your public profile repository and path.
2. An OIC reviewer confirms repository control and the submitter's numeric GitHub account ID, free access, costs, license, destinations and media permission. A YAML claim alone does not establish ownership.
3. The reviewer registers the numeric repository ID, expected owner/name, path, branch and controller in `content/sources.json`, and adds an actual review record in `content/reviews.json`.
4. Fetch an immutable candidate, review it, then approve the exact digest:

```sh
npm run profile -- fetch your-project --path .oic/project.yaml
# Inspect content/candidates/your-project.json and its media before approving.
npm run profile -- approve your-project --digest EXACT_SHA256_FROM_FETCH
npm run check
```

Commit the resulting manifest and snapshot together. Merging reviewed changes and deployment publishes them. `content/reviews.json` is controlled by OIC, never by author YAML. Website builds are offline and use approved snapshots; a failed refresh leaves the last published version working.

For a committed local pilot, `fetch ID --local /path/to/repo --path .oic/project.yaml` uses the same importer. Never run a contributor build or install its dependencies to ingest a profile.

All updates require review in this first release, including image-only changes. The daily public GitHub Actions job checks up to 25 registered profiles and opens a candidate PR when content changes. It does not approve or publish the candidate. Source moves/renames are held for controller review. Errors appear in the workflow run; OIC's maintainer follows up in the source's enrollment issue where needed. No issue-submitted URL is fetched before registration.

`visibility: withdrawn` hides an approved profile; `maintenance: archived` retains a visible status label. Reverting the manifest and snapshot together restores an earlier approved version. A missing repo does not silently delete its listing. Candidate PRs include the pinned commit and content digest; published pages link to their approved source commit.

Listing submitters grant scoped permission to display, resize and cache submitted text/media for OIC. This does not relicense their software or third-party media. A blanket license for this website's own code has not been selected; do not infer one from public visibility.

## Search discovery

The production build prerenders every visible page and reviewed listing into route-specific HTML, emits `sitemap.xml`, and provides a real `404.html`. `robots.txt` points to the sitemap. Social previews use `public/brand/oic-social.png` or approved project imagery. Search metadata and routes come from `src/seo.ts`; update that file when adding a public page. `npm run check` validates the rendered output. Vercel serves the route files through clean URLs; do not restore a catch-all rewrite to the home page.

The domain is verified in Google Search Console under the founder's existing Google account. Bing Webmaster Tools is verified with its HTML meta tag in `index.html`; keep that tag while the account owns the property. The live sitemap has been submitted to both services. Search inclusion and ranking are external decisions, not a deployment guarantee.

## Hosting and cost boundary

The site has no server functions, database, paid media pipeline or custom account service. The current deployment uses the existing Vercel Hobby account. GitHub standard hosted runners are free for public repositories; the refresh workflow has a 15-minute timeout and no stored build artifacts.

A GitHub organization and a Vercel team are separate. The OIC organization owns the public website repository and listing repositories. The public website repository is connected to the existing Vercel project for Git deployments. Keep Vercel on its existing free account unless a separate team or plan is explicitly approved. No paid seat, Pro trial, metered service, paid runner or recurring commitment is authorized. Hobby is subject to eligibility and usage limits; a commercial change or exhausted allowance requires a fresh hosting decision before spending.

The standalone public repository builds with `npm run build`, output `dist`. `vercel.json` defines routing and strict CSP. The private coordination root also has a reviewed-subset deployment helper; it must not expose its own Git history.

## Verification

`npm run check` runs validation, normalization and ingestion tests, TypeScript and a production build. `OIC_BASE_URL=http://127.0.0.1:4180 node tests/browser.mjs` tests navigation, gallery/modal keyboard behavior, filtering, imports, exports and responsive layouts in installed Chrome. Test captures are local and excluded from publication.

The UI uses local Inter fonts, Lucide icons and OIC's existing vector identity. Dimension Engine media depicts synthetic or reference data and retains its attribution. The importer never connects to a plant.

The `main` branch requires a pull request and passing `check` status for non-admin updates. The sole bootstrap owner retains an admin override; independent multi-person review is not claimed. Force pushes and branch deletion are disabled. GitHub Actions may create candidate PRs, but this workflow never approves or merges them.
