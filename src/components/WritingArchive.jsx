import { useEffect, useMemo, useRef, useState } from "react";
import { BookmarkSimple, CaretLeft, CaretRight } from "@phosphor-icons/react";
import * as THREE from "three";
import { CapsuleNavigator, CircleClose } from "./NavigationControls.jsx";
import {
  clampSpreadIndex,
  paginateParagraphEntries,
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

function smoothstep(value) {
  const clamped = THREE.MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function damp(current, target, rate, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-rate * delta));
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

function makePageCanvas({ compact, label, page, pageDesign, pageIndex, pageTotal, title }) {
  const canvas = document.createElement("canvas");
  canvas.width = compact ? 720 : 1024;
  canvas.height = compact ? 1000 : 1400;
  const context = canvas.getContext("2d");
  const margin = compact ? 58 : 94;
  const contentWidth = canvas.width - margin * 2;
  const labelY = compact ? 74 : 112;
  const ruleY = compact ? 96 : 145;
  const titleY = compact ? 164 : 235;
  const bodyY = compact ? 252 : 360;
  const bodyMaxY = compact ? 880 : 1230;
  const footerY = compact ? 946 : 1320;
  const footerRuleY = compact ? 962 : 1340;
  const display = pageDesign?.display ?? "warm";
  const isNight = display === "night";
  const paper = isNight ? "#24221f" : display === "clear" ? "#fffdfa" : display === "eink" ? "#ffffff" : "#f3efe7";
  const ink = isNight ? "#eee8dc" : display === "eink" ? "#000000" : "#24221f";
  const quiet = isNight ? "#aaa398" : display === "eink" ? "#333333" : "#716b62";
  const rule = isNight ? "rgba(238, 232, 220, 0.24)" : "rgba(36, 34, 31, 0.25)";
  const accent = isNight ? "#cf7059" : display === "eink" ? "#000000" : "#b44932";
  const fontScale = THREE.MathUtils.clamp(pageDesign?.fontScale ?? 1, 0.85, 1.4);
  const lineHeightScale = THREE.MathUtils.clamp((pageDesign?.lineHeight ?? 1.62) / 1.62, 0.85, 1.3);
  const bodyFamily = {
    legible: 'Georgia, "Times New Roman", serif',
    literary: '"Cormorant Garamond", Georgia, serif',
    sans: '"Inter", Arial, sans-serif',
  }[pageDesign?.typeface] ?? '"Cormorant Garamond", Georgia, serif';
  context.fillStyle = paper;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.globalAlpha = isNight ? 0.028 : 0.055;
  context.fillStyle = isNight ? "#d2c8b8" : "#7b6c5d";
  for (let index = 0; index < 520; index += 1) {
    const x = (index * 197) % canvas.width;
    const y = (index * 313) % canvas.height;
    context.fillRect(x, y, index % 5 === 0 ? 2 : 1, 1);
  }
  context.restore();

  context.fillStyle = quiet;
  context.font = `500 ${compact ? 16 : 22}px "Inter", sans-serif`;
  context.letterSpacing = compact ? "3px" : "4px";
  context.fillText(label.toUpperCase(), margin, labelY);
  context.strokeStyle = rule;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(margin, ruleY);
  context.lineTo(canvas.width - margin, ruleY);
  context.stroke();

  context.fillStyle = ink;
  context.letterSpacing = "0px";
  context.font = `500 ${compact ? 58 : 62}px "Cormorant Garamond", Georgia, serif`;
  drawWrappedLines(context, title, margin, titleY, contentWidth, compact ? 62 : 68, compact ? 218 : 330);

  context.font = `400 ${Math.round((compact ? 44 : 35) * fontScale)}px ${bodyFamily}`;
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
      Math.round((compact ? 56 : 48) * fontScale * lineHeightScale),
      bodyMaxY,
    );
    if (index < paragraphs.length - 1) cursorY += compact ? 22 : 30;
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
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
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
    color: coverPalette(index),
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
    bumpScale: 0.009,
    roughness: 0.95,
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
    cloth,
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
      pagePayload,
      spreadCount,
    };
    sceneApiRef.current?.sync?.();
  }, [activeNumber, currentSpread, mode, onCloseSettled, onOpenSettled, onSelect, onTurnComplete, pagePayload, sceneApiRef, spreadCount]);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
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

    scene.add(new THREE.HemisphereLight(0xf5ead8, 0x0d0d0c, 2.6));
    const key = new THREE.DirectionalLight(0xffedcf, 5.2);
    key.position.set(-4.5, 7, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8090aa, 1.15);
    fill.position.set(5, 2, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xb44932, 1.1);
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
      const coverMaterial = new THREE.MeshPhysicalMaterial({
        map: selectedCoverTexture,
        roughness: 0.86,
        sheen: 0.12,
        sheenRoughness: 0.9,
      });
      openBook.frontCover.material.dispose();
      openBook.frontCover.material = coverMaterial;
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
      const canvas = makePageCanvas({
        compact: mount.clientWidth <= 720,
        label: kind === "source" ? labels.sourceText : labels.yourLetter,
        page,
        pageDesign,
        pageIndex: pageNumbers?.[index] ?? index,
        pageTotal,
        title: kind === "source" ? payload.sourceTitle : payload.replyTitle,
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
        THREE.MathUtils.lerp(shelfPosition.y, -0.42, lift),
        THREE.MathUtils.lerp(shelfPosition.z, 1.05, lift),
      );
      const compact = mount.clientWidth <= 720;
      const settledScale = compact ? 0.57 : 0.9;
      const scale = THREE.MathUtils.lerp(compact ? 0.2 : 0.3, settledScale, lift);
      openBook.root.scale.setScalar(scale);
      openBook.root.rotation.x = THREE.MathUtils.lerp(0, -0.11, lift);
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
      const rate = reducedMotion ? 1000 : turn.committed ? 3.7 : 8;
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
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      const compact = width <= 720;
      camera.fov = compact ? 46 : 35;
      camera.position.set(0, compact ? 0.35 : 0.9, compact ? 13.2 : 11.6);
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
  }, [labels.sourceText, labels.yourLetter, letters, pageDesign, sceneApiRef]);

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
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  const [mode, setMode] = useState("opening");

  const characterLimit = useMemo(() => {
    const sizeFactor = 100 / readerPreferences.fontSize;
    const spacingFactor = 1.62 / readerPreferences.lineHeight;
    const base = compact ? 390 : 880;
    return Math.round(base * sizeFactor * spacingFactor);
  }, [compact, readerPreferences.fontSize, readerPreferences.lineHeight]);
  const indexedPages = useMemo(
    () => paginateParagraphEntries(content.text, characterLimit),
    [characterLimit, content.text],
  );
  const spreadCount = Math.max(1, Math.ceil(indexedPages.length / 2));
  const initialSpread = spreadIndexForParagraph(indexedPages, initialParagraph);
  const [spreadIndex, setSpreadIndex] = useState(() => clampSpreadIndex(initialSpread, spreadCount));
  const selectedVolume = useMemo(() => [{
    cover,
    number: letterNumber,
    title: content.title,
  }], [content.title, cover, letterNumber]);
  const pageDesign = useMemo(() => ({
    display: readerPreferences.display,
    fontScale: readerPreferences.fontSize / 100,
    lineHeight: readerPreferences.lineHeight,
    typeface: readerPreferences.typeface,
  }), [readerPreferences.display, readerPreferences.fontSize, readerPreferences.lineHeight, readerPreferences.typeface]);
  const pagePayload = useMemo(() => {
    const sourcePages = [];
    const replyPages = [];
    const sourcePageNumbers = [];
    const replyPageNumbers = [];
    for (let spread = 0; spread < spreadCount; spread += 1) {
      const leftIndex = spread * 2;
      const rightIndex = leftIndex + 1;
      sourcePages.push(indexedPages[leftIndex]?.map((entry) => entry.text) ?? []);
      replyPages.push(indexedPages[rightIndex]?.map((entry) => entry.text) ?? [labels.endMark]);
      sourcePageNumbers.push(leftIndex);
      replyPageNumbers.push(rightIndex);
    }
    return {
      pageTotal: spreadCount * 2,
      replyPageNumbers,
      replyPages,
      replyTitle: letterLabel,
      sourcePageNumbers,
      sourcePages,
      sourceTitle: content.title,
    };
  }, [content.title, indexedPages, labels.endMark, letterLabel, spreadCount]);

  const currentEntries = [
    ...(indexedPages[spreadIndex * 2] ?? []),
    ...(indexedPages[spreadIndex * 2 + 1] ?? []),
  ];
  const currentParagraph = currentEntries[0]?.paragraphIndex ?? 0;
  const isBookmarked = bookmarks.some((bookmark) => (
    bookmark.locale === locale && bookmark.paragraphIndex === currentParagraph
  ));
  const isLastSpread = spreadIndex === spreadCount - 1;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setCompact(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    setSpreadIndex(clampSpreadIndex(
      spreadIndexForParagraph(indexedPages, positionParagraphRef.current),
      spreadCount,
    ));
  }, [indexedPages, spreadCount]);

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
    const paragraph = indexedPages[nextSpread * 2]?.[0]?.paragraphIndex
      ?? indexedPages[nextSpread * 2 + 1]?.[0]?.paragraphIndex
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
      />

      <div className="focus-book-identity">
        <p>{letterLabel}</p>
        <h2 id="focused-letter-title">{content.title}</h2>
      </div>

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
  labels,
  letters,
  locale,
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

  const selectedIndex = Math.max(0, letters.findIndex((letter) => letter.number === selectedNumber));
  const selected = letters[selectedIndex] ?? letters[0];
  const sourceReading = selected ? loadedReadings[selected.number] : null;
  const sourcePages = useMemo(
    () => paginateParagraphs(sourceReading?.[locale]?.text ?? [], compact ? 300 : 790),
    [compact, locale, sourceReading],
  );
  const replyPages = useMemo(
    () => paginateParagraphs(plainReplyParagraphs(selected?.reply?.text ?? ""), compact ? 280 : 930),
    [compact, selected],
  );
  const spreadCount = pairedSpreadCount(sourcePages, replyPages);
  const pagePayload = useMemo(() => ({
    replyPages,
    replyTitle: selected ? labels.letterLabel.replace("{number}", selected.displayNumber) : "",
    sourcePages,
    sourceTitle: sourceReading?.[locale]?.title ?? selected?.title ?? "",
  }), [labels.letterLabel, locale, replyPages, selected, sourcePages, sourceReading]);

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
        pagePayload={pagePayload}
        sceneApiRef={sceneApiRef}
        spreadCount={spreadCount}
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
            <span className="writing-book-counter">
              {String(spreadIndex + 1).padStart(2, "0")} / {String(spreadCount).padStart(2, "0")}
            </span>
          </div>
          <p className="writing-book-instructions">{labels.pageInstructions}</p>
        </>
      ) : null}

      <div className="sr-only writing-book-live-status" aria-live="polite">
        {mode === "reading" ? labels.spreadStatus
          .replace("{current}", String(spreadIndex + 1))
          .replace("{total}", String(spreadCount)) : ""}
      </div>
      {mode === "reading" && sourceReading ? (
        <div className="sr-only writing-book-accessible-spread">
          <section aria-label={labels.sourceText}>
            <h3>{sourceReading[locale].title}</h3>
            {sourcePages[Math.min(spreadIndex, sourcePages.length - 1)]?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
          <section aria-label={labels.yourLetter}>
            <h3>{pagePayload.replyTitle}</h3>
            {replyPages[Math.min(spreadIndex, replyPages.length - 1)]?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </section>
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
