/**
 * OxygenForge World style: field-instrument HUD with thumb-zone controls and
 * adjustable mobile graphics. Visual state stays in React; simulation remains in game modules.
 */

import { useEffect, useRef, useState } from "react";
import { Pickaxe, Plus, ChevronUp, Crosshair, Backpack, Heart, Zap, SlidersHorizontal, Eye, EyeOff, RotateCcw } from "lucide-react";
import { HUD_EVENT, type HudSnapshot, sendInput, type RuntimeSettings } from "@/game/GameEvents";

const SETTINGS_KEY = "oxygenforge:runtime-settings";

type LocalSettings = Required<RuntimeSettings> & { hudOpacity: number; reducedMotion: boolean };

const DEFAULT_SETTINGS: LocalSettings = {
  fov: 0.94,
  sensitivity: 1,
  renderScale: 0.88,
  fpsLimit: 60,
  viewDistance: 2,
  hudOpacity: 0.94,
  reducedMotion: false,
};

const INITIAL_HUD: HudSnapshot = {
  health: 5,
  energy: 88,
  day: 3,
  coords: "0 / 0 / 0",
  biome: "BAZALT YAYLASI",
  target: "ARAZİ TARANIYOR",
  note: "Kuzey yamacında oksit bakırı aranıyor.",
  selected: 0,
  inventory: [
    { type: "soil", amount: 18, label: "Toprak", tint: "#9b5d3b" },
    { type: "basalt", amount: 12, label: "Bazalt", tint: "#383634" },
    { type: "sandstone", amount: 9, label: "Kumtaşı", tint: "#c99a61" },
    { type: "wood", amount: 7, label: "Kütük", tint: "#785035" },
    { type: "torch", amount: 3, label: "Meşale", tint: "#e8a84a" },
    { type: "copper", amount: 0, label: "Bakır", tint: "#b86032" },
  ],
};

function loadSettings(): LocalSettings {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<LocalSettings>;
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function VoxelGlyph({ tint }: { tint: string }) {
  return <span className="voxel-glyph" style={{ "--block-tint": tint } as React.CSSProperties} />;
}

export function GameHud() {
  const [hud, setHud] = useState(INITIAL_HUD);
  const demo = new URLSearchParams(window.location.search).has("demo");
  const [started, setStarted] = useState(() => demo);
  const [topBarVisible, setTopBarVisible] = useState(true);
  const [isPaused, setPaused] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<LocalSettings>(loadSettings);
  const lookRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const stickRef = useRef<{ id: number; originX: number; originY: number } | null>(null);
  const [stick, setStick] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onHud = (event: Event) => setHud((event as CustomEvent<HudSnapshot>).detail);
    window.addEventListener(HUD_EVENT, onHud);
    return () => window.removeEventListener(HUD_EVENT, onHud);
  }, []);

  const updateSettings = (patch: Partial<LocalSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      const runtime: RuntimeSettings = {
        fov: next.fov,
        sensitivity: next.sensitivity,
        renderScale: next.renderScale,
        fpsLimit: next.fpsLimit,
        viewDistance: next.viewDistance,
      };
      sendInput({ kind: "settings", settings: runtime });
      return next;
    });
  };

  const applyPreset = (preset: "battery" | "balanced" | "field") => {
    if (preset === "battery") updateSettings({ renderScale: 0.7, fpsLimit: 30, viewDistance: 1 });
    if (preset === "balanced") updateSettings({ renderScale: 0.82, fpsLimit: 45, viewDistance: 2 });
    if (preset === "field") updateSettings({ renderScale: 1, fpsLimit: 60, viewDistance: 2 });
  };

  const begin = () => {
    setStarted(true);
    sendInput({ kind: "action", action: "start" });
    updateSettings({});
  };

  const onLookDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!started) return;
    lookRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onLookMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const previous = lookRef.current;
    if (!previous || previous.id !== event.pointerId) return;
    const x = event.clientX - previous.x;
    const y = event.clientY - previous.y;
    lookRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    sendInput({ kind: "look", x, y });
  };

  const clearLook = (event: React.PointerEvent<HTMLDivElement>) => {
    if (lookRef.current?.id === event.pointerId) lookRef.current = null;
  };

  const updateStick = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = stickRef.current;
    if (!active || active.id !== event.pointerId) return;
    const dx = event.clientX - active.originX;
    const dy = event.clientY - active.originY;
    const magnitude = Math.min(1, Math.hypot(dx, dy) / 42);
    const angle = Math.atan2(dy, dx);
    const x = Math.cos(angle) * magnitude;
    const y = Math.sin(angle) * magnitude;
    setStick({ x: x * 24, y: y * 24 });
    sendInput({ kind: "move", x, y });
  };

  const startStick = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    stickRef.current = { id: event.pointerId, originX: event.clientX, originY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    updateStick(event);
  };

  const stopStick = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (stickRef.current?.id !== event.pointerId) return;
    stickRef.current = null;
    setStick({ x: 0, y: 0 });
    sendInput({ kind: "move", x: 0, y: 0 });
  };

  const doAction = (action: "break" | "place" | "jump") => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    sendInput({ kind: "action", action });
  };

  return (
    <div className={`game-hud ${settings.reducedMotion ? "reduced-motion" : ""}`} style={{ "--hud-opacity": settings.hudOpacity } as React.CSSProperties} aria-live="polite">
      {demo && <div className="demo-field-window" aria-hidden="true"><span /><span /><span /><i /><b>CU DAMARI<br />K-03</b></div>}
      <div className="look-zone" onPointerDown={onLookDown} onPointerMove={onLookMove} onPointerUp={clearLook} onPointerCancel={clearLook} />

      <header className={`field-strip hud-interactive ${topBarVisible ? "" : "top-bar-hidden"}`}>
        <div className="brand-lockup"><span className="brand-mark" aria-hidden="true" /><div><b>OXYGENFORGE</b><span>WORLD // SEFER 03</span></div></div>
        <div className="field-readout"><span>{hud.biome}</span><b>{hud.coords}</b></div>
        <div className="strip-actions">
          <button type="button" aria-label="Yardım" onClick={() => setHintOpen((open) => !open)}><Crosshair size={16} /></button>
          <button type="button" aria-label="Sefer ayarları" onClick={() => setSettingsOpen((open) => !open)}><SlidersHorizontal size={16} /></button>
          <button type="button" aria-label="Üst barı gizle" onClick={() => { setTopBarVisible(false); setSettingsOpen(false); }}><EyeOff size={16} /></button>
          <button type="button" aria-label="Oyunu duraklat" onClick={() => setPaused((paused) => !paused)}><span className="pause-bars" /></button>
        </div>
      </header>
      {!topBarVisible && <button type="button" className="show-top-bar hud-interactive" aria-label="Üst barı göster" onClick={() => setTopBarVisible(true)}><Eye size={17} /></button>}

      <aside className="vitals-panel"><div className="vital"><Heart size={14} fill="currentColor" /><span>{hud.health}/5</span><i><em style={{ width: `${hud.health * 20}%` }} /></i></div><div className="vital"><Zap size={14} fill="currentColor" /><span>{hud.energy}</span><i><em className="energy" style={{ width: `${hud.energy}%` }} /></i></div></aside>
      <div className="target-readout"><span>HEDEF</span><b>{hud.target}</b></div>
      <div className="crosshair" aria-hidden="true"><i /><i /></div>
      <div className="field-note"><span>SEFER NOTU</span><p>{hud.note}</p></div>

      <div className="touch-controls hud-interactive"><div className="move-cluster"><div className="control-caption">HAREKET</div><button className="joystick" type="button" aria-label="Hareket kontrolü" onPointerDown={startStick} onPointerMove={updateStick} onPointerUp={stopStick} onPointerCancel={stopStick}><i style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} /></button></div><div className="action-cluster"><button className="round-action jump" type="button" aria-label="Zıpla" onPointerDown={doAction("jump")}><ChevronUp size={22} /></button><button className="round-action place" type="button" aria-label="Blok yerleştir" onPointerDown={doAction("place")}><Plus size={24} /></button><button className="round-action mine" type="button" aria-label="Hedef bloğu kır" onPointerDown={doAction("break")}><Pickaxe size={27} /></button></div></div>

      <nav className="hotbar hud-interactive" aria-label="Hızlı envanter"><div className="hotbar-label"><Backpack size={14} /> ARAÇ ÇANTASI</div><div className="hotbar-slots">{hud.inventory.map((slot, index) => (<button key={slot.type} type="button" className={`slot ${hud.selected === index ? "selected" : ""}`} onClick={() => sendInput({ kind: "select", index })} aria-label={`${slot.label}, ${slot.amount} adet`}><span className="slot-number">{index + 1}</span><VoxelGlyph tint={slot.tint} /><b>{slot.amount}</b></button>))}</div></nav>

      {hintOpen && <div className="help-card hud-interactive"><b>SAHA KONTROLLERİ</b><p>Sol pedle ilerle. Sağ alanda sürükleyerek bak. Kazmayı kullanabilir, + ile seçili malzemeyi yerleştirebilirsin.</p></div>}
      {settingsOpen && <section className="settings-card hud-interactive" aria-label="Sefer ayarları">
        <div className="settings-heading"><b>SEFER AYARLARI</b><span>{Math.round(settings.fov * 57.3)}°</span></div>
        <div className="settings-presets"><button type="button" onClick={() => applyPreset("battery")}>BATARYA</button><button type="button" onClick={() => applyPreset("balanced")}>DENGE</button><button type="button" onClick={() => applyPreset("field")}>SAHA</button></div>
        <label htmlFor="fov-range">FOV <input id="fov-range" type="range" min="0.72" max="1.35" step="0.01" value={settings.fov} onChange={(event) => updateSettings({ fov: Number(event.target.value) })} /></label>
        <label htmlFor="sensitivity-range">BAKIŞ HASSASİYETİ <input id="sensitivity-range" type="range" min="0.5" max="1.8" step="0.05" value={settings.sensitivity} onChange={(event) => updateSettings({ sensitivity: Number(event.target.value) })} /></label>
        <div className="settings-grid"><label>ÇÖZÜNÜRLÜK<select value={settings.renderScale} onChange={(event) => updateSettings({ renderScale: Number(event.target.value) })}><option value="0.7">EKONOMİK</option><option value="0.82">DENGELİ</option><option value="1">TAM</option></select></label><label>FPS<select value={settings.fpsLimit} onChange={(event) => updateSettings({ fpsLimit: Number(event.target.value) })}><option value="30">30 FPS</option><option value="45">45 FPS</option><option value="60">60 FPS</option></select></label><label>GÖRÜŞ MESAFESİ<select value={settings.viewDistance} onChange={(event) => updateSettings({ viewDistance: Number(event.target.value) })}><option value="1">YAKIN</option><option value="2">UZAK</option></select></label></div>
        <label htmlFor="hud-opacity">HUD OPAKLIĞI <input id="hud-opacity" type="range" min="0.55" max="1" step="0.05" value={settings.hudOpacity} onChange={(event) => updateSettings({ hudOpacity: Number(event.target.value) })} /></label>
        <label className="settings-toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} /> HAREKETİ AZALT</label>
        <button type="button" className="settings-reset" onClick={() => updateSettings(DEFAULT_SETTINGS)}><RotateCcw size={14} /> VARSAYILANA DÖN</button>
      </section>}
      {isPaused && <div className="pause-card hud-interactive"><span>SEFER DURAKLATILDI</span><button type="button" onClick={() => setPaused(false)}>DEVAM ET</button></div>}

      {!started && <div className="launch-screen hud-interactive"><div className="launch-survey-grid" aria-hidden="true" /><div className="launch-terrain" aria-hidden="true"><span /><span /><span /><i /></div><div className="launch-route-stamp" aria-hidden="true"><span>ROTA // N-03</span><b>14.82°N<br />37.16°E</b></div><div className="launch-copy"><span className="brand-mark launch-mark" aria-hidden="true" /><div className="eyebrow">KATMAN 03 // JEOTERMAL SINIR</div><h1>Katmanı oku.<br />Rotanı çiz.</h1><p>Bakır damarı kuzey yamacında. Araziyi kır, malzemeyi topla ve kendi geçidini kur.</p><button type="button" onClick={begin}>SEFERE BAŞLA <span>→</span></button><small>Yatay kullanım önerilir · Dokunmatik kontroller hazır</small></div></div>}
      <div className="rotate-warning"><span>↻</span> Daha iyi görüş için telefonu yatay çevir.</div>
    </div>
  );
}
