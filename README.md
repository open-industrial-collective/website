# Open Industrial Collective

[Message and visual direction](MESSAGING_AND_VISUAL_DIRECTION.md) records the founder-reviewed public language and the dimensional illustration system.

[Live website](https://openindustrialcollective.org) · [Suggest a tool](https://github.com/open-industrial-collective/website/issues/new?template=tool-suggestion.yml) · [Offer a contribution](https://github.com/open-industrial-collective/website/issues/new?template=participation.yml) · [Submit a listing](https://github.com/open-industrial-collective/website/issues/new?template=listing.yml) · [Report a correction](https://github.com/open-industrial-collective/website/issues/new?template=correction.yml)

A home for free industrial software and the builders bringing it to industry. React + Vite, static at runtime. This public repository contains the website, profile standard, approved listing snapshots and review workflow. Application source belongs to each project and may remain private. The active catalog contains the publisher-submitted Dimension Engine Showcase and Visual Toolkit. The four initial example listings have been retired.

## People and participation

The Community page leads with a short public suggestion Issue, the publisher-owned YAML path, and contribution offers. Suggestions require a name, public link and industrial use; they do not claim owner control or grant media rights. A steward triages each suggestion as **needs source/free-access check**, **needs publisher follow-up**, **ready for separately attributed curation**, or **out of scope/closed** in the Issue discussion. An owner-authored listing still requires a public profile repository and exact-snapshot review. Corrections use their own Issue Form. All Issues require GitHub sign-in and are public. No non-GitHub contact address is published until a monitored destination is approved.

The `/community` page explains how to participate and shows a small reviewed stewardship roster from `src/people.ts`. It currently lists Grindstone Systems as founding initiator and links its verified website. Steward website links are reviewed fields; GitHub organization membership is private by default and is never imported into the public page. Add an individual only after they accept a scoped role and separately approve the displayed fields; keep the consent record outside the published bundle. The live `Offer a contribution` Issue template is a public first-step invitation, not an application for organization access. OIC is still founder-led and does not promise a response time. See the private coordination handbook's `docs/governance/MEMBERSHIP_AND_STEWARDSHIP.md` for the full working model.

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

Read the [public Listing Charter](CHARTER.md) before preparing a profile. It defines the admission standard, objective preflight checks, maintainer decision process, withdrawal path, and the limits of catalog review. The website renders this same document at `/charter`.

Start with [the v2 template](public/templates/project-v2.yaml), or use [the editor](https://openindustrialcollective.org/share). Commit `.oic/project.yaml` and its declared files in a public repository. OIC can host a listing-only repository if your source is private. The Dimension Engine profile is [here](https://github.com/open-industrial-collective/dimension-engine-listing).

The editor downloads incomplete work as `project-draft.yaml`; open it later in the form to continue. Only a schema-valid, preflight-clear profile can download `project.yaml`. Downloading does not submit or publish a listing. Drafts stay on the device until explicitly downloaded.

The [use and security page](https://openindustrialcollective.org/safety) states the plant-deployment boundary, links to CISA and NIST primary guidance, and explains reporting. The [security policy](SECURITY.md) uses GitHub private vulnerability reporting, which is enabled for this repository. CISA's logo is not used; citing government guidance does not imply agency endorsement.

The schema is [project-v2.schema.json](src/project-v2.schema.json), published at `https://openindustrialcollective.org/data/project-v2.schema.json`. V1 remains supported for existing listings. The editor imports and exports either version without dropping supported fields. Its guided form edits core details, ordered image/video media and resources; YAML exposes all rich fields. It does not load repository files in the browser and labels that limitation explicitly.

Required: identity, publisher, description, category/tags/platforms, source availability, real license/terms URL, free-edition access notes, explicit requirements (including an empty list), actions with exactly one primary, lifecycle and visibility.

The editor runs the same offline Charter preflight as the publication build. Known placeholder, local and IP-only link destinations block publication. Missing publisher checksums for fixed downloads, mutable container tags, account-gated access and unclear documentation are review prompts. A clean preflight never approves or publishes a listing, and it cannot verify the contents of a linked artifact.

Optional: light/dark logos, ordered screenshots, GIF motion previews and external videos, captions/credits/rights, FAQs, documentation/wiki/support/issues/discussions/changelog links, and a release. No arbitrary page styling. Empty sections are hidden. `actions[].label` and `description` support useful project-specific calls to action without special page code.

### Check before you submit

The profile check runs the importer and Charter preflight that review uses against your own checkout: schema, declared files, image and GIF limits, and destinations. It reads files only and fetches nothing. Blocking findings exit non-zero; review prompts are printed but pass unless you ask for `--strict`. Like the preflight, a clean check never approves or publishes a listing.

In your repository's CI:

```yaml
- uses: actions/checkout@v4
- uses: open-industrial-collective/website/profile-check@main
  # with: { path: .oic/project.yaml, strict: "true" }
```

Locally, from a checkout of this repository (Node 22.13 or newer):

```sh
npm ci
npm run profile:check -- ../your-repo            # the working tree; flags files that aren't committed yet
npm run profile:check -- ../your-repo --ref HEAD # exactly what OIC would import from that commit
```

With `--ref`, the digest it prints is the one a reviewer's `fetch` produces for the same commit.

### Files and resources

Use optional `resources[]` for the actual things a visitor can obtain: a source repository, release asset (`.zip`, `.modl`, etc.), container image, or document. Each resource has a title, HTTPS destination and access status; optional fields cover description, format, version, setup requirements, a file's SHA-256 checksum, and a container image reference. A resource uses the project license unless `resources[].license` supplies distinct terms. Add a separate resource for every materially different package or rights set. A public repository is not automatically an open-source claim; the `source.availability` field and actual terms still govern that label.

OIC displays reviewed links and metadata. The submitter hosts or selects the actual file/registry destination and controls releases there. Prefer versioned release URLs and immutable container digests when possible; update the profile when a resource moves or its terms change. The browser opens publisher URLs and does not copy or rehost binaries, containers or documents. `Get file` opens an external destination and may lead to a provider page or prompt for an account as declared. Review checks that a destination is relevant, free for the listed edition, and consistent with the declared license and requirements, but OIC does not independently attest binary contents or ongoing availability.

Descriptions use `{text: ...}` or `{file: ./overview.md}`. Markdown supports paragraphs, lists, headings, emphasis, code and HTTPS links. HTML, embedded images and executable content are not rendered. Videos open their external destination; no autoplay, tracking iframe or OIC video hosting.

### Limits

- YAML: 64 KB, unique keys, no aliases or custom tags; supported keys only.
- Overview file: 20 KB. Up to 10 FAQs and 8 media entries.
- PNG/JPEG/WebP screenshots and GIF motion previews: 2 MB input per file, 20 MB total referenced input. Static images are limited to 12 megapixels; GIFs to 2 megapixels per frame, 24 megapixels total decoded, 60 frames, 20 seconds and 6 MB after conversion. Logos and video posters remain static images.
- Paths stay beneath the manifest directory at one pinned commit. No remote includes, path traversal, symlinks or submodules.
- Imported images are decoded, stripped of metadata, converted to WebP and stored under content hashes. GIFs become animated WebP plus a still preview. The still appears in Explore and gallery thumbnails; visitors choose when to play the animation. Runtime pages never hotlink contributor images.
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

## Explore metadata and behavior

Optional v2 `discovery` separates stable capability IDs, product type, platform relationships, delivery options, environments, deployment, interfaces and access declarations. The [filter glossary](https://openindustrialcollective.org/explore/glossary) documents the taxonomy. Existing v1/v2 profiles remain valid. Legacy categories map to stable IDs; unprovided compatibility, use rights, offline operation and release data stay unknown. The form edits the primary capability, product type and specific capabilities; YAML exposes the complete optional structure without dropping it on round trip.

Each `options[]` entry describes one valid delivery/environment/deployment combination and can reference an existing `resources[].id`. A match across these dimensions must fit one option. Only describe packages actually offered by the listing. Platform relationships distinguish `requires`, `integrates` and `exports`; a version or evidence link is optional and never implies independent testing. `air_gap: documented` requires `air_gap_url`. It is separate from offline runtime operation.

Explore supports OR within filter groups, AND across groups, facets that respect the other constraints, aliases, explicit zero-result relaxations, and shareable search/filter/sort/view/comparison URLs. Filter and view changes create history entries; typing updates the current entry. A visible Filters button beside search opens a side drawer on desktop and a bottom drawer on phones. The `Ignition` and `Ignition Perspective` relationship names appear together as `Ignition Platform`; old filter URLs still work. Compare up to three listings without scores. Collection shortcuts derive from the same records and show only when matching inventory exists. Listing `added` is the original publication date, separate from `reviewed` and software `release.date`; unknown dates sort last.

Explorer cards lead with free access, purpose, format and platform fit. Terms, source status and dates expand on demand. List view is a horizontally scrollable comparison table on narrow screens. New profiles may declare `application`, `tool` or `demo` as their product type; a module is an extension delivered as `module` in `options[]`. Existing listings get an editorial browsing label from approved edition and delivery fields. A demo label does not imply a downloadable application or module. Publisher names link to the publisher's verified website when known, otherwise to the submitted publisher URL. The site shows `added` and latest listing `reviewed` dates and displays a software version only when the publisher declares `release`. A review date is never presented as a software release date.

The catalog does not add analytics or activity claims. `npm run check` covers schema, package matching, facets, aliases, sorting and prerender output; `node tests/explore.mjs` covers navigation, keyboard focus, comparison and mobile return context against a running preview.

## Search discovery

The production build prerenders every visible page and reviewed listing into route-specific HTML, emits `sitemap.xml`, and provides a real `404.html`. `robots.txt` points to the sitemap. Social previews use `public/brand/oic-social.png` or approved project imagery. Search metadata and routes come from `src/seo.ts`; update that file when adding a public page. `npm run check` validates the rendered output. Vercel serves the route files through clean URLs; do not restore a catch-all rewrite to the home page.

The domain is verified in Google Search Console under the founder's existing Google account. Bing Webmaster Tools is verified with its HTML meta tag in `index.html`; keep that tag while the account owns the property. The live sitemap has been submitted to both services. Search inclusion and ranking are external decisions, not a deployment guarantee.

## Hosting and cost boundary

The site has no server functions, database, paid media pipeline or custom account service. The current deployment uses the existing Vercel Hobby account. GitHub standard hosted runners are free for public repositories; the refresh workflow has a 15-minute timeout and no stored build artifacts.

A GitHub organization and a Vercel team are separate. The OIC organization owns the public website repository and listing repositories. The public website repository is connected to the existing Vercel project for Git deployments. Keep Vercel on its existing free account unless a separate team or plan is explicitly approved. No paid seat, Pro trial, metered service, paid runner or recurring commitment is authorized. Hobby is subject to eligibility and usage limits; a commercial change or exhausted allowance requires a fresh hosting decision before spending.

The standalone public repository builds with `npm run build`, output `dist`. `vercel.json` defines routing and strict CSP. The private coordination root also has a reviewed-subset deployment helper; it must not expose its own Git history.

## Verification

`npm run check` runs validation, Charter preflight, normalization and ingestion tests, TypeScript and a production build. `OIC_BASE_URL=http://127.0.0.1:4180 node tests/browser.mjs` tests navigation, gallery/modal keyboard behavior, filtering, imports, exports and responsive layouts in installed Chrome. Run `OIC_BASE_URL=http://127.0.0.1:4180 node tests/mobile.mjs` for touch workflows and all public routes (including 404) across phone, tablet, landscape and desktop widths in Chrome and WebKit. Install the Playwright WebKit browser with `npx playwright install webkit` if needed. It checks collapsible filters, URL persistence, menu dismissal, gallery rotation, YAML import/export, touch targets, readable inputs and overflow under the deployment CSP. Test captures are local and excluded from publication.

The UI uses local Inter fonts, Lucide icons and OIC's existing vector identity. Project media appear in a thumbnail carousel with arrow, keyboard and touch navigation; videos open at publisher URLs. Dimension Engine media depicts synthetic or reference data and retains its attribution. The importer never connects to a plant.

The `main` branch requires a pull request and passing `check` status for non-admin updates. The sole bootstrap owner retains an admin override; independent multi-person review is not claimed. Force pushes and branch deletion are disabled. GitHub Actions may create candidate PRs, but this workflow never approves or merges them.
