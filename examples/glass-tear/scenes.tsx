import { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { Captions, Grain, Vignette, rng, useFilm } from '@pack/kit';
import { Crowd, lerp, lerp3, type V3 } from '@pack/kit/three';
import { CaptionFade, EdgeLight, Glow, HeroNumber, HeroWorld, HotBody, Leader, Puffs, SectionFace, StageTracker, TopFade, orbit, projector, sweptGeometry, useHeroStyle, type HeroReadout, type Ripple } from '@pack/kit/formats/specimen';

// The hero is one tadpole of glass. Everything that happens in this film happens to it: it is hit, melted, plunged, opened,
// snapped and blown to dust, and the dust is what it comes back from. Nothing is ever cut away from it.

const HEAD = 0.74; // the fat end's radius
const REST: V3 = [0, 0.36, 0]; // where the drop's curve starts when it sits in the cradle
const DUST = 3600;

function useDrop() {
  return useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([[0, 0], [0, 0.74], [0.02, 1.48], [0.12, 2.02], [0.34, 2.55], [0.62, 2.93], [0.95, 3.16], [1.2, 3.12], [1.27, 2.9]].map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'catmullrom', 0.5);
    const radius = (d: number) => { const tail = 0.021; if (d < HEAD) { const k = (d - HEAD) / HEAD; return HEAD * Math.sqrt(Math.max(0, 1 - k * k)); } const e = (d - HEAD) / 0.6; return tail + (HEAD - tail) * Math.pow(1 + e * e, -1.65); };
    const glass = sweptGeometry(curve, radius);
    const core = sweptGeometry(curve, (d) => radius(d) * 0.76, { rings: 120, around: 40 });
    const shard = new THREE.TetrahedronGeometry(0.021, 0);
    const r = rng(41);
    const dust = Array.from({ length: DUST }, () => {
      const fromTail = r() < 0.4; const s = fromTail ? 0.34 + r() * 0.64 : r() * 0.34; const R = glass.radius(s); const p = glass.point(s); const a = r() * Math.PI * 2, q = Math.sqrt(r()) * R;
      const off: V3 = [Math.cos(a) * (q + 0.012), (r() - 0.5) * q, Math.sin(a) * (q + 0.012)]; const m = Math.hypot(...off) || 1; const sp = (s < 0.34 ? 1.4 + r() * 5.2 : 0.35 + r() * 1.5);
      return { s, at: [p[0] + off[0], p[1] + off[1], p[2] + off[2]] as V3, v: [(off[0] / m) * sp, (off[1] / m) * sp + 0.5, (off[2] / m) * sp] as V3, scale: (fromTail ? 0.75 : 0.5) + r() * r() * r() * 2.6, rot: [r() * 6, r() * 6, r() * 6] as V3, spin: 2 + r() * 9, floor: r(), roll: r() };
    });
    const arcs = Array.from({ length: 6 }, (_, k) => {
      const pts: THREE.Vector3[] = []; const d0 = HEAD + 0.28; const dd = [-0.052, -0.04, -0.026, -0.058, 0.012, -0.03][k]!; const dp = [0.02, 0.05, 0.085, -0.03, 0.07, -0.06][k]!;
      for (let i = 0; i <= 24; i++) { const d = d0 + dd * i, ph = 0.42 + dp * i + Math.sin(i * 1.9 + k * 2) * 0.012; const u = d / glass.length; const p = glass.point(u); const rr = glass.radius(u) + 0.004; pts.push(new THREE.Vector3(p[0] - Math.cos(ph) * rr, p[1], Math.sin(ph) * rr)); }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0075, 6);
    });
    return { glass, core, shard, dust, arcs };
  }, []);
}

/** A small brass hammer. Its handle runs along +x from the pivot; its face points down. */
function Hammer({ angle, pivot, metal }: { angle: number; pivot: V3; metal: string }) {
  const geo = useMemo(() => {
    const v = (p: number[][]) => p.map(([x, y]) => new THREE.Vector2(x!, y!));
    const head = new THREE.LatheGeometry(v([[0, -0.47], [0.2, -0.47], [0.255, -0.43], [0.27, -0.36], [0.26, -0.26], [0.205, -0.2], [0.195, 0.2], [0.225, 0.26], [0.24, 0.33], [0.205, 0.4], [0, 0.42]]), 64);
    const handle = new THREE.LatheGeometry(v([[0, 0], [0.085, 0], [0.098, 0.2], [0.082, 1.4], [0.068, 3.2], [0.08, 3.6], [0.085, 3.72], [0, 3.72]]), 40); handle.rotateZ(-Math.PI / 2);
    const ferrule = new THREE.CylinderGeometry(0.098, 0.098, 0.2, 32); ferrule.rotateZ(Math.PI / 2);
    return { head, handle, ferrule };
  }, []);
  return (
    <group position={pivot} rotation={[0, 0, angle]}>
      <mesh geometry={geo.handle} castShadow><meshPhysicalMaterial color="#17110B" roughness={0.3} clearcoat={0.7} /></mesh>
      <mesh geometry={geo.ferrule} position={[3.52, 0, 0]} castShadow><meshStandardMaterial color={metal} metalness={1} roughness={0.25} /></mesh>
      <mesh geometry={geo.head} position={[3.84, 0, 0]} castShadow><meshStandardMaterial color={metal} metalness={1} roughness={0.17} envMapIntensity={1.5} /></mesh>
    </group>
  );
}

/** A jeweller's cradle: three prongs that hold the fat end up out of the water. */
function Cradle({ metal, height }: { metal: string; height: number }) {
  const prongs = useMemo(() => [0, 2.09, 4.19].map((a) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12), new THREE.Vector3(Math.cos(a) * 0.33, 0.24, Math.sin(a) * 0.33), new THREE.Vector3(Math.cos(a) * 0.42, 0.49, Math.sin(a) * 0.42)]), 28, 0.024, 12)), []);
  if (height < 0.02) return null;
  return (<group position={[0, 0.1, 0]} scale={[1, height, 1]}>
    {prongs.map((g, k) => <mesh key={k} geometry={g} castShadow><meshStandardMaterial color={metal} metalness={1} roughness={0.2} /></mesh>)}
    <mesh position={[0, 0.02, 0]} castShadow><cylinderGeometry args={[0.13, 0.2, 0.09, 40]} /><meshStandardMaterial color={metal} metalness={1} roughness={0.26} /></mesh>
  </group>);
}

/** One elephant, side on, in a 300 by 160 box. */
const ELEPHANT = 'M14 148 L14 86 C14 40 62 16 118 16 C146 16 164 22 182 34 C214 34 236 58 236 90 C236 118 244 134 262 138 L262 152 C232 154 214 134 210 108 L198 106 L198 148 L164 148 L164 116 C136 126 100 126 72 116 L72 148 L38 148 L38 114 L30 148 Z';
const EAR = 'M146 42 C122 48 114 84 134 104 C160 106 178 80 172 48 Z';
/** Three elephants on a dime, drawn: the comparison as a picture you can read in a second. */
function ElephantsOnADime({ drop, dime, gone, ink, fill }: { drop: [number, number, number]; dime: number; gone: number; ink: string; fill: string }) {
  if (drop[0] <= 0 || gone >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, zIndex: 34, opacity: 1 - gone }}>
      {dime > 0 ? <g transform={`translate(214 1078) scale(${dime})`}><ellipse cx={0} cy={12} rx={92} ry={22} fill="#6d7276" /><ellipse cx={0} cy={0} rx={92} ry={22} fill="#E4E8EA" stroke={ink} strokeWidth={4} /><ellipse cx={0} cy={0} rx={72} ry={15} fill="none" stroke="#8D9397" strokeWidth={2} /></g> : null}
      {drop.map((p, k) => (p <= 0 ? null : <g key={k} transform={`translate(${62 + (k % 2) * 10} ${896 - k * 154 - (1 - p) * 260}) rotate(${(1 - p) * (k % 2 ? 14 : -14)} 150 80) scale(1.12)`} opacity={Math.min(1, p * 2)}>
        <path d={ELEPHANT} fill={fill} stroke={ink} strokeWidth={5} strokeLinejoin="round" />
        <path d={EAR} fill={ink} opacity={0.22} stroke={ink} strokeWidth={4} />
        <circle cx={206} cy={68} r={6} fill={ink} />
      </g>))}
    </svg>
  );
}

/** Brass tweezers that close on the tail. */
function Tweezers({ at, gap, tilt, metal }: { at: V3; gap: number; tilt: number; metal: string }) {
  const blade = useMemo(() => { const g = new THREE.CylinderGeometry(0.055, 0.014, 2.6, 16); g.rotateZ(-Math.PI / 2); g.scale(1, 0.55, 1); g.translate(1.3, 0, 0); return g; }, []);
  return (<group position={at} rotation={[0, 0, tilt]}>
    <mesh geometry={blade} position={[0, gap, 0]} rotation={[0, 0, 0.045]} castShadow><meshStandardMaterial color={metal} metalness={1} roughness={0.2} /></mesh>
    <mesh geometry={blade} position={[0, -gap, 0]} rotation={[0, 0, -0.045]} castShadow><meshStandardMaterial color={metal} metalness={1} roughness={0.2} /></mesh>
  </group>);
}

export default function Scenes() {
  const { at, line, t, prog, ease, look, current } = useFilm();
  const s = useHeroStyle(); const c = look.color;
  const { glass, core, shard, dust, arcs } = useDrop();
  const floats = s.stage === 'void' || s.stage === 'space';

  const T = useMemo(() => ({
    hit1: at('hammer', 1), hit2: at('Nothing'), melted: at('melted'), dripped: at('dripped'), water: at('water'), freezes: at('freezes'), skin: at('skin', 1), hot: at('hot'), shrink: at('shrink'),
    skin2: at('skin', 2), pulling: at('pulling'), tightest: at('tightest'), three: at('three'), elephants: at('elephants'), dime: at('dime'), hit3: at('hammer', 2), crackIn: at('crack', 1), tail: at('tail'), snap: at('snap'),
    fingers: at('fingers'), inside: at('inside'), mile: at('mile'), powder: at('Powder'), prince: at('prince'), y1660: at('1660'), y2017: at('2017'), hold: at('Hold'), fat: at('fat'),
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- what is happening to the drop, as plain numbers ---- */

  // Melted, then cold water from the outside in. The surface stops glowing first, the inside last.
  const heat = prog(T.melted - 0.2, T.melted + 0.35) * (1 - prog(T.water, T.skin, ease.out));
  const coreHeat = prog(T.melted, T.melted + 0.4) * (1 - prog(T.shrink - 0.2, T.pulling + 0.3, ease.inOut));
  const coreSize = lerp(1, 0.86, prog(T.shrink - 0.1, T.shrink + 0.5, ease.back));
  // Up off the cradle while it is hot, and down into the water on the word.
  const rise = prog(T.melted + 0.15, T.dripped - 0.02, ease.inOut); const fall = prog(T.dripped, T.water, ease.in); const back = prog(T.water + 0.2, T.water + 1.25, ease.out);
  const dy = lerp(lerp(0, 0.18, rise), -0.12, fall) * (1 - back);
  const cradle = 1 - prog(T.melted, T.melted + 0.25) * (1 - prog(T.water + 0.7, T.water + 1.2));

  // The crack front: how much of the drop's length is still there, from the fat end up. Each piece of dust is born when it passes.
  const a10 = line('a10'), a11 = line('a11');
  const crackKeys: [number, number][] = [[T.snap, 0.93], [a10.s, 0.9], [a10.e, 0.56], [a11.e, 0.34], [T.powder, 0.34], [T.powder + 0.13, 0]];
  const keptAt = (x: number) => { if (x < crackKeys[0]![0]) return 1; for (let i = 1; i < crackKeys.length; i++) { const [b, kb] = crackKeys[i]!; const [a, ka] = crackKeys[i - 1]!; if (x <= b) return lerp(ka, kb, (x - a) / Math.max(0.001, b - a)); } return 0; };
  const bornAt = (u: number) => { if (u >= 0.93) return T.snap; for (let i = 1; i < crackKeys.length; i++) { const [b, kb] = crackKeys[i]!; const [a, ka] = crackKeys[i - 1]!; if (u >= kb && u <= ka) return lerp(a, b, (ka - u) / Math.max(0.001, ka - kb)); } return T.powder; };
  const regrow = prog(T.y1660 - 0.6, T.hold - 0.05, ease.inOut);
  const kept = t < T.powder + 0.5 ? keptAt(t) : regrow;
  const crackTip = t > T.snap && t < T.powder ? glass.point(keptAt(t)) : null;

  // Opened: a look that cares about the inside opens on "skin" and stays open. The others open only to show the pull.
  const open = s.opensEarly ? prog(T.skin, T.skin + 0.75, ease.inOut) * (1 - prog(T.powder, T.powder + 0.01)) : prog(T.skin2 - 0.15, T.skin2 + 0.6, ease.inOut) * (1 - prog(line('a8').s - 0.3, line('a8').s + 0.25, ease.inOut));
  const pull = prog(T.skin2 + 0.6, T.pulling + 0.3) * (1 - prog(T.powder - 0.1, T.powder));

  // Three hits. The hammer stops dead on each and the drop does not care.
  const hits = [T.hit1, T.hit2, T.hit3];
  const hitNow = hits.find((h) => t < h + 0.8) ?? hits[hits.length - 1]!;
  const hammerOn = hits.some((h, i) => t > (i === 0 ? -1 : h - 0.75) && t < h + 0.8);
  const swingDown = prog(hitNow - 0.3, hitNow, ease.in); const recoil = prog(hitNow, hitNow + 0.15, ease.out); const raise = prog(hitNow + 0.2, hitNow + 0.7, ease.inOut);
  const hammerUp = hitNow === T.hit1 ? lerp(0.31, 0.5, prog(0, T.hit1 - 0.3, ease.inOut)) : 0.56;
  const hammerAngle = 0.61 + lerp(hammerUp, 0, swingDown) + recoil * 0.2 + raise * 0.5;
  const inOut = (hitNow === T.hit1 ? 1 : prog(hitNow - 0.75, hitNow - 0.4, ease.out)) * (1 - prog(hitNow + 0.3, hitNow + 0.78, ease.in));
  const hammerPivot: V3 = [-3.845 - (1 - inOut) * 2.6, -0.42 + (1 - inOut) * 0.3, 0];

  const shake = hits.concat([T.water, T.powder]).reduce((sum, h, i) => { const age = t - h; return age <= 0 ? sum : sum + Math.exp(-age * 9) * Math.sin(age * 66) * (i === 4 ? 0.2 : 0.075); }, 0);
  const flash = t > T.powder ? Math.exp(-(t - T.powder) * 4.6) : 0;
  const hitFlash = hits.reduce((m, h) => (t >= h ? Math.max(m, Math.exp(-(t - h) * 12)) : m), 0);

  /* ---- the camera: slow, never stops ---- */

  let aim: V3 = [0, 1.72, 0]; let dist = 12.2; let el = 7;
  const toward = (p: number, a: V3, d: number, e: number) => { aim = lerp3(aim, a, p); dist = lerp(dist, d, p); el = lerp(el, e, p); };
  const tipNow = crackTip ?? glass.point(0.9);
  toward(prog(line('a3').s, line('a3').s + 1), [0, 1.86, 0], 12.6, 5);
  toward(prog(line('a4').s - 0.2, line('a4').s + 0.9, ease.inOut), [0.12, 1.66, 0], 10, 5);
  toward(prog(line('a7').s - 0.2, line('a7').s + 0.8, ease.inOut), [-0.5, 1.24, 0.4], 10.8, 11);
  toward(prog(line('a8').s - 0.2, line('a8').s + 0.5, ease.inOut), [0, 1.38, 0], 8.4, 6);
  toward(prog(line('a9').s - 0.2, line('a9').s + 1, ease.inOut), [0.62, 2.92, 0], 6.2, 3);
  toward(prog(a10.s - 0.1, a10.s + 0.8, ease.inOut), [tipNow[0] * 0.8, tipNow[1] + REST[1] - 0.1, 0], 6.8, 3);
  toward(prog(T.powder - 0.5, T.powder + 0.12, ease.out), [0, 1.55, 0], 12.8, 9);
  toward(prog(T.prince, T.hold, ease.inOut), [0.05, 1.58, 0], 10.4, 6);
  const az = -19 + t * 0.62 + Math.sin(t * 0.31) * 2.2 + Math.sin(prog(line('a9').s, T.powder, ease.inOut) * Math.PI) * 24;
  const target: V3 = [aim[0], aim[1] + s.aim, aim[2]];
  const orbitPos = orbit(target, dist * s.dist, az, el + s.lift);
  const cam: V3 = [orbitPos[0] + shake * 0.7, orbitPos[1] + shake, orbitPos[2]];
  const toScreen = projector(cam, target, s.fov);
  const world = (u: number, side = 0): V3 => { const p = glass.point(u); return [p[0] + side, p[1] + REST[1] + dy, 0]; };

  /* ---- water ---- */

  const ripples = useMemo(() => {
    const r = rng(7); const list: Ripple[] = [];
    for (let k = 0; k < 40; k++) list.push({ t0: k * 1.55, x: 0, z: 0, amp: 0.012, decay: 0.7, wave: 0.32 });
    for (const h of [T.hit1, T.hit2, T.hit3]) list.push({ t0: h, x: 0, z: 0, amp: 0.05, decay: 1.1, wave: 0.28, speed: 3 });
    list.push({ t0: T.water, x: 0, z: 0, amp: 0.2, decay: 0.55, wave: 0.46, speed: 2.8 }, { t0: T.water + 0.4, x: 0, z: 0, amp: 0.08, decay: 0.7, wave: 0.3, speed: 2.2 });
    for (const h of [T.three, T.elephants, T.dime]) list.push({ t0: h, x: 0, z: 0, amp: 0.02, decay: 1.2, wave: 0.22, speed: 3 });
    list.push({ t0: T.powder, x: 0, z: 0, amp: 0.2, decay: 0.6, wave: 0.42, speed: 3 });
    for (let k = 0; k < 26; k++) list.push({ t0: T.powder + 0.35 + r() * 4.4, x: (r() - 0.5) * 2.4, z: (r() - 0.5) * 2.4, amp: 0.012 + r() * 0.012, decay: 1.1, wave: 0.17, speed: 1.5 });
    return list;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const live = ripples.filter((r) => t > r.t0 && t - r.t0 < 7);

  /* ---- dust: every grain is a piece of the drop, and goes back to where it came from ---- */

  const gravity = floats ? 0.25 : 2.1; const drag = 2.1;
  const figure = (i: number) => {
    const d = dust[i]!; const born = bornAt(d.s); const hidden = { x: 0, z: 0, lift: -50, scale: 0 };
    if (t < born) return hidden;
    const age = t - born; const fly = (1 - Math.exp(-drag * age)) / drag; const spread = d.s < 0.34 ? 1 : 0.5;
    let x = d.at[0] + d.v[0] * fly * spread, y = d.at[1] + REST[1] + d.v[1] * fly * spread - 0.5 * gravity * age * age * 0.42, z = d.at[2] + d.v[2] * fly * spread;
    const floor = floats ? -30 : x * x + z * z < 7.2 ? 0.16 + d.floor * 0.05 : -3.3 + d.floor * 0.05;
    y = Math.max(y, floor);
    // Back together: head first, tail last. Each grain arcs home and goes out as the glass grows over it.
    const home = T.prince + (T.hold - T.prince - 1.5) * (0.5 * d.s + 0.5 * d.roll); const g = prog(home, home + 1.5, ease.inOut);
    if (g >= 1) return hidden;
    if (g > 0) { const h: V3 = [d.at[0], d.at[1] + REST[1], d.at[2]]; x = lerp(x, h[0], g); y = lerp(y, h[1], g) + Math.sin(g * Math.PI) * (0.5 + d.roll * 0.9); z = lerp(z, h[2], g); }
    return { x, z, lift: y, scale: d.scale * (1 - g * 0.35), rot: [d.rot[0] + t * d.spin * (y > floor + 0.01 || g > 0 ? 1 : 0), d.rot[1], d.rot[2]] as V3, color: d.roll > 0.72 ? c.accent : d.roll > 0.45 ? '#ffffff' : '#BFC7CC' };
  };

  // Elephants land on their words and leave when the hammer comes back.
  const eDrop: [number, number, number] = [prog(T.three - 0.18, T.three + 0.05, ease.in), prog(T.three + 0.1, T.three + 0.33, ease.in), prog(T.elephants - 0.1, T.elephants + 0.13, ease.in)];
  const eGone = prog(line('a8').s - 0.25, line('a8').s + 0.25, ease.in);

  // Tweezers close on the tail, and take the very tip away with them.
  const tipW = glass.point(0.965);
  const tweezersIn = prog(T.tail, T.snap - 0.25, ease.out) * (1 - prog(T.fingers + 0.15, T.fingers + 0.7, ease.in));
  const tweezersGap = lerp(0.2, 0.012, prog(T.snap - 0.25, T.snap - 0.02, ease.in));
  const tweezersTilt = 0.16 + prog(T.snap, T.snap + 0.1) * 0.3;
  const tweezersAt: V3 = [tipW[0] + (1 - tweezersIn) * 3.2, tipW[1] + REST[1] + (1 - tweezersIn) * 0.9 + prog(T.snap, T.snap + 0.2) * 0.1, 0];

  /* ---- the number ---- */

  const run = (a: number, b: number, from: number, to: number) => lerp(from, to, prog(a, b, ease.out));
  const cur = current(); let since = cur.s; let r: HeroReadout = { value: '1', label: 'drop of glass' }; let sub: string | undefined;
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  if (cur.id === 'a2') { const said = t >= T.hit2; r = said ? { value: '0', label: 'cracks' } : { value: '1', label: 'drop of glass' }; since = said ? T.hit2 : cur.s; }
  if (cur.id === 'a3') { r = { value: fmt(lerp(20, 900, prog(T.melted - 0.1, T.water, ease.inOut))), unit: '°C', label: 'glass you can shape', hot: true }; }
  if (cur.id === 'a4') { r = { value: fmt(run(T.freezes, T.skin + 0.2, 0, 10)), unit: '%', label: 'of the way across is skin' }; sub = 'FACE HOT, SKIN SOLID'; }
  if (cur.id === 'a5') { r = { value: fmt(lerp(900, 300, prog(T.hot, T.shrink + 0.6, ease.inOut))), unit: '°C', label: 'inside, cooling', hot: true }; }
  if (cur.id === 'a6') { r = { value: fmt(run(cur.s, T.pulling + 0.4, 0, 400)), unit: 'MPa', label: 'squeeze on the skin' }; }
  if (cur.id === 'a7') { const said = t >= T.three; r = said ? { value: '3', label: 'elephants on a dime' } : { value: fmt(run(cur.s, T.three - 0.1, 400, 700)), unit: 'MPa', label: 'at its tightest', hot: true }; since = said ? T.three : cur.s; sub = said ? '700 MPa x 2.5 cm² = 18 t' : undefined; }
  if (cur.id === 'a8') { r = { value: '0', label: 'cracks get in' }; }
  if (cur.id === 'a9') { r = { value: fmt(lerp(15, 3, prog(T.tail, at('thin') + 0.3, ease.inOut))), unit: 'mm', label: t < at('thin') ? 'the fat end' : 'the tail, at most' }; }
  if (cur.id === 'a10') { r = { value: fmt(((kept - 0.34) / 0.66) * 100), unit: '%', label: 'of the tail left', hot: true }; since = cur.s; }
  if (cur.id === 'a11') { r = { value: run(cur.s, T.mile + 0.3, 0, 1.1).toFixed(1), unit: 'mi/s', label: 'crack speed', hot: true }; sub = 'OVER 4,000 MPH'; }
  if (cur.id === 'a12') { const said = t >= T.powder; r = said ? { value: '0', label: 'drops left' } : { value: '1', label: 'drop left', hot: true }; since = said ? T.powder : cur.s; }
  if (cur.id === 'a13') { r = { value: String(Math.round(run(cur.s, T.y1660, 1600, 1660))), label: 'a prince lands in england' }; since = T.y1660; }
  if (cur.id === 'a14') { r = { value: String(Math.round(run(cur.s, T.y2017, 1660, 2017))), label: 'the riddle, solved' }; since = T.y2017; }
  if (cur.id === 'a15') { r = { value: '1', label: 'drop of glass' }; }
  const impacts = [T.hit1, T.hit2, T.water, T.three, T.elephants, T.dime, T.hit3, T.snap, T.powder, T.fat];
  const stages = [{ name: 'Hammer', note: 'no effect' }, { name: 'Melt', note: 'poured, plunged' }, { name: 'Skin', note: 'outside first' }, { name: 'Squeeze', note: 'inside pulling' }, { name: 'Tail', note: 'the way in' }, { name: 'Powder', note: 'all at once' }];
  const stageIs = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15'].indexOf(cur.id);
  const stage = [0, 0, 1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5][Math.max(0, stageIs)]!;

  const heatColor = s.hot;
  const reheat = heat + coreHeat * 0.55;
  const isWhole = open <= 0.001;
  const glassMat = (extra = 0) => <meshPhysicalMaterial color="#ffffff" roughness={0.02} metalness={0} transmission={1} ior={1.5} thickness={0.6} attenuationColor="#fff6e6" attenuationDistance={9} specularIntensity={1} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.7 + extra} />;
  const ringsKept = glass.ringAt(kept); const drawn = ringsKept * glass.around * 6;
  glass.whole.setDrawRange(0, drawn); glass.back.setDrawRange(0, drawn); glass.front.setDrawRange(0, drawn); core.whole.setDrawRange(0, core.ringAt(Math.min(kept, 0.4)) * core.around * 6); // the thin tail has long since cooled
  const headW = world(HEAD / glass.length);
  const sparkFrom = (_k: number): V3 => [headW[0] - 0.43, headW[1] + 0.3, 0.12];

  return (
    <>
      <HeroWorld pos={cam} target={target} t={t} ripples={live} heat={reheat} heatAt={[headW[0], headW[1] + 0.2, 0.9]} heatColor={heatColor} flash={flash + hitFlash * 0.12}>
        <Cradle metal={s.metal} height={cradle} />

        <group position={[REST[0], REST[1] + dy, REST[2]]} rotation={[0, 0, Math.sin(t * 0.8) * 0.006 + heat * Math.sin(t * 4.2) * 0.02 + (t > T.snap && t < T.powder ? Math.exp(-(t - T.snap) * 0.9) * Math.sin((t - T.snap) * 17) * 0.05 + Math.sin(t * 29) * 0.004 : 0)]}>
          {kept > 0.001 && isWhole ? <mesh geometry={glass.whole} castShadow>{glassMat()}</mesh> : null}
          {kept > 0.001 && isWhole ? <><EdgeLight geometry={glass.whole} color="#FFE9C4" opacity={0.9 * (1 - heat)} power={1.9} /><EdgeLight geometry={glass.whole} color="#E8B878" opacity={0.3 * (1 - heat)} power={0.55} /></> : null}
          {kept > 0.001 && isWhole && coreHeat > 0.01 ? <group position={[0, HEAD, 0]} scale={coreSize}><group position={[0, -HEAD, 0]}><HotBody geometry={core.whole} heat={coreHeat * (0.78 + 0.14 * Math.sin(t * 7) + 0.06 * Math.sin(t * 17))} color={heatColor} additive xray opacity={0.86} /></group></group> : null}
          {kept > 0.001 && isWhole && heat > 0.01 ? <HotBody geometry={glass.whole} heat={heat} color={heatColor} additive opacity={heat} /> : null}
          {kept > 0.001 && !isWhole ? (<>
            <mesh geometry={glass.back} castShadow>{glassMat(0.4)}</mesh>
            <EdgeLight geometry={glass.back} color="#FFE9C4" opacity={0.7} power={1.9} />
            <SectionFace geometry={glass.section} t={t} pull={pull} hot={coreHeat} kept={kept} skin={c.accent} core={s.stage === 'room' ? '#233B3A' : '#3A2412'} flow={c.accent2} hotColor={s.hot} />
            <group position={[open * 2.4, open * 1, open * 4.6]} rotation={[0, -open * 1.1, 0]}>
              <mesh geometry={glass.front}>{glassMat(0.2)}</mesh>
            </group>
          </>) : null}
          {arcs.map((g, k) => { const p = prog(T.hit3 + k * 0.012, T.hit3 + 0.16 + k * 0.03, ease.out); const fade = 1 - prog(T.hit3 + 0.65, T.hit3 + 1.5); g.setDrawRange(0, Math.floor(p * (g.index?.count ?? 0))); return t > T.hit3 && fade > 0 ? <mesh key={k} geometry={g}><meshBasicMaterial color={c.accent} transparent opacity={fade} toneMapped={false} /></mesh> : null; })}
        </group>

        {hammerOn && inOut > 0.001 ? <Hammer angle={hammerAngle} pivot={hammerPivot} metal={s.metal} /> : null}
        {tweezersIn > 0.001 ? <Tweezers at={tweezersAt} gap={tweezersGap} tilt={tweezersTilt} metal={s.metal} /> : null}

        <Crowd count={DUST} figure={figure} geometry={shard} castShadow={false} metalness={0.25} roughness={0.14} />

        {/* The glow is a sprite so the whole frame feels the heat, and the crack is the only bright thing inside the tail. */}
        <Glow at={[headW[0], headW[1], 0.6]} size={5.4} color={heatColor} opacity={heat * 0.82 + coreHeat * 0.28} />
        <Glow at={[headW[0], headW[1], 0.6]} size={9 + flash * 7} color="#fff1cf" opacity={flash * 1} />
        {hits.map((h, k) => { const a = t - h; return a > 0 && a < 0.6 ? <Glow key={k} at={sparkFrom(k)} size={1.5 + a * 2.2} color="#fff0c9" opacity={Math.exp(-a * 10) * 0.95} /> : null; })}
        {crackTip ? <Glow at={[crackTip[0], crackTip[1] + REST[1], 0.05]} size={(1.1 + prog(a11.s, a11.e) * 1.4) * (1 + Math.sin(t * 41) * 0.16 + Math.sin(t * 23) * 0.12)} color="#fff0d0" opacity={0.95} /> : null}
        {t > T.snap && t < T.snap + 0.5 ? <Glow at={[tipW[0], tipW[1] + REST[1], 0.05]} size={1.1} color="#fff4dd" opacity={Math.exp(-(t - T.snap) * 8)} /> : null}

        {/* Steam off the plunge. */}
        <Puffs count={46} puff={(i) => { const r2 = (i * 0.618) % 1, r3 = (i * 0.417) % 1; const b = T.water + r2 * 0.9; const a = t - b; if (a < 0 || a > 2.8) return null; const p = a / 2.8; return { x: Math.cos(i * 2.4) * (0.5 + r3 * 0.9) * (1 + p), y: 0.3 + p * (2.2 + r3 * 1.6), z: Math.sin(i * 2.4) * (0.5 + r3 * 0.9) * (1 + p), size: 0.55 + p * 1.25, alpha: 0.11 * Math.sin(Math.min(1, p * 1.2) * Math.PI), rot: i + t * 0.3, color: '#E6DED0' }; }} />
        {/* Sparks off the hammer, embers off the melt. */}
        <Puffs count={72} additive hard={0.6} puff={(i) => { const k = i % 3; const h = hits[k]!; const a = t - h; if (a < 0 || a > 0.75) return null; const an = (i * 2.399) % 6.283; const sp = 1.2 + ((i * 0.37) % 1) * 3; const o = sparkFrom(k); return { x: o[0] + Math.cos(an) * sp * a, y: o[1] + Math.abs(Math.sin(an)) * sp * a * 0.9 - 4 * a * a, z: o[2] + Math.sin(an * 1.7) * sp * a * 0.5, size: 0.05 + ((i * 0.13) % 1) * 0.05, alpha: 1 - a / 0.75, color: '#FFD78A' }; }} />
        <Puffs count={44} additive hard={0.5} puff={(i) => { const seed = (i * 0.731) % 1; const life = 1.6 + seed; const a = (t + seed * 7) % life; if (Math.max(heat, coreHeat * 0.7) < 0.05) return null; const p = a / life; const an = i * 2.4; return { x: headW[0] + Math.cos(an) * (0.6 + p * 0.5), y: headW[1] - 0.2 + p * 3.2, z: Math.sin(an) * (0.6 + p * 0.5), size: 0.03 + seed * 0.05, alpha: heat * (1 - p), color: '#FFA24D' }; }} />
      </HeroWorld>

      <ElephantsOnADime drop={eDrop} gone={eGone} dime={prog(T.dime - 0.05, T.dime + 0.2, ease.back)} ink="#1A1208" fill={c.accent} />
      <TopFade />
      <CaptionFade />
      <HeroNumber r={r} since={since} impacts={impacts} sub={sub} />
      {s.tracker ? <StageTracker stages={stages} current={stage} /> : null}

      {s.labels === 'all' && open > 0.5 ? <Leader at={T.skin + 0.3} until={line('a5').s + 0.2} from={toScreen([headW[0] - HEAD * 0.9, headW[1], 0])} to={[80, 760]}>Skin</Leader> : null}
      {s.labels === 'all' ? <Leader at={T.hot} until={T.pulling - 0.2} from={toScreen([headW[0] + 0.14, headW[1], 0])} to={[1000, 720]} align="right" hot>Core: still hot</Leader> : null}
      {s.labels === 'all' ? <Leader at={T.pulling - 0.2} until={line('a7').e} from={toScreen([headW[0] + 0.3, headW[1] + 0.1, 0])} to={[1000, 720]} align="right" hot>Pulling inward</Leader> : null}
      <Leader at={T.tail} until={T.snap + 0.4} from={toScreen(world(0.8))} to={[90, 1010]}>The tail</Leader>
      {crackTip && t > T.inside - 0.6 ? <Leader at={T.inside - 0.6} until={T.powder - 0.05} from={toScreen([crackTip[0], crackTip[1] + REST[1], 0])} to={[90, 1120]} hot>Crack</Leader> : null}
      <Leader at={T.fat} from={toScreen([headW[0] - HEAD * 0.7, headW[1] - 0.1, 0])} to={[90, 1250]} hot>Here</Leader>

      <AbsoluteFill style={{ background: '#fff4dc', opacity: flash * 0.72, zIndex: 35, pointerEvents: 'none', mixBlendMode: 'screen' }} />
      <Captions />
      <Vignette />
      <Grain />
    </>
  );
}
