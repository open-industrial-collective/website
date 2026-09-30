## The promise

OIC catalogs useful industrial tools that people can actually try or obtain for free. A listing is a reviewed description and set of links, not a security certificate or an endorsement for production use. This Charter applies to founder projects, community submissions, curated examples, and every update.

## Admission standards

1. **A real free path.** The listed edition must be available for ongoing use at no software charge. A time-limited trial alone does not qualify. State any account, capacity, feature, support, or use limits. A required commercial host or hardware purchase is permitted only when its separate cost is prominent and the listed tool itself is free.
2. **A real publisher and permission.** Name the creator or responsible maintainer. A submitter must control the public profile repository or show permission to represent the project and display its text and media. Third-party tools can be suggested as attributed curated examples; a suggester is not presented as their publisher.
3. **Clear rights.** Link to the actual software license or free-use terms. Label source as open source, source available, or closed source according to those terms. A visible repository by itself does not establish an open-source license. Give each downloadable file, container, or document its own terms when they differ from the project terms.
4. **Useful, specific information.** Explain what the tool does, its current stage, how to get started, supported environment, and required platforms or services. List the available files and destinations accurately. Screenshots and claims should depict the actual product or be identified as simulations. The submission must add practical value beyond copied marketing text or an empty generated page. AI assistance is allowed; accuracy, ownership, and usefulness are the criteria.
5. **Safe and lawful presentation.** No impersonation, deceptive download buttons, credential collection disguised as setup, malware, unauthorized files, exposed secrets, or private plant data. External destinations must be relevant and publicly identifiable. OIC may reject a submission or withdraw a listing when credible concerns arise.

For a tool that connects to, writes to, controls, or remotely accesses an industrial system, the profile and publisher documentation must disclose that behavior, the intended environment, required privileges and network access, and the available installation, rollback, security-reporting and support information. An unknown or missing support period must be stated as unknown; catalog admission does not promise patches. Safety-function or production-readiness claims require evidence beyond a catalog listing and must not be implied by OIC publication.

## What the automated gate checks

The profile validator checks the YAML shape, required fields, free cost value, one primary action, HTTPS links, supported media and file limits. The Charter preflight blocks known placeholder, local, and IP-only destinations. It asks for review when a fixed download has no publisher checksum, a container uses a mutable tag, access needs an account, or documentation is unclear. Import reads only declared text and image files at a pinned source commit. It does not run submitted code or download the linked software.

Automated checks are deliberately narrow. A valid YAML file can still be junk, misleading, infringing, or unsafe. A checksum supplied by the publisher identifies bytes only when independently checked against the actual file; it does not establish that the file is harmless. A scanner result, when one exists, is time- and scope-limited.

## Publication decisions

1. A public issue requests enrollment. The issue is an intake record, not a listing. OIC may close spam, duplicates, or incomplete requests without publication.
2. A maintainer confirms the profile repository and controller, checks the free path, rights, requirements, links, media, and practical usefulness against available sources, and records a decision. Unclear claims are returned for correction. A person makes the admission decision; passing automation never publishes a listing.
3. OIC fetches the profile at a specific commit, approves its exact content digest, and publishes it through a reviewed website change and required CI. Updates repeat this process. A failed update leaves the previously approved page in place.
4. OIC may correct or withdraw a listing when terms change, links become unsafe, the free path disappears, or a credible report needs investigation. Reports and reconsideration requests can use the public correction issue. Send sensitive security reports through the [private OIC reporting route](https://github.com/open-industrial-collective/website/security/advisories/new); do not post exploit details or private data publicly.

The current program is founder-led. The founder may review an owner-authored listing against the same criteria. That is **maintainer review**, not independent assessment. There is no public OIC malware-free badge, grade, certification, or independently verified release claim today.

## What visitors can rely on

A visible listing has passed OIC's catalog admission process for the displayed profile snapshot. Resource links lead to publisher-chosen locations; OIC does not host or continuously inspect the downloaded payload. Check the publisher, release version, terms, system requirements, and any checksum before installation. Use your organization's normal security and change-control process for industrial systems. Read the [industrial use and security guidance](https://openindustrialcollective.org/safety) before connecting a tool to OT. If a public listing fact is wrong, [report a correction](https://github.com/open-industrial-collective/website/issues/new?template=correction.yml); report a suspicious link privately.

## How this Charter changes

OIC keeps this Charter in the public website repository. Substantive changes go through a public pull request and apply prospectively to new and updated listings. Existing listings can be revisited when a change addresses a material safety, rights, or accuracy issue. Charter version: **1.1 · September 30, 2026**.
