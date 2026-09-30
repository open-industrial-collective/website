## Before using an industrial tool

OIC is a discovery catalog. Listing review checks the description, free access, publisher attribution, terms and links at a point in time. It does not test the linked software, inspect every release, certify cybersecurity or functional safety, approve a plant installation, or promise that a tool is fit for a particular process. A listing, screenshot, checksum or example is not an authorization to connect to operational technology.

For any industrial environment, have the site's authorized engineering, OT security and safety owners review the exact version and its publisher documentation. First test in an isolated, nonproduction environment using synthetic or approved data. Check network behavior, privileges, dependencies, update and rollback steps, logging, data handling, and effects on availability and control. Follow the site's change-control, backup and incident procedures before any production connection. Keep independent safety functions and human oversight in place.

Do not use an OIC listing or evaluation result as the sole basis for a safety function, control action, protective interlock or production decision. Some listed projects may be previews with no production support. Read the project page and the publisher's own terms for permitted use, support and security-update commitments. A free listing alone does not create a maintenance promise by OIC or Grindstone Systems.

## Grounded in public guidance

The [U.S. Cybersecurity and Infrastructure Security Agency (CISA)](https://www.cisa.gov/) publishes [Secure by Demand guidance for OT owners and operators](https://www.cisa.gov/sites/default/files/2025-01/joint-guide-secure-by-demand-priority-considerations-for-ot-owners-and-operators-508c.pdf). It recommends asking manufacturers about secure design, vulnerability management, support periods, software components, and patching before selecting digital products. [NIST's Guide to OT Security](https://csrc.nist.gov/pubs/sp/800/82/r3/final) addresses the reliability and safety constraints of operational technology. These are useful references for a site's own risk review.

OIC applies those lessons narrowly today: publisher and terms are labeled, linked resources are distinguished from catalog metadata, and listing review does not claim release testing. We have a private reporting path for concerns about the catalog. OIC has **not** completed a CISA assessment, signed a CISA pledge, or received CISA or NIST endorsement. These agencies do not review or certify OIC listings.

## Files, licenses and responsibility

OIC links to publisher-selected repositories, packages, images and documents. It does not host those software payloads or continuously check their contents. Verify the destination, exact version, publisher, applicable license, required platform and any published digest before installation. A publisher-provided digest helps identify bytes if you verify it against the file; it is not a malware or safety finding.

Each tool's publisher sets its software terms and support policy. OIC's listing does not grant rights to use, modify, redistribute or deploy that tool beyond its actual license. Open source, source available and closed source have different rights. An OIC listing does not create a support, patch or indemnity commitment by OIC or Grindstone Systems for another publisher's software. Grindstone-published products have their own product terms; a separate OIC catalog entry does not expand them.

## Report a concern

For a broken link, inaccurate claim or outdated terms, use the [public correction form](https://github.com/open-industrial-collective/website/issues/new?template=correction.yml). Do not put exploit details, credentials, personal information or plant data in a public issue.

For a suspected malicious destination, a vulnerability in the OIC website, or sensitive evidence about a listing, use the [private OIC security report](https://github.com/open-industrial-collective/website/security/advisories/new). For a vulnerability in a linked product, report it to that product's publisher through its security channel. You may separately alert OIC privately if the listing should be corrected or temporarily removed. OIC does not promise patches for software published by others.
