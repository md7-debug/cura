import { useEffect, useMemo, useRef, useState } from "react";
import { BookmarkSimple, CaretLeft, CaretRight, Minus, Plus } from "@phosphor-icons/react";
import * as THREE from "three";
import CoverPicker from "./CoverPicker.jsx";
import { CapsuleNavigator, CircleClose } from "./NavigationControls.jsx";
import {
  clampSpreadIndex,
  paginateMeasuredParagraphEntries,
  paginateParagraphs,
  pairedSpreadCount,
  plainReplyParagraphs,
  spreadIndexForParagraph,
} from "../lib/writingBook.js";

const PAGE_WIDTH = 4.4;
const PAGE_HEIGHT = 4.75;
const BOOK_DEPTH = 0.28;
const PAGE_SEGMENTS = 28;
const OPEN_EPSILON = 0.006;
const BOOK_ZOOM_LEVELS = [0.9, 1, 1.15, 1.3];

function smoothstep(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function damp(current, target, rate, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-rate * delta));
}

function closestZoomIndex(value) {
  return BOOK_ZOOM_LEVELS.reduce((closest, level, index) => (
    Math.abs(level - value) < Math.abs(BOOK_ZOOM_LEVELS[closest] - value) ? index : closest
  ), 0);
}

function BookZoomControl({ className = "", labels, onChange, value }) {
  const levelIndex = closestZoomIndex(value);
  const percentage = Math.round(BOOK_ZOOM_LEVELS[levelIndex] * 100);

  return (
    <div
      aria-label={labels.zoomPage}
      className={`book-zoom-control ${className}`.trim()}
      role="group"
    >
      <button
        aria-label={labels.zoomOut}
        disabled={levelIndex === 0}
        onClick={() => onChange(BOOK_ZOOM_LEVELS[levelIndex - 1])}
        type="button"
      >
        <Minus aria-hidden="true" size={14} weight="light" />
      </button>
      <button
        aria-label={labels.resetZoom}
        className="book-zoom-level"
        disabled={levelIndex === 1}
        onClick={() => onChange(1)}
        type="button"
      >
        <span aria-hidden="true">{percentage}%</span>
        <span className="sr-only">{labels.zoomLevel.replace("{percent}", String(percentage))}</span>
      </button>
      <button
        aria-label={labels.zoomIn}
        disabled={levelIndex === BOOK_ZOOM_LEVELS.length - 1}
        onClick={() => onChange(BOOK_ZOOM_LEVELS[levelIndex + 1])}
        type="button"
      >
        <Plus aria-hidden="true" size={14} weight="light" />
      </button>
    </div>
  );
}

function drawWrappedLines(context, text, x, y, maxWidth, lineHeight, maxY) {
  const words = String(text).split(/\s+/).filter(Boolean);
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      if (cursorY + lineHeight > maxY) return cursorY;
      context.fillText(line, x, cursorY);
      cursorY += lineHeight;
      line = word;
    } else {
      line = next;
    }
  }

  if (line && cursorY + lineHeight <= maxY) {
    context.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

function bookPageLayout(compact, pageDesign = {}) {
  const logicalWidth = compact ? 720 : 1024;
  const logicalHeight = compact ? 1000 : 1400;
  const margin = compact ? 50 : 94;
  const fontScale = THREE.MathUtils.clamp(pageDesign.fontScale ?? 1, 0.85, 1.8);
  const lineHeightScale = THREE.MathUtils.clamp((pageDesign.lineHeight ?? 1.62) / 1.62, 0.85, 1.3);
  const bodyFamily = {
    legible: 'Georgia, "Times New Roman", serif',
    literary: '"Cormorant Garamond", Georgia, serif',
    sans: '"Inter", Arial, sans-serif',
  }[pageDesign.typeface] ?? '"Cormorant Garamond", Georgia, serif';
  const bodyFontSize = Math.round((compact ? 48 : 42) * fontScale);

  return {
    bodyFamily,
    bodyFontSize,
    bodyFontWeight: compact || pageDesign.contrast === "strong" ? 500 : 400,
    bodyLineHeight: Math.round((compact ? 64 : 55) * fontScale * lineHeightScale),
    bodyMaxY: compact ? 880 : 1230,
    bodyY: compact ? 300 : 360,
    contentWidth: logicalWidth - margin * 2,
    footerRuleY: compact ? 962 : 1340,
    footerY: compact ? 946 : 1320,
    labelY: compact ? 66 : 112,
    logicalHeight,
    logicalWidth,
    margin,
    paragraphGap: compact ? 22 : 30,
    ruleY: compact ? 90 : 145,
    titleMaxY: compact ? 272 : 330,
    titleY: compact ? 150 : 235,
  };
}

function paginateBookParagraphEntries(paragraphs, compact, pageDesign) {
  const context = document.createElement("canvas").getContext("2d");
  const layout = bookPageLayout(compact, pageDesign);
  context.font = `${layout.bodyFontWeight} ${layout.bodyFontSize}px ${layout.bodyFamily}`;
  return paginateMeasuredParagraphEntries(paragraphs, {
    lineHeight: layout.bodyLineHeight,
    maxWidth: layout.contentWidth,
    measureText: (text) => context.measureText(text).width,
    pageHeight: layout.bodyMaxY - layout.bodyY,
    paragraphGap: layout.paragraphGap,
  });
}

function makePageCanvas({ compact, label, page, pageDesign, pageIndex, pageTotal, title }) {
  const canvas = document.createElement("canvas");
  const layout = bookPageLayout(compact, pageDesign);
  const { logicalHeight, logicalWidth } = layout;
  // The compact page is presented close to full-screen, so a 1x texture is
  // visibly soft even when the WebGL canvas itself is sharp. Keep the page
  // artwork at print-like density independently of the device pixel ratio.
  const textureScale = compact
    ? 2
    : Math.max(1.5, Math.min(window.devicePixelRatio || 1, 2));
  canvas.width = Math.round(logicalWidth * textureScale);
  canvas.height = Math.round(logicalHeight * textureScale);
  const context = canvas.getContext("2d");
  context.scale(textureScale, textureScale);
  context.fontKerning = "normal";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.textRendering = "optimizeLegibility";
  const {
    bodyFamily,
    bodyFontSize,
    bodyFontWeight,
    bodyLineHeight,
    bodyMaxY,
    bodyY,
    contentWidth,
    footerRuleY,
    footerY,
    labelY,
    margin,
    paragraphGap,
    ruleY,
    titleMaxY,
    titleY,
  } = layout;
  const display = pageDesign?.display ?? "warm";
  const isNight = display === "night";
  const strongInk = pageDesign?.contrast === "strong" || compact;
  const paper = isNight ? "#24221f" : display === "clear" ? "#fffdfa" : display === "eink" ? "#ffffff" : "#f4efe5";
  const ink = isNight ? "#f5efe4" : display === "eink" ? "#000000" : strongInk ? "#100f0d" : "#24211e";
  const quiet = isNight ? "#cfc7bb" : display === "eink" ? "#222222" : strongInk ? "#514a42" : "#716b62";
  const rule = isNight ? "rgba(238, 232, 220, 0.24)" : "rgba(36, 34, 31, 0.25)";
  const accent = isNight ? "#cf7059" : display === "eink" ? "#000000" : "#b44932";
  context.fillStyle = paper;
  context.fillRect(0, 0, logicalWidth, logicalHeight);

  context.save();
  context.globalAlpha = isNight ? 0.028 : 0.055;
  context.fillStyle = isNight ? "#d2c8b8" : "#7b6c5d";
  for (let index = 0; index < 520; index += 1) {
    const x = (index * 197) % logicalWidth;
    const y = (index * 313) % logicalHeight;
    context.fillRect(x, y, index % 5 === 0 ? 2 : 1, 1);
  }
  context.restore();

  context.fillStyle = quiet;
  context.font = `${compact ? 600 : 500} ${compact ? 16 : 22}px "Inter", sans-serif`;
  context.letterSpacing = compact ? "3px" : "4px";
  context.fillText(label.toUpperCase(), margin, labelY);
  context.strokeStyle = rule;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(margin, ruleY);
  context.lineTo(logicalWidth - margin, ruleY);
  context.stroke();

  context.fillStyle = ink;
  context.letterSpacing = "0px";
  context.font = `500 ${compact ? 54 : 62}px "Cormorant Garamond", Georgia, serif`;
  drawWrappedLines(
    context,
    String(title ?? "").trim() || label,
    margin,
    titleY,
    contentWidth,
    compact ? 58 : 68,
    titleMaxY,
  );

  context.font = `${bodyFontWeight} ${bodyFontSize}px ${bodyFamily}`;
  let cursorY = bodyY;
  const paragraphs = page?.length ? page : ["—"];
  paragraphs.forEach((paragraph, index) => {
    if (cursorY >= bodyMaxY) return;
    cursorY = drawWrappedLines(
      context,
      paragraph,
      margin,
      cursorY,
      contentWidth,
      bodyLineHeight,
      bodyMaxY,
    );
    if (index < paragraphs.length - 1) cursorY += paragraphGap;
  });

  context.fillStyle = quiet;
  context.font = `500 ${compact ? 16 : 20}px "Inter", sans-serif`;
  context.letterSpacing = compact ? "2px" : "3px";
  context.fillText(
    `${String(pageIndex + 1).padStart(2, "0")} / ${String(pageTotal).padStart(2, "0")}`,
    margin,
    footerY,
  );
  context.fillStyle = accent;
  context.fillRect(margin, footerRuleY, compact ? 40 : 54, 2);
  return canvas;
}

function makeCanvasTexture(canvas, renderer) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function curveSettledPage(geometry) {
  const position = geometry.attributes.position;
  const pageWidth = PAGE_WIDTH - 0.12;
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const u = THREE.MathUtils.clamp((x + pageWidth * 0.5) / pageWidth, 0, 1);
    const gutterLift = Math.exp(-u * 8) * 0.08;
    const edgeLift = Math.pow(u, 5) * 0.025;
    const foreEdge = Math.pow(Math.abs(y) / (PAGE_HEIGHT * 0.5), 5) * 0.012;
    position.setZ(vertex, gutterLift + edgeLift + foreEdge);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function coverPalette(index) {
  return [0x192842, 0x9a432d, 0x68704a, 0x806e57, 0x4e6071][index % 5];
}

function createShelfVolume(letter, index, loader, interactiveMeshes) {
  const height = 2.35 + (index % 3) * 0.16;
  const width = 1.32;
  const depth = 0.32;
  const group = new THREE.Group();
  const cloth = new THREE.MeshPhysicalMaterial({
    color: letter.coverColor ?? coverPalette(index),
    roughness: 0.96,
    sheen: 0.18,
    sheenRoughness: 0.88,
  });
  const texture = loader.load(letter.cover);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const art = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.88,
    sheen: 0.12,
    sheenRoughness: 0.9,
  });
  const page = new THREE.MeshStandardMaterial({ color: 0xd9cdbb, roughness: 0.95 });
  const pages = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, height - 0.1, depth - 0.05), page);
  pages.position.z = -0.015;
  pages.castShadow = true;
  group.add(pages);
  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.055),
    [cloth, cloth, cloth, cloth, art, cloth],
  );
  cover.position.z = depth * 0.5;
  cover.userData.letterNumber = letter.number;
  cover.castShadow = true;
  group.add(cover);
  interactiveMeshes.push(cover);
  group.userData.letterNumber = letter.number;
  group.userData.height = height;
  group.userData.texture = texture;
  return group;
}

function createOpenBook(renderer, paperBump, pageDesign) {
  const root = new THREE.Group();
  root.visible = false;
  const isNight = pageDesign?.display === "night";
  const edgeColor = isNight ? 0x34312d : 0xd9cdbb;

  const cloth = new THREE.MeshPhysicalMaterial({
    color: 0x253553,
    roughness: 0.93,
    sheen: 0.24,
    sheenRoughness: 0.82,
  });
  const paperEdge = new THREE.MeshPhysicalMaterial({
    color: edgeColor,
    bumpMap: paperBump,
    bumpScale: 0.012,
    roughness: 0.98,
  });
  const paperBase = new THREE.MeshPhysicalMaterial({
    // Keep mapped pages neutral: the canvas texture already carries the
    // reader's paper and ink palette. Tinting here would multiply dark mode
    // twice and collapse its contrast.
    color: 0xffffff,
    bumpMap: paperBump,
    bumpScale: 0.005,
    roughness: 0.9,
  });

  const backCover = new THREE.Mesh(
    new THREE.BoxGeometry(PAGE_WIDTH + 0.16, PAGE_HEIGHT + 0.16, 0.08),
    cloth,
  );
  backCover.position.set(PAGE_WIDTH * 0.5, 0, -BOOK_DEPTH * 0.5);
  backCover.castShadow = true;
  root.add(backCover);

  const pageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(PAGE_WIDTH - 0.08, PAGE_HEIGHT - 0.08, BOOK_DEPTH - 0.08),
    paperEdge,
  );
  pageBlock.position.set(PAGE_WIDTH * 0.5, 0, 0);
  pageBlock.castShadow = true;
  root.add(pageBlock);

  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, 0, BOOK_DEPTH * 0.5 + 0.04);
  const frontCover = new THREE.Mesh(
    new THREE.BoxGeometry(PAGE_WIDTH + 0.16, PAGE_HEIGHT + 0.16, 0.08),
    [cloth, cloth, cloth, cloth, cloth, cloth],
  );
  frontCover.position.x = PAGE_WIDTH * 0.5;
  frontCover.castShadow = true;
  frontPivot.add(frontCover);
  root.add(frontPivot);

  const leftMaterial = paperBase.clone();
  leftMaterial.side = THREE.DoubleSide;
  const rightMaterial = paperBase.clone();
  rightMaterial.side = THREE.DoubleSide;
  const leftPageGeometry = curveSettledPage(
    new THREE.PlaneGeometry(PAGE_WIDTH - 0.12, PAGE_HEIGHT - 0.12, 18, 3),
  );
  const rightPageGeometry = leftPageGeometry.clone();
  const leftPage = new THREE.Mesh(leftPageGeometry, leftMaterial);
  leftPage.position.set(PAGE_WIDTH * 0.5, 0, -0.047);
  leftPage.rotation.y = Math.PI;
  leftPage.receiveShadow = true;
  frontPivot.add(leftPage);

  const rightPage = new THREE.Mesh(rightPageGeometry, rightMaterial);
  rightPage.position.set(PAGE_WIDTH * 0.5, 0, BOOK_DEPTH * 0.5 + 0.052);
  rightPage.receiveShadow = true;
  root.add(rightPage);

  const flipGeometry = new THREE.PlaneGeometry(
    PAGE_WIDTH - 0.12,
    PAGE_HEIGHT - 0.12,
    PAGE_SEGMENTS,
    2,
  );
  flipGeometry.translate((PAGE_WIDTH - 0.12) * 0.5, 0, 0);
  const flipFrontMaterial = paperBase.clone();
  flipFrontMaterial.side = THREE.FrontSide;
  const flipBackMaterial = paperBase.clone();
  flipBackMaterial.side = THREE.BackSide;
  const flipPivot = new THREE.Group();
  flipPivot.position.set(0, 0, BOOK_DEPTH * 0.5 + 0.065);
  const flipFront = new THREE.Mesh(flipGeometry, flipFrontMaterial);
  const flipBack = new THREE.Mesh(flipGeometry, flipBackMaterial);
  flipFront.castShadow = true;
  flipBack.castShadow = true;
  flipFront.receiveShadow = true;
  flipBack.receiveShadow = true;
  flipPivot.add(flipFront, flipBack);
  flipPivot.visible = false;
  root.add(flipPivot);

  return {
    backCover,
    cloth,
    coverMaterial: null,
    frontCover,
    frontPivot,
    flipBackMaterial,
    flipFrontMaterial,
    flipGeometry,
    flipPivot,
    leftMaterial,
    rightMaterial,
    root,
    textures: [],
  };
}

function replaceMaterialMap(material, texture) {
  if (material.map && material.map !== texture) material.map.dispose();
  material.map = texture;
  material.needsUpdate = true;
}

function deformPage(openBook, progress, direction) {
  const eased = smoothstep(progress);
  const rotationProgress = direction > 0 ? eased : 1 - eased;
  openBook.flipPivot.rotation.y = -Math.PI * rotationProgress;
  const position = openBook.flipGeometry.attributes.position;
  const envelope = Math.sin(Math.PI * eased);
  const visibleWidth = PAGE_WIDTH - 0.12;
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const u = THREE.MathUtils.clamp(x / visibleWidth, 0, 1);
    const curve = Math.sin(Math.PI * u) * envelope * 0.54;
    const diagonal = (y / PAGE_HEIGHT) * Math.sin(Math.PI * u) * envelope * 0.14;
    const foreEdgeCurl = Math.pow(u, 3) * envelope * 0.1;
    position.setZ(vertex, (curve + diagonal + foreEdgeCurl) * (direction > 0 ? 1 : -1));
  }
  position.needsUpdate = true;
  openBook.flipGeometry.computeVertexNormals();
}

function WritingBookScene({
  activeNumber,
  compactBreakpoint = 720,
  currentSpread,
  labels,
  letters,
  mode,
  onCloseSettled,
  onOpenSettled,
  onSelect,
  onTurnComplete,
  pageDesign,
  pagePayload,
  sceneApiRef,
  spreadCount,
  compactSinglePage = false,
}) {
  const mountRef = useRef(null);
  const fallbackSettledRef = useRef(null);
  const valuesRef = useRef({
    activeNumber,
    currentSpread,
    mode,
    onCloseSettled,
    onOpenSettled,
    onSelect,
    onTurnComplete,
    pageDesign,
    pagePayload,
    spreadCount,
  });
  const [rendererFailed, setRendererFailed] = useState(false);

  useEffect(() => {
    valuesRef.current = {
      activeNumber,
      currentSpread,
      mode,
      onCloseSettled,
      onOpenSettled,
      onSelect,
      onTurnComplete,
      pageDesign,
      pagePayload,
      spreadCount,
    };
    sceneApiRef.current?.sync?.();
  }, [activeNumber, currentSpread, mode, onCloseSettled, onOpenSettled, onSelect, onTurnComplete, pageDesign, pagePayload, sceneApiRef, spreadCount]);

  useEffect(() => {
    if (!mountRef.current) return undefined;
    const mount = mountRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setRendererFailed(true);
      return undefined;
    }

    renderer.setClearColor(0x171614, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.touchAction = "pan-y";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x171614, 11, 22);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0.9, 11.6);
    camera.lookAt(0, -0.2, 0);

    // Preserve the ink values baked into the page texture. The earlier high
    // light levels clipped the warm paper and lifted dark type into grey,
    // especially on a phone. Directional light still gives the paper turn
    // and cover enough depth to read as a physical object.
    scene.add(new THREE.HemisphereLight(0xfffbf3, 0x0d0d0c, 1.15));
    scene.add(new THREE.AmbientLight(0xffffff, 0.48));
    const key = new THREE.DirectionalLight(0xfff8eb, 1.7);
    key.position.set(-4.5, 7, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8090aa, 0.28);
    fill.position.set(5, 2, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xb44932, 0.34);
    rim.position.set(3, -1, 4);
    scene.add(rim);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 18),
      new THREE.MeshStandardMaterial({ color: 0x171614, roughness: 1 }),
    );
    wall.position.z = -3;
    scene.add(wall);
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.25, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x39251d, roughness: 0.82 }),
    );
    shelf.position.set(0, 0.1, -1.45);
    shelf.receiveShadow = true;
    scene.add(shelf);
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.35, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x30231d, roughness: 0.86 }),
    );
    table.position.set(0, -3.05, 0.1);
    table.receiveShadow = true;
    scene.add(table);

    const loader = new THREE.TextureLoader();
    const paperBump = loader.load(`${import.meta.env.BASE_URL}assets/paper-texture.png`);
    paperBump.wrapS = THREE.RepeatWrapping;
    paperBump.wrapT = THREE.RepeatWrapping;
    paperBump.repeat.set(4, 5);
    const interactiveMeshes = [];
    const shelfVolumes = letters.map((letter, index) => {
      const volume = createShelfVolume(letter, index, loader, interactiveMeshes);
      scene.add(volume);
      return volume;
    });
    const openBook = createOpenBook(renderer, paperBump, pageDesign);
    scene.add(openBook.root);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let openingProgress = 0;
    let openingAnnounced = false;
    let closingAnnounced = false;
    let selectedCoverTexture = null;
    let pageTextures = [];
    let turn = null;
    let pointerGesture = null;

    function activeIndex() {
      const index = letters.findIndex((letter) => letter.number === valuesRef.current.activeNumber);
      return Math.max(0, index);
    }

    function layoutShelfVolumes(delta, immediate = false) {
      const selectedIndex = activeIndex();
      const spacing = letters.length > 5 ? 1.2 : 1.55;
      shelfVolumes.forEach((volume, index) => {
        const relative = index - selectedIndex;
        const targetX = relative * spacing;
        const selected = index === selectedIndex;
        const targetY = 0.24 + volume.userData.height * 0.5;
        const targetZ = selected ? -0.35 : -1.15;
        const scale = selected ? 1.08 : 0.94;
        const rate = immediate || reducedMotion ? 1000 : 7.5;
        volume.position.x = damp(volume.position.x, targetX, rate, delta);
        volume.position.y = damp(volume.position.y, targetY, rate, delta);
        volume.position.z = damp(volume.position.z, targetZ, rate, delta);
        const nextScale = damp(volume.scale.x || 1, scale, rate, delta);
        volume.scale.setScalar(nextScale);
        const fade = valuesRef.current.mode === "shelf" ? 1 : 1 - openingProgress * 0.9;
        volume.traverse((object) => {
          if (!object.material) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            material.transparent = true;
            material.opacity = fade * (selected ? 1 : 0.72);
          });
        });
      });
    }

    function setSelectedCover() {
      const selected = letters[activeIndex()];
      if (!selected) return;
      if (selectedCoverTexture) selectedCoverTexture.dispose();
      selectedCoverTexture = loader.load(selected.cover);
      selectedCoverTexture.colorSpace = THREE.SRGBColorSpace;
      openBook.cloth.color.setHex(selected.coverColor ?? coverPalette(activeIndex()));
      const coverMaterial = new THREE.MeshPhysicalMaterial({
        map: selectedCoverTexture,
        roughness: 0.86,
        sheen: 0.12,
        sheenRoughness: 0.9,
      });
      openBook.coverMaterial?.dispose();
      openBook.coverMaterial = coverMaterial;
      openBook.frontCover.material = [
        openBook.cloth,
        openBook.cloth,
        openBook.cloth,
        openBook.cloth,
        coverMaterial,
        openBook.cloth,
      ];
    }

    function disposePageTextures() {
      pageTextures.forEach((texture) => texture.dispose());
      pageTextures = [];
    }

    function pageTexture(kind, index, mirrorHorizontally = false) {
      const payload = valuesRef.current.pagePayload;
      const pageTotal = payload.pageTotal ?? valuesRef.current.spreadCount;
      const pages = kind === "source" ? payload.sourcePages : payload.replyPages;
      const page = pages[Math.min(index, pages.length - 1)];
      const pageNumbers = kind === "source" ? payload.sourcePageNumbers : payload.replyPageNumbers;
      const pageLabels = kind === "source" ? payload.sourceLabels : payload.replyLabels;
      const pageTitles = kind === "source" ? payload.sourceTitles : payload.replyTitles;
      const canvas = makePageCanvas({
        compact: mount.clientWidth <= compactBreakpoint,
        label: pageLabels?.[index] ?? (kind === "source" ? labels.sourceText : labels.yourLetter),
        page,
        pageDesign: valuesRef.current.pageDesign,
        pageIndex: pageNumbers?.[index] ?? index,
        pageTotal,
        title: pageTitles?.[index] ?? (kind === "source" ? payload.sourceTitle : payload.replyTitle),
      });
      const texture = makeCanvasTexture(canvas, renderer);
      if (mirrorHorizontally) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.offset.x = 1;
        texture.needsUpdate = true;
      }
      pageTextures.push(texture);
      return texture;
    }

    function setStaticSpread(index) {
      disposePageTextures();
      replaceMaterialMap(openBook.leftMaterial, pageTexture("source", index));
      replaceMaterialMap(openBook.rightMaterial, pageTexture("reply", index));
      openBook.flipPivot.visible = false;
      turn = null;
    }

    function prepareTurn(direction, progress = 0) {
      if (turn) return true;
      const current = valuesRef.current.currentSpread;
      const target = clampSpreadIndex(current + direction, valuesRef.current.spreadCount);
      if (target === current) return false;
      const currentSource = pageTexture("source", current);
      const currentReply = pageTexture("reply", current);
      const targetSource = pageTexture("source", target);
      const targetReply = pageTexture("reply", target);
      const backPage = direction > 0
        ? pageTexture("source", target, true)
        : pageTexture("source", current, true);

      if (direction > 0) {
        replaceMaterialMap(openBook.leftMaterial, currentSource);
        replaceMaterialMap(openBook.rightMaterial, targetReply);
        replaceMaterialMap(openBook.flipFrontMaterial, currentReply);
        replaceMaterialMap(openBook.flipBackMaterial, backPage);
      } else {
        replaceMaterialMap(openBook.leftMaterial, targetSource);
        replaceMaterialMap(openBook.rightMaterial, currentReply);
        replaceMaterialMap(openBook.flipFrontMaterial, targetReply);
        replaceMaterialMap(openBook.flipBackMaterial, backPage);
      }
      openBook.flipPivot.visible = true;
      turn = { committed: false, direction, progress, target, targetProgress: progress };
      deformPage(openBook, progress, direction);
      return true;
    }

    function startTurn(direction) {
      if (valuesRef.current.mode !== "reading") return;
      if (!prepareTurn(direction, 0)) return;
      turn.committed = true;
      turn.targetProgress = 1;
    }

    function sync() {
      setSelectedCover();
      if (!turn && valuesRef.current.pagePayload) setStaticSpread(valuesRef.current.currentSpread);
    }

    sceneApiRef.current = { startTurn, sync };
    setSelectedCover();

    function updateOpenBook(delta) {
      const target = valuesRef.current.mode === "shelf" || valuesRef.current.mode === "closing" ? 0 : 1;
      const rate = reducedMotion ? 1000 : target ? 2.8 : 3.8;
      openingProgress = damp(openingProgress, target, rate, delta);
      const selectedIndex = activeIndex();
      const selectedVolume = shelfVolumes[selectedIndex];
      const shelfPosition = selectedVolume?.position ?? new THREE.Vector3();
      const lift = smoothstep(openingProgress);
      openBook.root.visible = openingProgress > 0.002 || target === 1;
      openBook.root.position.set(
        THREE.MathUtils.lerp(shelfPosition.x, 0, lift),
        THREE.MathUtils.lerp(shelfPosition.y, mount.clientWidth <= compactBreakpoint ? -0.42 : 0.08, lift),
        THREE.MathUtils.lerp(shelfPosition.z, 1.05, lift),
      );
      const compact = mount.clientWidth <= compactBreakpoint;
      const singlePage = compact && compactSinglePage;
      // The front cover and its inside leaf explain the opening/closing motion,
      // but a settled compact reader owns one centered page. Keeping that leaf
      // mounted after the handoff exposes a clipped second page on tablets and
      // at browser zoom levels between the phone and desktop layouts.
      openBook.frontPivot.visible = !(singlePage && valuesRef.current.mode === "reading");
      const settledScale = singlePage ? 0.88 : compact ? 0.57 : 1.08;
      const scale = THREE.MathUtils.lerp(compact ? 0.2 : 0.3, settledScale, lift);
      const settledX = singlePage ? -(PAGE_WIDTH * settledScale * 0.5) : 0;
      openBook.root.scale.setScalar(scale);
      openBook.root.position.x = THREE.MathUtils.lerp(shelfPosition.x, settledX, lift);
      openBook.root.rotation.x = THREE.MathUtils.lerp(0, compact ? -0.045 : -0.09, lift);
      const coverProgress = smoothstep(THREE.MathUtils.clamp((openingProgress - 0.32) / 0.68, 0, 1));
      openBook.frontPivot.rotation.y = -Math.PI * coverProgress + 0.035 * coverProgress;

      if (target === 1 && openingProgress > 1 - OPEN_EPSILON && !openingAnnounced) {
        openingAnnounced = true;
        closingAnnounced = false;
        valuesRef.current.onOpenSettled();
      }
      if (target === 0 && openingProgress < OPEN_EPSILON && !closingAnnounced) {
        closingAnnounced = true;
        openingAnnounced = false;
        openBook.root.visible = false;
        valuesRef.current.onCloseSettled();
      }
    }

    function updateTurn(delta) {
      if (!turn) return;
      const rate = reducedMotion ? 1000 : turn.committed ? 5.2 : 8;
      turn.progress = damp(turn.progress, turn.targetProgress, rate, delta);
      deformPage(openBook, turn.progress, turn.direction);
      if (turn.targetProgress === 0 && turn.progress < OPEN_EPSILON) {
        setStaticSpread(valuesRef.current.currentSpread);
        return;
      }
      if (turn.targetProgress === 1 && turn.progress > 1 - OPEN_EPSILON) {
        const completedTarget = turn.target;
        turn = null;
        openBook.flipPivot.visible = false;
        valuesRef.current.onTurnComplete(completedTarget);
      }
    }

    function resize() {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const compact = width <= compactBreakpoint;
      camera.fov = compactSinglePage && compact ? 42 : compact ? 46 : 35;
      camera.position.set(0, compact ? 0.3 : 0.9, compactSinglePage && compact ? 11.4 : compact ? 13.2 : 11.6);
      camera.updateProjectionMatrix();
      camera.lookAt(0, compact ? -0.6 : -0.2, 0);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    function setPointer(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handlePointerDown(event) {
      if (event.button !== 0 || event.isPrimary === false) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const reading = valuesRef.current.mode === "reading";
      pointerGesture = {
        direction: reading && event.clientX < rect.left + rect.width * 0.5 ? -1 : 1,
        dragging: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!pointerGesture || pointerGesture.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - pointerGesture.startX;
      const deltaY = event.clientY - pointerGesture.startY;
      if (!pointerGesture.dragging) {
        if (Math.abs(deltaX) < 5 || Math.abs(deltaX) < Math.abs(deltaY) * 0.9) return;
        const validDirection = pointerGesture.direction > 0 ? deltaX < 0 : deltaX > 0;
        if (!validDirection || !prepareTurn(pointerGesture.direction, 0)) return;
        pointerGesture.dragging = true;
      }
      event.preventDefault();
      const signedDistance = pointerGesture.direction > 0 ? -deltaX : deltaX;
      turn.progress = THREE.MathUtils.clamp(signedDistance / 180, 0, 1);
      turn.targetProgress = turn.progress;
      deformPage(openBook, turn.progress, turn.direction);
    }

    function handlePointerEnd(event) {
      if (!pointerGesture || pointerGesture.pointerId !== event.pointerId) return;
      const gesture = pointerGesture;
      pointerGesture = null;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
      if (gesture.dragging && turn) {
        turn.committed = turn.progress >= 0.28;
        turn.targetProgress = turn.committed ? 1 : 0;
        return;
      }
      if (valuesRef.current.mode === "reading") {
        startTurn(gesture.direction);
        return;
      }
      if (valuesRef.current.mode !== "shelf") return;
      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
      if (hit?.object.userData.letterNumber) valuesRef.current.onSelect(hit.object.userData.letterNumber);
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove, { passive: false });
    renderer.domElement.addEventListener("pointerup", handlePointerEnd);
    renderer.domElement.addEventListener("pointercancel", handlePointerEnd);

    const clock = new THREE.Clock();
    let animationFrame = 0;
    function animate() {
      const delta = Math.min(clock.getDelta(), 0.05);
      layoutShelfVolumes(delta);
      updateOpenBook(delta);
      updateTurn(delta);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    }
    layoutShelfVolumes(1, true);
    sync();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerEnd);
      renderer.domElement.removeEventListener("pointercancel", handlePointerEnd);
      sceneApiRef.current = null;
      disposePageTextures();
      selectedCoverTexture?.dispose();
      paperBump.dispose();
      shelfVolumes.forEach((volume) => volume.userData.texture?.dispose());
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [compactBreakpoint, compactSinglePage, labels.sourceText, labels.yourLetter, letters, pageDesign?.display, sceneApiRef]);

  useEffect(() => {
    if (!rendererFailed) {
      fallbackSettledRef.current = null;
      return;
    }
    const fallbackState = `${activeNumber}:${mode}`;
    if (fallbackSettledRef.current === fallbackState) return;
    fallbackSettledRef.current = fallbackState;
    if (mode === "opening") onOpenSettled();
    if (mode === "closing") onCloseSettled();
  }, [activeNumber, mode, onCloseSettled, onOpenSettled, rendererFailed]);

  if (rendererFailed) {
    const fallbackSource = pagePayload?.sourcePages?.[currentSpread] ?? [];
    const fallbackReply = pagePayload?.replyPages?.[currentSpread] ?? [];
    const compactFallback = compactSinglePage
      && window.matchMedia(`(max-width: ${compactBreakpoint}px)`).matches;
    if (compactFallback) {
      return (
        <div className="writing-book-fallback is-single" aria-label={labels.sceneFallback}>
          <section>
            <span>{pagePayload?.replyLabels?.[currentSpread] ?? labels.yourLetter}</span>
            <h3>{pagePayload?.replyTitles?.[currentSpread] ?? pagePayload?.replyTitle ?? letters[0]?.title}</h3>
            {fallbackReply.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
        </div>
      );
    }
    return (
      <div className="writing-book-fallback" aria-label={labels.sceneFallback}>
        <section>
          <span>{labels.sourceText}</span>
          <h3>{pagePayload?.sourceTitle ?? letters[0]?.title}</h3>
          {fallbackSource.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
        <section>
          <span>{labels.yourLetter}</span>
          <h3>{pagePayload?.replyTitle ?? letters[0]?.title}</h3>
          {fallbackReply.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
      </div>
    );
  }

  return <div className="writing-book-canvas" ref={mountRef} />;
}

export function FocusBookReader({
  active,
  bookmarks,
  content,
  cover,
  initialParagraph,
  labels,
  letterLabel,
  letterNumber,
  locale,
  onBookmarkToggle,
  onClosed,
  onNextReading,
  onPreviousReading,
  onReadingPositionChange,
  onReturnToInterpretation,
  onWrite,
  readerPreferences,
}) {
  const sceneApiRef = useRef(null);
  const positionParagraphRef = useRef(initialParagraph);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 920px)").matches);
  const [mode, setMode] = useState("opening");
  const [pageZoom, setPageZoom] = useState(1);

  const textLayout = useMemo(() => ({
    contrast: readerPreferences.contrast,
    fontScale: (readerPreferences.fontSize / 100) * pageZoom,
    lineHeight: readerPreferences.lineHeight,
    typeface: readerPreferences.typeface,
  }), [pageZoom, readerPreferences.contrast, readerPreferences.fontSize, readerPreferences.lineHeight, readerPreferences.typeface]);
  const pageDesign = useMemo(() => ({
    ...textLayout,
    display: readerPreferences.display,
  }), [readerPreferences.display, textLayout]);
  const indexedPages = useMemo(
    () => paginateBookParagraphEntries(content.text, compact, textLayout),
    [compact, content.text, textLayout],
  );
  const pagesPerSpread = compact ? 1 : 2;
  const spreadCount = Math.max(1, Math.ceil(indexedPages.length / pagesPerSpread));
  const initialSpread = spreadIndexForParagraph(indexedPages, initialParagraph, pagesPerSpread);
  const [spreadIndex, setSpreadIndex] = useState(() => clampSpreadIndex(initialSpread, spreadCount));
  const selectedVolume = useMemo(() => [{
    cover,
    number: letterNumber,
    title: content.title,
  }], [content.title, cover, letterNumber]);
  const pagePayload = useMemo(() => {
    const sourcePages = [];
    const replyPages = [];
    const sourcePageNumbers = [];
    const replyPageNumbers = [];
    for (let spread = 0; spread < spreadCount; spread += 1) {
      const leftIndex = spread * pagesPerSpread;
      const rightIndex = compact ? leftIndex : leftIndex + 1;
      sourcePages.push(indexedPages[leftIndex]?.map((entry) => entry.text) ?? []);
      replyPages.push(indexedPages[rightIndex]?.map((entry) => entry.text) ?? [labels.endMark]);
      sourcePageNumbers.push(leftIndex);
      replyPageNumbers.push(rightIndex);
    }
    return {
      pageTotal: compact ? spreadCount : spreadCount * 2,
      replyPageNumbers,
      replyPages,
      replyTitle: compact ? content.title : letterLabel,
      sourcePageNumbers,
      sourcePages,
      sourceTitle: content.title,
    };
  }, [compact, content.title, indexedPages, labels.endMark, letterLabel, pagesPerSpread, spreadCount]);

  const currentEntries = [
    ...(indexedPages[spreadIndex * pagesPerSpread] ?? []),
    ...(compact ? [] : indexedPages[spreadIndex * pagesPerSpread + 1] ?? []),
  ];
  const currentParagraph = currentEntries[0]?.paragraphIndex ?? 0;
  const isBookmarked = bookmarks.some((bookmark) => (
    bookmark.locale === locale && bookmark.paragraphIndex === currentParagraph
  ));
  const isLastSpread = spreadIndex === spreadCount - 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 920px)");
    const update = () => setCompact(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    setSpreadIndex(clampSpreadIndex(
      spreadIndexForParagraph(indexedPages, positionParagraphRef.current, pagesPerSpread),
      spreadCount,
    ));
  }, [indexedPages, pagesPerSpread, spreadCount]);

  useEffect(() => {
    if (active && (mode === "closing" || mode === "shelf")) {
      setMode("opening");
      return;
    }
    if (!active && mode !== "closing" && mode !== "shelf") setMode("closing");
  }, [active, mode]);

  useEffect(() => {
    if (mode !== "reading") return undefined;
    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLElement
        && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (document.querySelector(".annotation-notebook, .reader-preferences")) return;
      if (event.key === "ArrowRight" && spreadIndex < spreadCount - 1) {
        event.preventDefault();
        sceneApiRef.current?.startTurn?.(1);
      }
      if (event.key === "ArrowLeft" && spreadIndex > 0) {
        event.preventDefault();
        sceneApiRef.current?.startTurn?.(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, spreadCount, spreadIndex]);

  function completeTurn(nextSpread) {
    setSpreadIndex(nextSpread);
    const paragraph = indexedPages[nextSpread * pagesPerSpread]?.[0]?.paragraphIndex
      ?? indexedPages[nextSpread * pagesPerSpread + 1]?.[0]?.paragraphIndex
      ?? currentParagraph;
    positionParagraphRef.current = paragraph;
    onReadingPositionChange(paragraph);
  }

  return (
    <section
      aria-label={labels.bookExperience}
      className={`focus-book-experience is-${mode}`}
    >
      <WritingBookScene
        activeNumber={letterNumber}
        compactBreakpoint={920}
        currentSpread={spreadIndex}
        labels={{ sourceText: letterLabel, yourLetter: letterLabel }}
        letters={selectedVolume}
        mode={mode}
        onCloseSettled={() => {
          if (mode !== "closing") return;
          setMode("shelf");
          onClosed(positionParagraphRef.current);
        }}
        onOpenSettled={() => {
          if (mode === "opening") setMode("reading");
        }}
        onSelect={() => {}}
        onTurnComplete={completeTurn}
        pageDesign={pageDesign}
        pagePayload={pagePayload}
        sceneApiRef={sceneApiRef}
        spreadCount={spreadCount}
        compactSinglePage
      />

      {/* The canvas page owns the visible identity after opening. Keep the DOM
          title semantic-only so it cannot stack over the printed page title. */}
      <h2 className="sr-only" id="focused-letter-title">
        {letterLabel}: {content.title}
      </h2>

      <div className="focus-book-footer">
        <button
          aria-label={(isBookmarked ? labels.removeBookmark : labels.addBookmark)
            .replace("{number}", String(currentParagraph + 1))}
          aria-pressed={isBookmarked}
          className="focus-book-bookmark"
          onClick={() => onBookmarkToggle(currentParagraph)}
          type="button"
        >
          <BookmarkSimple aria-hidden="true" size={17} weight={isBookmarked ? "fill" : "light"} />
          <span>{isBookmarked ? labels.bookmarked : labels.bookmarkPage}</span>
        </button>
        <div className="writing-book-turner focus-book-turner">
          <button
            aria-label={labels.previousSpread}
            className="capsule-chevron"
            disabled={spreadIndex === 0 || mode !== "reading"}
            onClick={() => sceneApiRef.current?.startTurn?.(-1)}
            type="button"
          >
            <CaretLeft aria-hidden="true" size={22} weight="light" />
          </button>
          <button
            className="capsule-primary"
            disabled={mode !== "reading"}
            onClick={() => {
              if (isLastSpread) onWrite();
              else sceneApiRef.current?.startTurn?.(1);
            }}
            type="button"
          >
            {isLastSpread ? labels.writeReply : labels.turnPage}
          </button>
          <button
            aria-label={labels.nextSpread}
            className="capsule-chevron"
            disabled={isLastSpread || mode !== "reading"}
            onClick={() => sceneApiRef.current?.startTurn?.(1)}
            type="button"
          >
            <CaretRight aria-hidden="true" size={22} weight="light" />
          </button>
        </div>
        <span className="focus-book-counter">
          {String(spreadIndex + 1).padStart(2, "0")} / {String(spreadCount).padStart(2, "0")}
        </span>
        <BookZoomControl
          className="focus-book-zoom"
          labels={labels}
          onChange={setPageZoom}
          value={pageZoom}
        />
        {isLastSpread ? (
          <div className="focus-book-next-links">
            <button onClick={onPreviousReading} type="button">{labels.previousReading}</button>
            <button onClick={onReturnToInterpretation} type="button">{labels.interpretation}</button>
            <button onClick={onNextReading} type="button">{labels.nextReading}</button>
          </div>
        ) : null}
      </div>
      <p className="focus-book-instructions">{labels.instructions}</p>
      <div className="sr-only" aria-live="polite">
        {labels.spreadStatus
          .replace("{current}", String(spreadIndex + 1))
          .replace("{total}", String(spreadCount))}
      </div>
      <div className="sr-only focus-book-accessible-spread">
        {currentEntries.map((entry, index) => (
          <p data-paragraph-index={entry.paragraphIndex} key={`${entry.paragraphIndex}-${index}`}>
            {entry.text}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function WritingArchive({
  coverOptions = [],
  labels,
  letters,
  locale,
  onCoverChange,
  onClear,
  onExport,
  onLoadReading,
  onOpen,
  onSaveObsidian,
}) {
  const openButtonRef = useRef(null);
  const sceneApiRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [loadedReadings, setLoadedReadings] = useState({});
  const [loadingNumber, setLoadingNumber] = useState(null);
  const [mode, setMode] = useState("shelf");
  const [selectedNumber, setSelectedNumber] = useState(() => letters[0]?.number ?? null);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  const [pageZoom, setPageZoom] = useState(1);

  const selectedIndex = Math.max(0, letters.findIndex((letter) => letter.number === selectedNumber));
  const selected = letters[selectedIndex] ?? letters[0];
  const sourceReading = selected ? loadedReadings[selected.number] : null;
  const sourcePages = useMemo(
    () => paginateParagraphs(
      sourceReading?.[locale]?.text ?? [],
      Math.round((compact ? 280 : 680) / pageZoom),
    ),
    [compact, locale, pageZoom, sourceReading],
  );
  const replyPages = useMemo(
    () => paginateParagraphs(
      plainReplyParagraphs(selected?.reply?.text ?? ""),
      Math.round((compact ? 280 : 760) / pageZoom),
    ),
    [compact, pageZoom, selected],
  );
  const compactPages = useMemo(() => {
    if (!compact) return [];
    const pages = [];
    const count = pairedSpreadCount(sourcePages, replyPages);
    for (let index = 0; index < count; index += 1) {
      if (sourcePages[index]?.length) {
        pages.push({
          label: labels.sourceText,
          page: sourcePages[index],
          title: sourceReading?.[locale]?.title ?? selected?.title ?? "",
        });
      }
      if (replyPages[index]?.length) {
        pages.push({
          label: labels.yourLetter,
          page: replyPages[index],
          title: selected ? labels.letterLabel.replace("{number}", selected.displayNumber) : "",
        });
      }
    }
    return pages.length ? pages : [{ label: labels.yourLetter, page: ["—"], title: selected?.title ?? "" }];
  }, [compact, labels.letterLabel, labels.sourceText, labels.yourLetter, locale, replyPages, selected, sourcePages, sourceReading]);
  const spreadCount = compact ? compactPages.length : pairedSpreadCount(sourcePages, replyPages);
  const pagePayload = useMemo(() => {
    if (compact) {
      const pages = compactPages.map((entry) => entry.page);
      const pageLabels = compactPages.map((entry) => entry.label);
      const pageTitles = compactPages.map((entry) => entry.title);
      return {
        pageTotal: pages.length,
        replyLabels: pageLabels,
        replyPages: pages,
        replyTitles: pageTitles,
        sourceLabels: pageLabels,
        sourcePages: pages,
        sourceTitles: pageTitles,
      };
    }
    return {
      replyPages,
      replyTitle: selected ? labels.letterLabel.replace("{number}", selected.displayNumber) : "",
      sourcePages,
      sourceTitle: sourceReading?.[locale]?.title ?? selected?.title ?? "",
    };
  }, [compact, compactPages, labels.letterLabel, locale, replyPages, selected, sourcePages, sourceReading]);
  const pageDesign = useMemo(() => ({ contrast: "strong", fontScale: pageZoom }), [pageZoom]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (letters.some((letter) => letter.number === selectedNumber)) return;
    setSelectedNumber(letters[0]?.number ?? null);
    setMode("shelf");
    setSpreadIndex(0);
  }, [letters, selectedNumber]);

  useEffect(() => {
    setSpreadIndex((current) => clampSpreadIndex(current, spreadCount));
  }, [spreadCount]);

  useEffect(() => {
    if (mode !== "reading") return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMode("closing");
      }
      if (event.key === "ArrowRight") sceneApiRef.current?.startTurn?.(1);
      if (event.key === "ArrowLeft") sceneApiRef.current?.startTurn?.(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode]);

  async function ensureReading(number) {
    if (loadedReadings[number]) return loadedReadings[number];
    setLoadingNumber(number);
    try {
      const reading = await onLoadReading(number);
      setLoadedReadings((current) => ({ ...current, [number]: reading }));
      return reading;
    } finally {
      setLoadingNumber(null);
    }
  }

  async function openSelected() {
    if (!selected || mode !== "shelf") return;
    try {
      await ensureReading(selected.number);
      await document.fonts?.ready;
      setSpreadIndex(0);
      setMode("opening");
    } catch {
      openButtonRef.current?.focus();
    }
  }

  function selectOffset(offset) {
    if (mode !== "shelf") return;
    const nextIndex = (selectedIndex + offset + letters.length) % letters.length;
    setSelectedNumber(letters[nextIndex].number);
    setSpreadIndex(0);
  }

  function closeReading() {
    if (mode === "shelf" || mode === "closing") return;
    setMode("closing");
  }

  return (
    <section
      aria-label={labels.archive}
      className={`writing-archive-stage is-${mode}`}
      onKeyDown={(event) => {
        if (mode !== "shelf") return;
        if (event.key === "ArrowLeft") selectOffset(-1);
        if (event.key === "ArrowRight") selectOffset(1);
      }}
    >
      <WritingBookScene
        activeNumber={selected?.number}
        currentSpread={spreadIndex}
        labels={labels}
        letters={letters}
        locale={locale}
        mode={mode}
        onCloseSettled={() => {
          if (mode !== "closing") return;
          setMode("shelf");
          setSpreadIndex(0);
          window.requestAnimationFrame(() => openButtonRef.current?.focus());
        }}
        onOpenSettled={() => {
          if (mode !== "opening") return;
          setMode("reading");
          window.requestAnimationFrame(() => closeButtonRef.current?.focus());
        }}
        onSelect={(number) => {
          setSelectedNumber(number);
          setSpreadIndex(0);
        }}
        onTurnComplete={(nextIndex) => setSpreadIndex(nextIndex)}
        pageDesign={pageDesign}
        pagePayload={pagePayload}
        sceneApiRef={sceneApiRef}
        spreadCount={spreadCount}
        compactSinglePage
      />

      <div className="writing-archive-heading">
        <p>{labels.archive}</p>
        <h2>{selected?.title}</h2>
        <span>{selected?.dateLabel}</span>
      </div>

      {mode === "shelf" ? (
        <>
          <CapsuleNavigator
            className="writing-archive-open is-on-dark"
            label={loadingNumber ? labels.preparing : labels.open}
            nextLabel={labels.nextVolume}
            onNext={() => selectOffset(1)}
            onPrevious={() => selectOffset(-1)}
            onPrimary={openSelected}
            previousLabel={labels.previousVolume}
            primaryRef={openButtonRef}
          />
          <div className="writing-archive-index" aria-label={labels.chooseVolume} role="tablist">
            {letters.map((letter) => (
              <button
                aria-label={`${labels.chooseVolume}: ${letter.title}`}
                aria-selected={letter.number === selected?.number}
                key={letter.number}
                onClick={() => setSelectedNumber(letter.number)}
                role="tab"
                type="button"
              />
            ))}
          </div>
          <p className="writing-archive-instructions">{labels.shelfInstructions}</p>
          <CoverPicker
            currentCover={selected.cover}
            currentId={selected.coverId}
            labels={{
              choose: labels.chooseCover,
              close: labels.closeCoverPicker,
              edition: labels.personalEdition,
              hint: labels.chooseCoverHint,
            }}
            onChange={(coverId) => onCoverChange?.(selected.number, coverId)}
            options={coverOptions}
          />
        </>
      ) : null}

      {mode !== "shelf" ? (
        <>
          <span className="writing-archive-close-wrap">
            <CircleClose buttonRef={closeButtonRef} className="is-on-dark" label={labels.close} onClick={closeReading} />
          </span>
          <div className="writing-book-actions">
            <button onClick={() => onOpen(selected.number)} type="button">{labels.continueWriting}</button>
            <details className="download-menu writing-book-download">
              <summary>{labels.download}</summary>
              <div>
                <button onClick={() => onExport("markdown", selected.number)}>{labels.exportMarkdown}</button>
                <button onClick={() => onExport("text", selected.number)}>{labels.exportText}</button>
                <button onClick={() => onExport("json", selected.number)}>{labels.exportBackup}</button>
                <button onClick={() => onExport("print", selected.number)}>{labels.printPdf}</button>
              </div>
            </details>
            <div className="writing-book-turner">
              <button
                aria-label={labels.previousSpread}
                className="capsule-chevron"
                disabled={spreadIndex === 0 || mode !== "reading"}
                onClick={() => sceneApiRef.current?.startTurn?.(-1)}
                type="button"
              >
                <CaretLeft aria-hidden="true" size={22} weight="light" />
              </button>
              <button
                className="capsule-primary"
                disabled={spreadIndex === spreadCount - 1 || mode !== "reading"}
                onClick={() => sceneApiRef.current?.startTurn?.(1)}
                type="button"
              >
                {labels.turnPage}
              </button>
              <button
                aria-label={labels.nextSpread}
                className="capsule-chevron"
                disabled={spreadIndex === spreadCount - 1 || mode !== "reading"}
                onClick={() => sceneApiRef.current?.startTurn?.(1)}
                type="button"
              >
                <CaretRight aria-hidden="true" size={22} weight="light" />
              </button>
            </div>
            <BookZoomControl
              className="writing-book-zoom"
              labels={labels}
              onChange={setPageZoom}
              value={pageZoom}
            />
            <span className="writing-book-counter">
              {String(spreadIndex + 1).padStart(2, "0")} / {String(spreadCount).padStart(2, "0")}
            </span>
          </div>
          <p className="writing-book-instructions">{labels.pageInstructions}</p>
        </>
      ) : null}

      <div className="sr-only writing-book-live-status" aria-live="polite">
        {mode === "reading" ? (compact ? labels.pageStatus : labels.spreadStatus)
          .replace("{current}", String(spreadIndex + 1))
          .replace("{total}", String(spreadCount)) : ""}
      </div>
      {mode === "reading" && sourceReading ? (
        <div className="sr-only writing-book-accessible-spread">
          {compact ? (
            <section aria-label={compactPages[spreadIndex]?.label}>
              <h3>{compactPages[spreadIndex]?.title}</h3>
              {compactPages[spreadIndex]?.page.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          ) : <>
            <section aria-label={labels.sourceText}>
              <h3>{sourceReading[locale].title}</h3>
              {sourcePages[Math.min(spreadIndex, sourcePages.length - 1)]?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
            <section aria-label={labels.yourLetter}>
              <h3>{pagePayload.replyTitle}</h3>
              {replyPages[Math.min(spreadIndex, replyPages.length - 1)]?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          </>}
        </div>
      ) : null}
      {mode === "reading" && sourceReading ? (
        <div aria-hidden="true" className="writing-book-print-spread">
          <section>
            <p>{labels.sourceText}</p>
            <h3>{sourceReading[locale].title}</h3>
            {sourceReading[locale].text.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
          <section>
            <p>{labels.yourLetter}</p>
            <h3>{pagePayload.replyTitle}</h3>
            {plainReplyParagraphs(selected.reply.text).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
        </div>
      ) : null}

      <div className="writing-archive-secondary-actions">
        <button onClick={() => onSaveObsidian(selected.number)} type="button">{labels.saveToObsidian}</button>
        <button className="quiet-danger" onClick={() => onClear(selected.number)} type="button">{labels.delete}</button>
      </div>
    </section>
  );
}
