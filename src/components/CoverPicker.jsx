import { useEffect, useRef, useState } from "react";
import { CircleClose } from "./NavigationControls.jsx";

export default function CoverPicker({
  className = "",
  currentCover,
  currentId,
  labels,
  onChange,
  options,
}) {
  const buttonRef = useRef(null);
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    window.requestAnimationFrame(() => (
      dialog.querySelector('[aria-pressed="true"]')?.focus()
    ));
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleEscape(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  function close() {
    if (dialogRef.current?.open) dialogRef.current.close();
    setOpen(false);
    window.requestAnimationFrame(() => buttonRef.current?.focus());
  }

  return (
    <>
      <button
        className={`writing-cover-trigger ${className}`.trim()}
        onClick={() => setOpen(true)}
        ref={buttonRef}
        type="button"
      >
        <span className="writing-cover-trigger-preview" aria-hidden="true">
          <img alt="" src={currentCover} />
        </span>
        <span>
          <small>{labels.edition}</small>
          <strong>{labels.choose}</strong>
        </span>
      </button>

      {open ? (
        <dialog
          aria-labelledby="cover-picker-title"
          className="writing-cover-picker"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
          ref={dialogRef}
        >
          <header>
            <div>
              <p>{labels.edition}</p>
              <h3 id="cover-picker-title">{labels.choose}</h3>
              <span>{labels.hint}</span>
            </div>
            <CircleClose label={labels.close} onClick={close} />
          </header>
          <div className="writing-cover-options">
            {options.map((cover) => (
              <button
                aria-label={`${labels.choose}: ${cover.label}`}
                aria-pressed={currentId === cover.id}
                key={cover.id}
                onClick={() => {
                  onChange(cover.id);
                  close();
                }}
                type="button"
              >
                <span aria-hidden="true"><img alt="" src={cover.cover} /></span>
                <strong>{cover.label}</strong>
              </button>
            ))}
          </div>
        </dialog>
      ) : null}
    </>
  );
}
