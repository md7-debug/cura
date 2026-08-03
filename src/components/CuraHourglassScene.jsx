import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { hourglassSandLevels } from "../lib/timer.js";

function addRoundedRect(path, x, y, width, height, radius) {
  const right = x + width;
  const bottom = y + height;
  path.moveTo(x + radius, y);
  path.lineTo(right - radius, y);
  path.quadraticCurveTo(right, y, right, y + radius);
  path.lineTo(right, bottom - radius);
  path.quadraticCurveTo(right, bottom, right - radius, bottom);
  path.lineTo(x + radius, bottom);
  path.quadraticCurveTo(x, bottom, x, bottom - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
}

function damp(current, target, rate, delta) {
  return current + (target - current) * (1 - Math.exp(-rate * delta));
}

export default function CuraHourglassScene({ active, elapsed, running }) {
  const mountRef = useRef(null);
  const sceneApiRef = useRef(null);
  const valuesRef = useRef({ active, elapsed, running });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    valuesRef.current = { active, elapsed, running };
    sceneApiRef.current?.update(valuesRef.current);
  }, [active, elapsed, running]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let disposed = false;
    let started = false;
    let stopScene = () => {};

    function startScene() {
      if (started || disposed) return;
      started = true;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      } catch {
        return;
      }

      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(31, 2 / 3, 0.1, 30);
      camera.position.set(0, 0.05, 7.7);
      camera.lookAt(0, 0, 0);

      const frameMaterial = new THREE.MeshPhysicalMaterial({ metalness: 0.72, roughness: 0.38 });
      const edgeMaterial = new THREE.MeshPhysicalMaterial({ metalness: 0.82, roughness: 0.25 });
      const accentMaterial = new THREE.MeshPhysicalMaterial({ metalness: 0.36, roughness: 0.42 });
      const sandMaterial = new THREE.MeshStandardMaterial({ roughness: 0.92 });
      const grainMaterial = new THREE.PointsMaterial({
        opacity: 0.9,
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
      });
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        clearcoat: 1,
        depthWrite: false,
        ior: 1.46,
        opacity: 0.27,
        roughness: 0.08,
        side: THREE.DoubleSide,
        thickness: 0.2,
        transmission: 0.94,
        transparent: true,
      });

      const root = new THREE.Group();
      root.rotation.y = -0.16;
      scene.add(root);

      const frameShape = new THREE.Shape();
      addRoundedRect(frameShape, -1.26, -2.08, 2.52, 4.16, 1.23);
      const frameHole = new THREE.Path();
      addRoundedRect(frameHole, -1.04, -1.84, 2.08, 3.68, 1.01);
      frameShape.holes.push(frameHole);
      const frameGeometry = new THREE.ExtrudeGeometry(frameShape, {
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.035,
        bevelThickness: 0.045,
        curveSegments: 28,
        depth: 0.24,
      });
      frameGeometry.center();
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.castShadow = true;
      root.add(frame);

      const lipShape = new THREE.Shape();
      addRoundedRect(lipShape, -1.06, -1.86, 2.12, 3.72, 1.03);
      const lipHole = new THREE.Path();
      addRoundedRect(lipHole, -0.99, -1.79, 1.98, 3.58, 0.96);
      lipShape.holes.push(lipHole);
      const lipGeometry = new THREE.ExtrudeGeometry(lipShape, {
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.012,
        bevelThickness: 0.018,
        curveSegments: 24,
        depth: 0.29,
      });
      lipGeometry.center();
      const lip = new THREE.Mesh(lipGeometry, edgeMaterial);
      lip.position.z = 0.012;
      root.add(lip);

      const glassProfile = [
        [0.76, -1.5],
        [0.92, -1.32],
        [0.98, -1.02],
        [0.91, -0.72],
        [0.66, -0.4],
        [0.18, -0.07],
        [0.18, 0.07],
        [0.66, 0.4],
        [0.91, 0.72],
        [0.98, 1.02],
        [0.92, 1.32],
        [0.76, 1.5],
      ].map(([radius, y]) => new THREE.Vector2(radius, y));
      const glass = new THREE.Mesh(new THREE.LatheGeometry(glassProfile, 64), glassMaterial);
      glass.position.z = 0.025;
      root.add(glass);

      const cupGeometry = new THREE.CylinderGeometry(0.73, 0.86, 0.22, 64, 1, false);
      const upperCup = new THREE.Mesh(cupGeometry, edgeMaterial);
      upperCup.position.set(0, 1.67, 0);
      const lowerCup = upperCup.clone();
      lowerCup.position.y = -1.67;
      root.add(upperCup, lowerCup);

      const axisGeometry = new THREE.CylinderGeometry(0.105, 0.105, 0.56, 32);
      axisGeometry.rotateZ(Math.PI / 2);
      const axis = new THREE.Mesh(axisGeometry, accentMaterial);
      axis.position.set(0, 0, 0.48);
      root.add(axis);

      const sandHeight = 1.18;
      const sandFloor = 1.28;
      const topSandGeometry = new THREE.ConeGeometry(0.74, sandHeight, 64);
      topSandGeometry.rotateZ(Math.PI);
      topSandGeometry.translate(0, sandHeight / 2, 0);
      const topSand = new THREE.Mesh(topSandGeometry, sandMaterial);
      topSand.position.set(0, 0.07, 0.04);
      root.add(topSand);

      const bottomSandGeometry = new THREE.ConeGeometry(0.74, sandHeight, 64);
      bottomSandGeometry.translate(0, -sandHeight / 2, 0);
      const bottomSand = new THREE.Mesh(bottomSandGeometry, sandMaterial);
      bottomSand.position.set(0, -0.07, 0.04);
      root.add(bottomSand);

      const stream = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.026, 1, 12),
        sandMaterial,
      );
      stream.position.set(0, 0.4, 0.22);
      root.add(stream);

      const grainCount = 28;
      const grainPositions = new Float32Array(grainCount * 3);
      const grainPhases = Array.from({ length: grainCount }, (_, index) => (
        ((index * 11) % grainCount) / grainCount
      ));
      const grainGeometry = new THREE.BufferGeometry();
      grainGeometry.setAttribute("position", new THREE.BufferAttribute(grainPositions, 3));
      const fallingGrains = new THREE.Points(grainGeometry, grainMaterial);
      fallingGrains.position.z = 0.24;
      root.add(fallingGrains);

      const ambient = new THREE.HemisphereLight(0xf7f0e5, 0x171511, 2.15);
      const key = new THREE.DirectionalLight(0xfff1dd, 4.6);
      key.position.set(-3.5, 5, 6);
      key.castShadow = true;
      key.shadow.mapSize.set(512, 512);
      const rim = new THREE.DirectionalLight(0xcf7059, 1.05);
      rim.position.set(4, -1, 4);
      scene.add(ambient, key, rim);

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let values = valuesRef.current;
      let frameId = 0;
      let visible = true;
      let lastTime = performance.now();

      function readColor(name, fallback) {
        return getComputedStyle(mount).getPropertyValue(name).trim() || fallback;
      }

      function applyPalette() {
        frameMaterial.color.setStyle(readColor("--hourglass-frame", "#35322e"));
        edgeMaterial.color.setStyle(readColor("--hourglass-edge", "#8f887d"));
        glassMaterial.color.setStyle(readColor("--hourglass-glass", "#eee8dc"));
        accentMaterial.color.setStyle(readColor("--hourglass-accent", "#b44932"));
        sandMaterial.color.setStyle(readColor("--hourglass-sand", "#a84b35"));
        grainMaterial.color.setStyle(readColor("--hourglass-sand", "#a84b35"));
      }

      function updateFallingGrains(now, streamStart, streamEnd) {
        for (let index = 0; index < grainCount; index += 1) {
          const flow = (now * 0.00046 + grainPhases[index]) % 1;
          const offset = index * 3;
          grainPositions[offset] = Math.sin((flow + grainPhases[index]) * Math.PI * 4) * 0.016;
          grainPositions[offset + 1] = streamStart + flow * (streamEnd - streamStart);
          grainPositions[offset + 2] = Math.cos((flow + grainPhases[index]) * Math.PI * 3) * 0.018;
        }
        grainGeometry.attributes.position.needsUpdate = true;
      }

      function updateScene(delta, now = 0) {
        const targetRotation = values.active ? Math.PI : 0;
        const sandLevels = hourglassSandLevels(values.elapsed);
        const topTarget = values.active ? sandLevels.bottom : sandLevels.top;
        const bottomTarget = values.active ? sandLevels.top : sandLevels.bottom;
        const topDisplayTarget = values.active ? Math.max(0.065, topTarget) : Math.max(0.002, topTarget);
        const bottomDisplayTarget = Math.max(0.002, bottomTarget);
        if (reducedMotion) {
          root.rotation.x = targetRotation;
          topSand.scale.y = topDisplayTarget;
          bottomSand.scale.y = bottomDisplayTarget;
        } else {
          root.rotation.x = damp(root.rotation.x, targetRotation, 3.2, delta);
          topSand.scale.y = damp(topSand.scale.y, topDisplayTarget, 3.2, delta);
          bottomSand.scale.y = damp(bottomSand.scale.y, bottomDisplayTarget, 3.2, delta);
        }
        topSand.position.y = values.active
          ? sandFloor - sandHeight * topSand.scale.y
          : 0.1;
        bottomSand.position.y = values.active
          ? -0.1
          : -sandFloor + sandHeight * bottomSand.scale.y;
        const turnLift = Math.sin(root.rotation.x);
        root.rotation.y = -0.16 + turnLift * 0.24;
        root.rotation.z = turnLift * 0.025;
        root.position.y = turnLift * 0.09;
        const scale = 1 + turnLift * 0.035;
        root.scale.setScalar(scale);
        topSand.visible = values.active || topTarget > 0.001;
        bottomSand.visible = bottomTarget > 0.001;
        stream.visible = values.running && values.elapsed < 0.999;
        fallingGrains.visible = stream.visible && !reducedMotion;
        const streamStart = -0.1;
        const streamEnd = topSand.position.y;
        if (fallingGrains.visible) updateFallingGrains(now, streamStart, streamEnd);
        stream.position.y = (streamStart + streamEnd) / 2;
        const streamLength = Math.max(0.08, streamEnd - streamStart);
        stream.scale.y = streamLength * (
          values.running && !reducedMotion ? 0.96 + Math.sin(now * 0.018) * 0.04 : 1
        );
        const streamPulse = values.running && !reducedMotion ? 0.9 + Math.sin(now * 0.024) * 0.1 : 1;
        stream.scale.x = streamPulse;
        stream.scale.z = streamPulse;
      }

      function resize() {
        const width = Math.max(1, mount.clientWidth);
        const height = Math.max(1, mount.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      function schedule() {
        if (!frameId && visible && !document.hidden && !disposed) {
          frameId = window.requestAnimationFrame(renderFrame);
        }
      }

      function renderFrame(now) {
        frameId = 0;
        if (!visible || document.hidden || disposed) return;
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        updateScene(delta, now);
        renderer.render(scene, camera);
        schedule();
      }

      function handleVisibility() {
        lastTime = performance.now();
        schedule();
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        handleVisibility();
      }, { rootMargin: "120px" });
      visibilityObserver.observe(mount);
      const paletteObserver = new MutationObserver(() => {
        applyPalette();
        schedule();
      });
      paletteObserver.observe(document.documentElement, {
        attributeFilter: ["class", "data-reader-display", "data-reader-scope", "data-theme"],
        attributes: true,
      });
      document.addEventListener("visibilitychange", handleVisibility);

      resize();
      applyPalette();
      updateScene(1);
      renderer.render(scene, camera);
      setReady(true);
      schedule();

      sceneApiRef.current = {
        update(nextValues) {
          values = nextValues;
          applyPalette();
          schedule();
        },
      };

      stopScene = () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        paletteObserver.disconnect();
        document.removeEventListener("visibilitychange", handleVisibility);
        sceneApiRef.current = null;
        scene.traverse((object) => {
          object.geometry?.dispose?.();
          const materials = Array.isArray(object.material)
            ? object.material
            : object.material ? [object.material] : [];
          materials.forEach((material) => material.dispose());
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    const startObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      startObserver.disconnect();
      startScene();
    }, { rootMargin: "180px" });
    startObserver.observe(mount);

    return () => {
      disposed = true;
      startObserver.disconnect();
      stopScene();
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className={`cura-hourglass-scene${ready ? " is-ready" : ""}`}
      ref={mountRef}
    >
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
