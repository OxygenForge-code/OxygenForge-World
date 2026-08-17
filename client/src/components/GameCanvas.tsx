/**
 * OxygenForge World style: Jeolojik Sefer Günlüğü. React frames a full-screen
 * Babylon canvas; the canvas owns the world and this component owns lifecycle.
 */

import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { INPUT_EVENT, type InputMessage, type RuntimeSettings } from "@/game/GameEvents";
import { GameHud } from "./GameHud";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: false,
      adaptToDeviceRatio: false,
      disableWebGL2Support: false,
    });
    let handle: GameHandle | null = null;
    let fpsLimit = 60;
    let lastRender = 0;
    const applyEngineSettings = (settings: RuntimeSettings) => {
      if (typeof settings.fpsLimit === "number") fpsLimit = Math.max(30, Math.min(60, settings.fpsLimit));
      if (typeof settings.renderScale === "number") {
        const scale = Math.max(0.65, Math.min(1, settings.renderScale));
        const deviceFactor = Math.max(1, window.devicePixelRatio / 1.35);
        engine.setHardwareScalingLevel(Math.min(2.2, Math.max(0.9, deviceFactor / scale)));
      }
      if (handle && typeof settings.viewDistance === "number") handle.setViewDistance(settings.viewDistance);
    };
    applyEngineSettings({ renderScale: 0.88, fpsLimit: 60 });

    let disposed = false;
    createGameScene(engine, canvas).then((game) => {
      if (disposed) {
        game.dispose();
        return;
      }
      handle = game;
      engine.runRenderLoop(() => {
        const now = performance.now();
        if (now - lastRender < 1000 / fpsLimit) return;
        lastRender = now;
        game.scene.render();
      });
    });

    const onSettings = (event: Event) => {
      const detail = (event as CustomEvent<InputMessage>).detail;
      if (detail?.kind === "settings") applyEngineSettings(detail.settings);
    };
    window.addEventListener(INPUT_EVENT, onSettings);

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener(INPUT_EVENT, onSettings);
      window.removeEventListener("resize", onResize);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} className="game-canvas" aria-label="OxygenForge World oyun alanı" />
      <GameHud />
    </div>
  );
}
