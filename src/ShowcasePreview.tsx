import { useId, useRef, useState } from "react";
import { Maximize2, X, Play } from "lucide-react";
import type { Media } from "./profile";
export function ShowcasePreview({
  media = [],
  priority = false,
}: {
  media?: Media[];
  priority?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const view = media[selected] || media[0];
  if (!view) return null;
  const title = view.title || (view.type === "image" ? view.alt : "Video");
  return (
    <>
      <figure className="showcase-preview">
        <div className="showcase-screen" id={id}>
          {media.map((v, i) =>
            v.type === "image" ? (
              <img
                key={v.id}
                src={v.src}
                alt={v.alt}
                hidden={i !== selected}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority && i === 0 ? "high" : "auto"}
              />
            ) : (
              <a
                key={v.id}
                hidden={i !== selected}
                className="profile-video"
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {v.poster && <img src={v.poster} alt="" />}
                <span>
                  <Play /> Watch {v.title} ↗
                </span>
              </a>
            ),
          )}
          {view.type === "image" && (
            <button
              className="preview-expand"
              aria-label="Expand product screenshot"
              onClick={() => dialog.current?.showModal()}
            >
              <Maximize2 size={16} />
            </button>
          )}
        </div>
        <div className="showcase-controls">
          <div
            className="showcase-switcher"
            role="group"
            aria-label="Preview views"
          >
            {media.map((v, i) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={i === selected}
                aria-controls={id}
                onClick={() => setSelected(i)}
              >
                {v.title || (v.type === "image" ? `Image ${i + 1}` : "Video")}
              </button>
            ))}
          </div>
          <figcaption>
            {view.type === "image" ? (
              view.caption
            ) : (
              <>
                {view.transcript && <a href={view.transcript}>Transcript ↗</a>}
              </>
            )}
          </figcaption>
        </div>
        {view.type === "image" && (view.credit || view.rights) && (
          <figcaption>
            {view.credit}
            {view.rights && ` · ${view.rights}`}
          </figcaption>
        )}
      </figure>
      {view.type === "image" && (
        <dialog
          ref={dialog}
          className="preview-dialog"
          aria-label={`${title} screenshot`}
          onClick={(e) => {
            if (e.target === dialog.current) dialog.current.close();
          }}
        >
          <div className="preview-dialog-heading">
            <span>{title} · Product screenshot</span>
            <button
              aria-label="Close screenshot"
              onClick={() => dialog.current?.close()}
            >
              <X size={22} />
            </button>
          </div>
          <img src={view.src} alt={`Expanded ${view.alt}`} />
          <p>{view.caption}</p>
        </dialog>
      )}
    </>
  );
}
