import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CoverPicker from "./CoverPicker.jsx";
import { CapsuleNavigator, CircleClose } from "./NavigationControls.jsx";

const BOOK_WIDTH = 1.48;
const BOOK_HEIGHT = 2.25;
const BOOK_DEPTH = 0.24;
const OPEN_TRANSITION_MS = 1300;

function damp(current, target, rate, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-rate * delta));
}

function createBook(collection, index, loader, interactiveMeshes) {
  const root = new THREE.Group();
  const pageMaterial = new THREE.MeshStandardMaterial({ color: 0xe8dfcf, roughness: 0.92 });
  const clothMaterial = new THREE.MeshStandardMaterial({
    color: collection.coverColor ?? 0x8c8173,
    roughness: 0.88,
  });
  const coverTexture = loader.load(`${import.meta.env.BASE_URL}${collection.cover}`);
  coverTexture.colorSpace = THREE.SRGBColorSpace;
  coverTexture.anisotropy = 8;
  const coverFaceMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: coverTexture,
    roughness: 0.76,
  });

  const pageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(BOOK_WIDTH - 0.13, BOOK_HEIGHT - 0.14, BOOK_DEPTH - 0.02),
    pageMaterial,
  );
  pageBlock.position.z = -0.01;
  pageBlock.castShadow = true;
  pageBlock.receiveShadow = true;
  root.add(pageBlock);

  const backCover = new THREE.Mesh(
    new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, 0.07),
    clothMaterial,
  );
  backCover.position.z = -BOOK_DEPTH / 2;
  backCover.castShadow = true;
  root.add(backCover);

  const frontPivot = new THREE.Group();
  frontPivot.position.set(-BOOK_WIDTH / 2, 0, BOOK_DEPTH / 2);
  const frontCover = new THREE.Mesh(
    new THREE.BoxGeometry(BOOK_WIDTH, BOOK_HEIGHT, 0.07),
    [
      clothMaterial,
      clothMaterial,
      clothMaterial,
      clothMaterial,
      coverFaceMaterial,
      clothMaterial,
    ],
  );
  frontCover.position.x = BOOK_WIDTH / 2;
  frontCover.castShadow = true;
  frontCover.userData.collectionId = collection.id;
  frontPivot.add(frontCover);
  root.add(frontPivot);
  interactiveMeshes.push(frontCover);

  root.position.set((index - 2) * 2.05, -0.55, 0);
  root.userData.baseX = root.position.x;
  root.userData.collectionId = collection.id;

  return { coverTexture, frontPivot, root };
}

function StaticShelf({
  collections,
  coverOptions,
  labels,
  locale,
  onCoverChange,
  onOpenReading,
  onSelect,
  selectedId,
}) {
  const openButtonRef = useRef(null);
  const openTransitionRef = useRef(null);
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const selectedItemRef = useRef(null);
  const [openingId, setOpeningId] = useState(null);
  const selectedIndex = Math.max(0, collections.findIndex((collection) => collection.id === selectedId));
  const selected = collections.find((collection) => collection.id === selectedId) ?? collections[0];
  const selectedCoverOptions = [
    {
      cover: `${import.meta.env.BASE_URL}${selected.originalCover}`,
      id: "original",
      label: labels.originalCover,
    },
    ...coverOptions,
  ];

  useEffect(() => {
    const track = trackRef.current;
    const item = selectedItemRef.current;
    if (!track || !item) return;
    track.scrollTo({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      left: item.offsetLeft - (track.clientWidth - item.clientWidth) / 2,
    });
  }, [selectedId]);

  useEffect(() => () => window.clearTimeout(openTransitionRef.current), []);

  useEffect(() => {
    if (!openingId || openingId === selectedId) return;
    window.clearTimeout(openTransitionRef.current);
    setOpeningId(null);
  }, [openingId, selectedId]);

  useEffect(() => {
    if (!openingId) return;
    window.requestAnimationFrame(() => {
      rootRef.current?.querySelector(".library-shelf-static-close")?.focus();
    });
  }, [openingId]);

  function selectOffset(offset) {
    if (openingId) return;
    const nextIndex = (selectedIndex + offset + collections.length) % collections.length;
    onSelect(collections[nextIndex].id);
  }

  function openSelected() {
    setOpeningId(selected.id);
    window.clearTimeout(openTransitionRef.current);
    openTransitionRef.current = window.setTimeout(
      () => onOpenReading(selected.id),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : OPEN_TRANSITION_MS,
    );
  }

  function closeSelected() {
    window.clearTimeout(openTransitionRef.current);
    setOpeningId(null);
    window.requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  function enterSelected() {
    window.clearTimeout(openTransitionRef.current);
    onOpenReading(selected.id);
  }

  return (
    <div
      aria-busy={Boolean(openingId)}
      aria-label={labels.shelf}
      className={`library-shelf-static${openingId ? " is-opening" : ""}`}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("dialog")) return;
        if (event.key === "Escape" && openingId) closeSelected();
      }}
      ref={rootRef}
      role="region"
    >
      <ul className="library-shelf-static-track" ref={trackRef}>
        {collections.map((collection) => (
          <li
            className={collection.id === openingId ? "is-opening" : ""}
            key={collection.id}
            ref={collection.id === selected.id ? selectedItemRef : null}
          >
            <button
              aria-pressed={collection.id === selected.id}
              disabled={Boolean(openingId)}
              onClick={() => onSelect(collection.id)}
              type="button"
            >
              <span className="library-shelf-static-book" aria-hidden="true">
                <span className="library-shelf-static-pages" />
                <img alt="" src={`${import.meta.env.BASE_URL}${collection.cover}`} />
              </span>
              <span className="library-shelf-static-title">{collection.title[locale]}</span>
            </button>
          </li>
        ))}
      </ul>
      {openingId ? (
        <>
          <CircleClose
            className="library-shelf-static-close is-on-dark"
            label={labels.close}
            onClick={closeSelected}
          />
          <div className="library-shelf-static-detail" aria-live="polite">
            <p>{selected.author}</p>
            <strong>{selected.title[locale]}</strong>
            <span>{selected.description[locale]}</span>
            <small>{labels.entering}</small>
            <button onClick={enterSelected} type="button">{labels.read}</button>
          </div>
        </>
      ) : (
        <CapsuleNavigator
          className="library-shelf-controls library-shelf-static-controls is-on-dark"
          label={labels.open}
          nextLabel={labels.next}
          onNext={() => selectOffset(1)}
          onPrevious={() => selectOffset(-1)}
          onPrimary={openSelected}
          previousLabel={labels.previous}
          primaryRef={openButtonRef}
        />
      )}
      {!openingId ? (
        <CoverPicker
          className="library-cover-trigger library-cover-trigger--static"
          currentCover={`${import.meta.env.BASE_URL}${selected.cover}`}
          currentId={selected.coverId}
          labels={{
            choose: labels.chooseCover,
            close: labels.closeCoverPicker,
            edition: labels.edition,
            hint: labels.chooseCoverHint,
          }}
          onChange={(coverId) => onCoverChange(selected.id, coverId)}
          options={selectedCoverOptions}
        />
      ) : null}
    </div>
  );
}

export default function LibraryShelf({
  collections,
  coverOptions,
  labels,
  locale,
  onCoverChange,
  onOpenReading,
  onSelect,
  selectedId,
}) {
  const mountRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(selectedId);
  const openingRef = useRef(null);
  const openTransitionRef = useRef(null);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  const [openingId, setOpeningId] = useState(null);
  const [rendererFailed, setRendererFailed] = useState(false);
  const selectedIndex = Math.max(0, collections.findIndex((collection) => collection.id === selectedId));
  const selected = collections[selectedIndex] ?? collections[0];
  const selectedCoverOptions = useMemo(() => ([
    {
      cover: `${import.meta.env.BASE_URL}${selected.originalCover}`,
      id: "original",
      label: labels.originalCover,
    },
    ...coverOptions,
  ]), [coverOptions, labels.originalCover, selected.originalCover]);
  const collectionStatus = useMemo(
    () => labels.position
      .replace("{current}", String(selectedIndex + 1))
      .replace("{total}", String(collections.length)),
    [collections.length, labels.position, selectedIndex],
  );

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    selectedRef.current = selectedId;
    if (openingRef.current && openingRef.current !== selectedId) {
      window.clearTimeout(openTransitionRef.current);
      openingRef.current = null;
      setOpeningId(null);
    }
  }, [selectedId]);

  useEffect(() => () => window.clearTimeout(openTransitionRef.current), []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(media.matches);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener?.(update);
    return () => media.removeListener?.(update);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const mount = mountRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: compact ? "low-power" : "high-performance",
      });
    } catch {
      setRendererFailed(true);
      return undefined;
    }

    renderer.setClearColor(0x1b1a18, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1b1a18, 10, 20);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, compact ? 0.05 : 0.15, compact ? 8.1 : 9.2);

    const hemisphere = new THREE.HemisphereLight(0xf0e7d7, 0x171513, 2.4);
    scene.add(hemisphere);
    const keyLight = new THREE.DirectionalLight(0xfff2db, 4.3);
    keyLight.position.set(-3.8, 6.2, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(compact ? 512 : 1024, compact ? 512 : 1024);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xb44932, 1.2);
    rimLight.position.set(6, 1, 4);
    scene.add(rimLight);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 15),
      new THREE.MeshStandardMaterial({ color: 0x1b1a18, roughness: 1 }),
    );
    wall.position.z = -2.8;
    scene.add(wall);

    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.28, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x33241e, roughness: 0.82 }),
    );
    shelf.position.set(0, -1.85, -0.2);
    shelf.receiveShadow = true;
    scene.add(shelf);

    const loader = new THREE.TextureLoader();
    const interactiveMeshes = [];
    const books = collections.map((collection, index) => {
      const book = createBook(collection, index, loader, interactiveMeshes);
      scene.add(book.root);
      return book;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const handlePointerDown = (event) => {
      pointerStart = { x: event.clientX, y: event.clientY };
    };
    const handlePointerCancel = () => {
      pointerStart = null;
    };
    const handlePointerUp = (event) => {
      if (openingRef.current) return;
      const deltaX = pointerStart ? event.clientX - pointerStart.x : 0;
      const deltaY = pointerStart ? event.clientY - pointerStart.y : 0;
      const movement = pointerStart ? Math.hypot(deltaX, deltaY) : Number.POSITIVE_INFINITY;
      pointerStart = null;
      if (event.button !== 0) return;
      if (compact && Math.abs(deltaX) > 28 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        const currentIndex = Math.max(
          0,
          collections.findIndex((collection) => collection.id === selectedRef.current),
        );
        const nextIndex = (currentIndex + (deltaX < 0 ? 1 : -1) + collections.length)
          % collections.length;
        onSelectRef.current(collections[nextIndex].id);
        return;
      }
      if (movement > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
      const collectionId = hit?.object.userData.collectionId;
      if (collectionId) onSelectRef.current(collectionId);
    };
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointercancel", handlePointerCancel);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let animationFrame = null;
    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const activeId = selectedRef.current;
      const activeBook = books.find((book) => book.root.userData.collectionId === activeId);
      const activeBaseX = activeBook?.root.userData.baseX ?? 0;

      books.forEach((book) => {
        const isSelected = book.root.userData.collectionId === activeId;
        const isOpening = book.root.userData.collectionId === openingRef.current;
        const anotherIsOpening = Boolean(openingRef.current) && !isOpening;
        const direction = Math.sign(book.root.userData.baseX - activeBaseX) || 1;
        const shelfX = book.root.userData.baseX - activeBaseX;
        const targetX = isOpening
          ? (compact ? -1.15 : -1.7)
          : anotherIsOpening
            ? shelfX + direction * (compact ? 6.5 : 8.5)
            : shelfX;
        const targetY = isOpening ? -0.15 : isSelected ? -0.42 : -0.55;
        const targetZ = isOpening ? 1.65 : isSelected ? 0.52 : 0;
        const targetScale = isOpening
          ? (compact ? 1.28 : 1.48)
          : isSelected ? 1.08 : 0.94;
        const targetCoverRotation = isOpening ? -1.82 : 0;

        const movementRate = reduceMotion ? 1000 : 7.2;
        const rotationRate = reduceMotion ? 1000 : 6.5;
        book.root.position.x = damp(book.root.position.x, targetX, movementRate, delta);
        book.root.position.y = damp(book.root.position.y, targetY, movementRate, delta);
        book.root.position.z = damp(book.root.position.z, targetZ, movementRate, delta);
        const nextScale = damp(book.root.scale.x, targetScale, movementRate, delta);
        book.root.scale.setScalar(nextScale);
        book.root.rotation.y = damp(book.root.rotation.y, isOpening ? 0.16 : 0, rotationRate, delta);
        book.frontPivot.rotation.y = damp(book.frontPivot.rotation.y, targetCoverRotation, rotationRate, delta);
      });

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose?.();
      });
      books.forEach((book) => book.coverTexture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [collections, compact]);

  function selectOffset(offset) {
    if (openingId) return;
    const nextIndex = (selectedIndex + offset + collections.length) % collections.length;
    onSelect(collections[nextIndex].id);
  }

  function openSelected() {
    openingRef.current = selected.id;
    setOpeningId(selected.id);
    window.clearTimeout(openTransitionRef.current);
    openTransitionRef.current = window.setTimeout(
      () => {
        if (openingRef.current === selected.id) onOpenReading(selected.id);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : OPEN_TRANSITION_MS,
    );
  }

  function closeSelected() {
    window.clearTimeout(openTransitionRef.current);
    openingRef.current = null;
    setOpeningId(null);
  }

  function enterSelected() {
    window.clearTimeout(openTransitionRef.current);
    onOpenReading(selected.id);
  }

  if (rendererFailed) {
    return (
      <StaticShelf
        collections={collections}
        coverOptions={coverOptions}
        labels={labels}
        locale={locale}
        onCoverChange={onCoverChange}
        onOpenReading={onOpenReading}
        onSelect={onSelect}
        selectedId={selected.id}
      />
    );
  }

  return (
    <section
      aria-label={labels.shelf}
      className={`library-shelf${openingId ? " is-opening" : ""}`}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLElement && event.target.closest("dialog")) return;
        if (event.key === "ArrowLeft") selectOffset(-1);
        if (event.key === "ArrowRight") selectOffset(1);
        if (event.key === "Escape") closeSelected();
      }}
      tabIndex={0}
    >
      <div className="library-shelf-canvas" ref={mountRef} />
      {openingId ? (
        <>
          <CircleClose className="library-shelf-close is-on-dark" label={labels.close} onClick={closeSelected} />
          <aside className="library-shelf-detail" aria-live="polite">
            <p>{selected.author}</p>
            <h2>{selected.title[locale]}</h2>
            <span>{selected.description[locale]}</span>
            <small>{labels.readings.replace("{count}", String(selected.count))}</small>
            <small className="library-shelf-entering">{labels.entering}</small>
            <button onClick={enterSelected} type="button">
              {labels.read}
            </button>
          </aside>
        </>
      ) : (
        <>
          <div className="library-shelf-meta">
            <p>{selected.author}</p>
            <h2>{selected.title[locale]}</h2>
          </div>
          <CapsuleNavigator
            className="library-shelf-controls is-on-dark"
            label={labels.open}
            nextLabel={labels.next}
            onNext={() => selectOffset(1)}
            onPrevious={() => selectOffset(-1)}
            onPrimary={openSelected}
            previousLabel={labels.previous}
          />
          <CoverPicker
            className="library-cover-trigger"
            currentCover={`${import.meta.env.BASE_URL}${selected.cover}`}
            currentId={selected.coverId}
            labels={{
              choose: labels.chooseCover,
              close: labels.closeCoverPicker,
              edition: labels.edition,
              hint: labels.chooseCoverHint,
            }}
            onChange={(coverId) => onCoverChange(selected.id, coverId)}
            options={selectedCoverOptions}
          />
        </>
      )}
      <div className="library-shelf-index" aria-label={labels.choose} role="tablist">
        {collections.map((collection, index) => (
          <button
            aria-label={`${labels.choose} ${index + 1}: ${collection.title[locale]}`}
            aria-selected={collection.id === selected.id}
            disabled={Boolean(openingId)}
            key={collection.id}
            onClick={() => onSelect(collection.id)}
            role="tab"
            type="button"
          />
        ))}
      </div>
      <p className="library-shelf-status" aria-live="polite">{collectionStatus}</p>
      <p className="library-shelf-instructions">
        {compact ? labels.touchInstructions : labels.instructions}
      </p>
    </section>
  );
}
