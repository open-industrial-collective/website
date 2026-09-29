import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Play, X } from "lucide-react";
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
  const touchStart = useRef<number | null>(null);
  const id = useId();
  const count = media.length;
  const view = media[selected] || media[0];
  if (!view) return null;
  const title = view.title || (view.type === "image" ? view.alt : "Video");
  const go = (direction: number) =>
    setSelected((current) => (current + direction + count) % count);
  const navigation = (compact = false) =>
    count > 1 && (
      <div
        className={
          compact ? "gallery-arrows gallery-arrows-dialog" : "gallery-arrows"
        }
      >
        <button
          type="button"
          aria-label="Previous media"
          onClick={() => go(-1)}
        >
          <ArrowLeft size={19} />
        </button>
        <button type="button" aria-label="Next media" onClick={() => go(1)}>
          <ArrowRight size={19} />
        </button>
      </div>
    );
  return (
    <>
      <figure
        className="showcase-preview gallery"
        aria-label="Project media gallery"
      >
        <div
          className="showcase-screen"
          id={id}
          tabIndex={count > 1 ? 0 : undefined}
          aria-label={
            count > 1
              ? `${title}. Media ${selected + 1} of ${count}. Use left and right arrow keys to browse.`
              : title
          }
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              go(event.key === "ArrowRight" ? 1 : -1);
            }
          }}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null || count < 2) return;
            const delta = event.changedTouches[0].clientX - touchStart.current;
            if (Math.abs(delta) > 45) go(delta < 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          {media.map((item, index) =>
            item.type === "image" ? (
              <img
                key={item.id}
                src={item.src}
                alt={item.alt}
                hidden={index !== selected}
                loading={priority && index === 0 ? "eager" : "lazy"}
                fetchPriority={priority && index === 0 ? "high" : "auto"}
              />
            ) : (
              <a
                key={item.id}
                hidden={index !== selected}
                className="profile-video"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.poster && <img src={item.poster} alt="" />}
                <span>
                  <Play size={19} /> Watch {item.title} ↗
                </span>
              </a>
            ),
          )}
          {count > 1 && (
            <span className="gallery-count">
              {selected + 1} / {count}
            </span>
          )}
          {navigation()}
          {view.type === "image" && (
            <button
              type="button"
              className="preview-expand"
              aria-label="Expand product screenshot"
              onClick={() => dialog.current?.showModal()}
            >
              <Maximize2 size={17} />
            </button>
          )}
        </div>
        <div className="gallery-meta">
          <div>
            <span className="gallery-kicker">
              {view.type === "image" ? "Product screenshot" : "Video"}
            </span>
            <strong>{title}</strong>
          </div>
          {view.type === "image" && view.caption && (
            <figcaption>{view.caption}</figcaption>
          )}
          {view.type === "video" && view.transcript && (
            <a href={view.transcript} target="_blank" rel="noopener noreferrer">
              Transcript ↗
            </a>
          )}
        </div>
        {count > 1 && (
          <div
            className="gallery-thumbnails"
            role="group"
            aria-label="Choose media"
          >
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className="gallery-thumb"
                aria-label={
                  item.title ||
                  (item.type === "image" ? item.alt : `Video ${index + 1}`)
                }
                aria-pressed={index === selected}
                aria-controls={id}
                onClick={() => setSelected(index)}
              >
                {item.type === "image" ? (
                  <img src={item.src} alt="" loading="lazy" />
                ) : item.poster ? (
                  <img src={item.poster} alt="" loading="lazy" />
                ) : (
                  <span className="gallery-thumb-video">
                    <Play size={20} />
                  </span>
                )}
                {item.type === "video" && (
                  <Play className="gallery-thumb-play" size={16} />
                )}
                <span className="gallery-thumb-label">
                  {item.title ||
                    (item.type === "image" ? `Image ${index + 1}` : "Video")}
                </span>
              </button>
            ))}
          </div>
        )}
        {view.type === "image" && (view.credit || view.rights) && (
          <figcaption className="gallery-credit">
            {view.credit}
            {view.rights && ` · ${view.rights}`}
          </figcaption>
        )}
      </figure>
      <dialog
        ref={dialog}
        className="preview-dialog"
        aria-label={`${title} ${view.type === "image" ? "screenshot" : "video"}`}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            go(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div className="preview-dialog-heading">
          <span>
            {title} · {selected + 1} of {count}
          </span>
          <button
            type="button"
            aria-label={
              view.type === "image" ? "Close screenshot" : "Close video"
            }
            onClick={() => dialog.current?.close()}
          >
            <X size={22} />
          </button>
        </div>
        {view.type === "image" ? (
          <img src={view.src} alt={`Expanded ${view.alt}`} />
        ) : (
          <a
            className="gallery-dialog-video"
            href={view.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {view.poster && <img src={view.poster} alt="" />}
            <span>
              <Play size={20} /> Watch video ↗
            </span>
          </a>
        )}
        <div className="preview-dialog-footer">
          <p>
            {view.type === "image"
              ? view.caption
              : view.transcript && <a href={view.transcript}>Transcript ↗</a>}
          </p>
          {navigation(true)}
        </div>
      </dialog>
    </>
  );
}
