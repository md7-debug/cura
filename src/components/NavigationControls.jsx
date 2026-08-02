import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

export function CapsuleNavigator({
  className = "",
  label,
  nextLabel,
  onNext,
  onPrimary,
  onPrevious,
  primaryRef,
  previousLabel,
}) {
  return (
    <div className={`capsule-navigator ${className}`.trim()}>
      <button aria-label={previousLabel} className="capsule-chevron" onClick={onPrevious} type="button">
        <CaretLeft aria-hidden="true" size={22} weight="light" />
      </button>
      <button className="capsule-primary" onClick={onPrimary} ref={primaryRef} type="button">
        {label}
      </button>
      <button aria-label={nextLabel} className="capsule-chevron" onClick={onNext} type="button">
        <CaretRight aria-hidden="true" size={22} weight="light" />
      </button>
    </div>
  );
}

export function CircleClose({ className = "", label, onClick }) {
  return (
    <button
      aria-label={label}
      className={`circle-action ${className}`.trim()}
      onClick={onClick}
      type="button"
    >
      <X aria-hidden="true" size={21} weight="light" />
    </button>
  );
}
