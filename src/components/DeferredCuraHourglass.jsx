import { lazy, Suspense, useEffect, useRef, useState } from "react";

const CuraHourglassScene = lazy(() => import("./CuraHourglassScene.jsx"));

function HourglassFallback() {
  return (
    <span aria-hidden="true" className="cura-hourglass-scene">
      <span className="cura-hourglass-fallback">
        <span className="cura-hourglass-fallback-glass">
          <i className="cura-hourglass-fallback-top" />
          <i className="cura-hourglass-fallback-bottom" />
        </span>
        <span className="cura-hourglass-fallback-axis" />
      </span>
    </span>
  );
}

export default function DeferredCuraHourglass(props) {
  const slotRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "180px" });
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  return (
    <span className="cura-hourglass-slot" ref={slotRef}>
      {shouldLoad
        ? <Suspense fallback={<HourglassFallback />}><CuraHourglassScene {...props} /></Suspense>
        : <HourglassFallback />}
    </span>
  );
}
