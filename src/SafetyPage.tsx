import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import safety from "../SAFETY.md?raw";
import { ProfileText } from "./ProfileContent";

export function SafetyPage() {
  return (
    <div className="container page charter-page">
      <div className="page-heading">
        <div className="eyebrow">USE & SECURITY</div>
        <h1>Using industrial tools responsibly</h1>
        <p>What OIC checks, what your site must check, and where to report a concern.</p>
      </div>
      <div className="charter-layout">
        <article className="charter-document">
          <ProfileText>{safety}</ProfileText>
        </article>
        <aside className="charter-aside">
          <BookOpen size={32} strokeWidth={1.7} />
          <h2>Check before connecting.</h2>
          <p>
            Start with an isolated test and your site's authorized OT, security
            and safety review. Catalog inclusion is not production approval.
          </p>
          <Link className="button primary" to="/explore">
            Explore projects <ArrowRight size={16} />
          </Link>
          <Link className="text-link" to="/charter">
            Listing Charter <ArrowRight size={15} />
          </Link>
          <div className="safety-sources">
            <span className="eyebrow">PRIMARY SOURCES</span>
            <a
              href="https://www.cisa.gov/sites/default/files/2025-01/joint-guide-secure-by-demand-priority-considerations-for-ot-owners-and-operators-508c.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              CISA · Secure by Demand for OT <ArrowRight size={15} />
            </a>
            <a
              href="https://csrc.nist.gov/pubs/sp/800/82/r3/final"
              target="_blank"
              rel="noopener noreferrer"
            >
              NIST · Guide to OT Security <ArrowRight size={15} />
            </a>
            <small>References only. No agency affiliation or endorsement.</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
