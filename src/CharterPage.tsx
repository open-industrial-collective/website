import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import charter from "../CHARTER.md?raw";
import { ProfileText } from "./ProfileContent";

export function CharterPage() {
  return (
    <div className="container page charter-page">
      <div className="page-heading">
        <div className="eyebrow">PUBLIC LISTING STANDARD · VERSION 1.0</div>
        <h1>The OIC Listing Charter</h1>
        <p>
          What belongs here, how a listing is admitted, and what our review
          means for people who use the catalog.
        </p>
      </div>
      <div className="charter-layout">
        <article className="charter-document">
          <ProfileText>{charter}</ProfileText>
        </article>
        <aside className="charter-aside">
          <ShieldCheck size={32} strokeWidth={1.7} />
          <h2>Every listing has a gate.</h2>
          <p>
            Automated checks find structural and link problems. A maintainer
            decides whether the project meets the Charter. The current process
            does not certify downloads as safe.
          </p>
          <Link className="button primary" to="/share">
            Prepare a listing <ArrowRight size={16} />
          </Link>
          <Link className="text-link" to="/guide">
            See the contributor guide <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
