import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { Grain, rng, useFilm, Vignette } from '@pack/kit';
import { Scene3D, SoftDay, lerp3, type V3 } from '@pack/kit/three';
import { BoxPerson, Bx, Column, Drift, Globe, MoonBall, ReadLine, Readout, Scrim, Sky, Spoken, Town, fmtLen, townPlan, useLadder, useMouth, type BoxLook, type BoxPose, type Rung } from '@pack/kit/formats/runaway';

// The hero: one sheet of ordinary paper, 0.1 mm thick, folded. The picture cheats on its width so we can see it (SOURCES.md says so).
const SHEET = 0.0001;
const metres = (step: number) => SHEET * 2 ** step;
const NOTE = { w: 0.34, d: 0.25 };

const LEO: BoxLook = { skin: '#D09A72', top: '#D5533C', legs: '#2F4763', hair: '#2A1C18', hairStyle: 'short', kid: true };
const IVY: BoxLook = { skin: '#9A6646', top: '#EDBB3F', legs: '#3E3A5A', hair: '#1B1413', hairStyle: 'long', kid: true };
const AVA: BoxLook = { skin: '#E6B48C', top: '#3A7CC2', legs: '#5A4632', hair: '#6B3A1F', hairStyle: 'long', kid: true };
const BEN: BoxLook = { skin: '#EBC6A3', top: '#3E8E7E', legs: '#57483A', hair: '#A8682F', hairStyle: 'short', kid: true, glasses: true };
const IDA: BoxLook = { skin: '#AE7650', top: '#7B6CC4', legs: '#44506B', hair: '#20171A', hairStyle: 'bun', kid: true };
const TEACHER: BoxLook = { skin: '#BD8259', top: '#5E4A8E', legs: '#2B2B36', hair: '#3A2A26', hairStyle: 'bun', glasses: true, collar: '#F3EBDD' };
const SIR: BoxLook = { skin: '#E1B18F', top: '#6E7F5A', legs: '#3B3530', hair: '#6B6A66', hairStyle: 'short', collar: '#F3EBDD' };
const CARETAKER: BoxLook = { skin: '#D3A27C', top: '#3E5C76', legs: '#36434F', hairStyle: 'peak', peak: '#D98E2B' };
const REPORTER: BoxLook = { skin: '#A36E4B', top: '#C7323E', legs: '#2C2C38', hair: '#2A1A14', hairStyle: 'long', collar: '#F7F2E4' };
const PILOT: BoxLook = { skin: '#E3B896', top: '#27384F', legs: '#27384F', hairStyle: 'peak', peak: '#22344E', collar: '#F7F2E4' };
const ASTRONAUT: BoxLook = { skin: '#BE8C66', top: '#EDEAE0', legs: '#EDEAE0', hair: '#2A1C18', hairStyle: 'helmet', shoe: '#C9C5BA' };

// ---------- the sets

function Desk({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Bx s={[1.7, 0.07, 0.72]} p={[0, 0.72, 0]} c="#E0B67A" round={0.02} />
      {[-1, 1].map((x) => [-1, 1].map((z) => <Bx key={`${x}${z}`} s={[0.06, 0.7, 0.06]} p={[x * 0.78, 0.35, z * 0.28]} c="#34333F" />))}
    </group>
  );
}
function Chair({ p }: { p: V3 }) {
  return <group position={p}><Bx s={[0.44, 0.05, 0.42]} p={[0, 0.4, 0]} c="#B4553A" round={0.015} /><Bx s={[0.44, 0.4, 0.05]} p={[0, 0.72, 0.2]} c="#B4553A" round={0.015} /></group>;
}
/** The room everything starts in. x is -5..5, z is -4 (the board) to 5 (the pinboard), the ceiling is at y=3.1. */
function Classroom({ wall = '#2F7F86', dado = '#F0E2BF', floor = '#CFA36A', board = true, hole = false }: { wall?: string; dado?: string; floor?: string; board?: boolean; hole?: boolean }) {
  const r = rng(6); const tiles = [[-3.25, -1.4, 3.5, 5.2], [3.25, -1.4, 3.5, 5.2], [-3.25, 3.3, 3.5, 3.4], [3.25, 3.3, 3.5, 3.4], [0, -2.6, 3.1, 2.8], [0, 3.6, 3.1, 2.8]];
  return (
    <group>
      <Bx s={[10, 0.1, 9]} p={[0, -0.05, 0.5]} c={floor} cast={false} rough={0.8} />
      {Array.from({ length: 9 }).map((_, i) => <Bx key={i} s={[10, 0.002, 0.012]} p={[0, 0.002, -3.5 + i]} c="#8F6B3F" cast={false} />)}
      {[-4, 5].map((z) => (<group key={z}><Bx s={[10, 2.2, 0.2]} p={[0, 2.0, z]} c={wall} cast={false} /><Bx s={[10, 0.9, 0.22]} p={[0, 0.45, z]} c={dado} cast={false} /></group>))}
      {[-5, 5].map((x) => (<group key={x}><Bx s={[0.2, 2.2, 9]} p={[x, 2.0, 0.5]} c={wall} cast={false} /><Bx s={[0.22, 0.9, 9]} p={[x, 0.45, 0.5]} c={dado} cast={false} /></group>))}
      {hole ? <>{tiles.map(([x, z, w, d], i) => <Bx key={i} s={[w!, 0.12, d!]} p={[x!, 3.14, z!]} c="#F3ECDC" cast={false} />)}<Bx s={[10, 0.1, 9]} p={[0, 3.9, 0.5]} c="#C7E8F6" glow={1.1} cast={false} /></> : <Bx s={[10, 0.12, 9]} p={[0, 3.14, 0.5]} c="#F3ECDC" cast={false} />}
      {[[-2, -1], [2, -1], [-2, 2.5], [2, 2.5]].map(([x, z], i) => <Bx key={i} s={[1.2, 0.06, 0.3]} p={[x!, 3.05, z!]} c="#FFF6D8" glow={1.4} cast={false} />)}
      {[-2, 1, 4].map((z) => (<group key={z}><Bx s={[0.05, 1.5, 1.9]} p={[-4.88, 1.9, z - 0.3]} c="#BFE3F2" glow={0.9} cast={false} />{[-0.95, 0, 0.95].map((o) => <Bx key={o} s={[0.07, 1.6, 0.06]} p={[-4.86, 1.9, z - 0.3 + o]} c="#F6EFE0" cast={false} />)}<Bx s={[0.07, 0.06, 1.95]} p={[-4.86, 1.9, z - 0.3]} c="#F6EFE0" cast={false} /></group>))}
      {board ? (<group position={[0, 1.75, -3.86]}>
        <Bx s={[5.6, 1.5, 0.05]} c="#1F4F40" cast={false} rough={0.9} />
        <Bx s={[5.8, 0.08, 0.1]} p={[0, -0.78, 0.04]} c="#B98A55" />
        {[0.1, 0.2, 0.4, 0.8, 1.6].map((w, i) => <Bx key={i} s={[w, 0.05, 0.01]} p={[-2.3 + w / 2, 0.5 - i * 0.2, 0.03]} c="#E7EFE6" cast={false} glow={0.2} />)}
      </group>) : null}
      <group position={[0, 1.8, 4.87]}>
        <Bx s={[5.4, 1.15, 0.04]} c="#C49A63" cast={false} />
        {Array.from({ length: 12 }).map((_, i) => { const w = 0.3 + r() * 0.28; const h = 0.28 + r() * 0.2; const col = ['#FFF6E2', '#F4B942', '#EE7B64', '#8FD1C2', '#FFF6E2'][i % 5]!; return <Bx key={i} s={[w, h, 0.012]} p={[-2.2 + (i % 6) * 0.88 + (r() - 0.5) * 0.1, (i < 6 ? 0.27 : -0.27) + (r() - 0.5) * 0.06, -0.03]} r={[0, 0, (r() - 0.5) * 0.14]} c={col} cast={false} />; })}
      </group>
    </group>
  );
}
/** The middle of the room, seen from the board: Leo and Ben's desk, Ivy and Ida behind. */
function Row({ leo, ben, hold }: { leo?: BoxPose; ben?: BoxPose; hold?: ReactNode }) {
  const { t } = useFilm();
  return (<>
    <Desk p={[0, 0, 0.72]} />
    <Chair p={[0.42, 0, 1.3]} /><Chair p={[-0.42, 0, 1.3]} />
    <BoxPerson who={LEO} p={[0.42, 0, 1.25]} ry={Math.PI} scale={0.8} pose={{ sit: 1, ...leo }} holdL={hold} />
    <BoxPerson who={BEN} p={[-0.42, 0, 1.25]} ry={Math.PI} scale={0.8} pose={{ sit: 1, ...ben }} />
    <Desk p={[0, 0, 3.1]} />
    <BoxPerson who={IDA} p={[0.75, 0, 3.7]} ry={Math.PI} scale={0.8} pose={{ sit: 1, headYaw: Math.sin(t * 0.7) * 0.2 }} />
    <BoxPerson who={IVY} p={[-0.8, 0, 3.7]} ry={Math.PI} scale={0.8} pose={{ sit: 1, headPitch: 0.1, headYaw: Math.sin(t * 0.5) * 0.1 }} />
  </>);
}
/** Debris round the place the note came through. */
function Rubble({ r: R = 0.9, n = 26, seed = 7, c = '#CDBB99' }: { r?: number; n?: number; seed?: number; c?: string }) {
  const r = rng(seed);
  return <>{Array.from({ length: n }).map((_, i) => { const a = r() * 6.28; const d = R * (0.35 + r()); const s = 0.05 + r() * 0.14; return <Bx key={i} s={[s, s * 0.45, s * 0.8]} p={[Math.cos(a) * d, s * 0.2, Math.sin(a) * d]} r={[r() * 0.4, r() * 6, r() * 0.4]} c={c} round={0.01} />; })}</>;
}
function School({ p = [0, 0, 0] }: { p?: V3 }) {
  return (
    <group position={p}>
      <Bx s={[34, 9, 16]} p={[0, 4.5, 0]} c="#BE6A49" />
      <Bx s={[34.6, 0.5, 16.6]} p={[0, 9.2, 0]} c="#7E4B3A" />
      {[1.8, 4.5, 7.2].map((y) => Array.from({ length: 11 }).map((_, i) => <Bx key={`${y}${i}`} s={[1.8, 1.5, 0.08]} p={[-15 + i * 3, y, 8.02]} c="#CFEAF4" glow={0.3} cast={false} />))}
      <Bx s={[4.2, 3.2, 0.2]} p={[0, 1.6, 8.05]} c="#2F4763" />
      <Bx s={[6, 0.4, 2.5]} p={[0, 3.4, 9.2]} c="#E9DAB7" />
    </group>
  );
}
const trees = (seed: number, n: number, spread: number, skip = 20) => { const r = rng(seed); return Array.from({ length: n }, () => { const x = (r() - 0.5) * spread; const z = (r() - 0.5) * spread; return { x: Math.abs(x) < skip && Math.abs(z) < skip ? x + skip * Math.sign(x || 1) * 2 : x, z, s: 1.6 + r() * 2.2 }; }); };

// The note's edge-on question, pencilled where the space station can read it. Not on the film's other shots.
function Pencil({ big = false }: { big?: boolean }) {
  const { at, look, prog, line } = useFilm(); const on = big ? 1 : prog(line('l12').s, line('l12').s + 0.35); const near = prog(at('Yes', 1, 'l12'), line('l12').e + 1, (x) => x);
  if (big) return (
    <div style={{ position: 'absolute', left: 70, top: 930, width: 940, zIndex: 25, transform: `rotate(-4deg) scale(${0.9 + near * 0.22})`, transformOrigin: '30% 40%', color: '#262C3E', fontFamily: look.fonts.display, fontStyle: 'italic', fontWeight: 500 }}>
      <div style={{ fontSize: 148, lineHeight: 1.02 }}>Do you like me?</div>
      <div style={{ fontSize: 118, marginTop: 44 }}>☐ Yes &nbsp;☐ No</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 806, top: 1010, width: 262, zIndex: 25, opacity: on, transform: 'rotate(-3deg)', color: '#262C3E', fontFamily: look.fonts.display, fontStyle: 'italic', fontWeight: 500 }}>
      <div style={{ fontSize: 62, lineHeight: 1.02 }}>Do you like me?</div>
      <div style={{ fontSize: 52, marginTop: 20, lineHeight: 1.14 }}>☐ Yes<br />☐ No</div>
    </div>
  );
}
function Front() {
  const { look, prog, t } = useFilm();
  return <div style={{ position: 'absolute', left: 360, top: 980, zIndex: 25, transform: `rotate(-5deg) scale(${1 + Math.sin(t) * 0.01})`, color: '#262C3E', fontFamily: look.fonts.display, fontStyle: 'italic', fontWeight: 500, fontSize: 176, lineHeight: 1, opacity: prog(0, 0.01) }}>To Ivy</div>;
}
const towards = (x: number, y: number, z: number) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());

// ---------- the film

export default function Scenes() {
  const { at, line, t, look, prog, ease } = useFilm();
  const c = look.color; const mouth = useMouth();
  const plans = useMemo(() => ({
    roofTown: townPlan({ seed: 9, across: 10, street: 24, block: 18, low: 6, high: 22, clear: 1, palette: ['#D8B98E', '#C97B5A', '#E7DCC3', '#8FAFB5', '#B9A28C', '#D2694F'] }),
    town: townPlan({ seed: 14, across: 12, street: 26, block: 20, low: 7, high: 34, clear: 1, palette: ['#D8B98E', '#C97B5A', '#E7DCC3', '#8FAFB5', '#B9A28C', '#D2694F'] }),
    city: townPlan({ seed: 31, across: 22, street: 90, block: 62, low: 18, high: 240, clear: 1, palette: ['#B7C2CC', '#D8CDB8', '#9FB1BF', '#C9A98B', '#E5DCC8', '#8DA0B0'] }),
    behindSchool: townPlan({ seed: 9, across: 10, street: 24, block: 18, low: 6, high: 22, clear: 0, palette: ['#D8B98E', '#C97B5A', '#E7DCC3', '#8FAFB5', '#B9A28C', '#D2694F'] }).map((b) => ({ ...b, z: b.z - 130 })).filter((b) => Math.abs(b.x) < 150 && b.z < -30),
    trees: trees(5, 46, 130),
  }), []);
  // The ladder. Each rung is a shot: it starts on a spoken word and ends on a fold. Facts in `compare` and `read` are in SOURCES.md.
  const rungs: Rung[] = [
    { id: 'hook', from: 0, step: 0 },
    { id: 'desk', from: line('l1').e + 0.5, step: 1, read: 'Leo folds it so nobody will see it.' },
    { id: 'teacher', from: line('l2').s - 1.0, step: 3, read: 'Every fold doubles its thickness. So he folds it again.', compare: 'a stack of eight sheets' },
    { id: 'macro', from: line('l3').s - 1.1, step: 7, read: 'Fold seven. Ordinary paper starts to refuse about here.', compare: 'about a thumb' },
    { id: 'sandwich', from: line('l4').s - 1.0, step: 11, read: 'Fold eleven. It has stopped being subtle.', compare: 'a loaf of bread' },
    { id: 'board', from: line('l5').s - 1.1, step: 14, read: 'The real world record is twelve folds. Leo is on fourteen.', compare: 'a grown-up' },
    { id: 'upstairs', from: line('l6').s - 1.1, step: 16, read: 'Fold sixteen. That was the ceiling.', compare: 'two floors' },
    { id: 'school', from: line('l6').e + 0.9, step: 17, read: 'Fold seventeen. That was the roof.', compare: 'four floors' },
    { id: 'roof', from: line('l7').s - 0.7, step: 18, compare: 'about eight floors' },
    { id: 'town', from: line('l7').e + 0.9, step: 19, read: 'Fold nineteen. Now it is a landmark.' },
    { id: 'news', from: line('l8').s - 0.9, step: 20, read: 'Fold twenty. Every channel has read the front.', compare: 'past the Statue of Liberty' },
    { id: 'front', from: at('addressed') - 0.05, step: 20, read: 'Fold twenty. Every channel has read the front.', compare: 'past the Statue of Liberty' },
    { id: 'news2', from: at('called') - 0.1, step: 20, read: 'Fold twenty. Every channel has read the front.', compare: 'past the Statue of Liberty' },
    { id: 'ivy', from: line('l9').s - 0.25, step: 20, read: 'He could stop now.', compare: 'past the Statue of Liberty' },
    { id: 'no', from: line('l10').s - 0.1, step: 21, read: 'He folds it again.', foldFrom: line('l10').e + 0.25 },
    { id: 'skyline', from: line('l10').e + 1.25, step: 23, read: 'Fold twenty-three. Taller than any building ever built.', compare: 'past the tallest building on Earth' },
    { id: 'cockpit', from: line('l11').s - 1.2, step: 27, read: 'Fold twenty-seven. Airliners now have to go around it.', compare: 'above the airliners' },
    { id: 'plane', from: at('please') - 0.05, step: 27, read: 'Fold twenty-seven. Airliners now have to go around it.', compare: 'above the airliners' },
    { id: 'cockpit2', from: at('It', 1, 'l11') - 0.1, step: 27, read: 'Fold twenty-seven. Airliners now have to go around it.', compare: 'above the airliners' },
    { id: 'edge', from: line('l11').e + 1.0, step: 30, read: 'By one common line, space starts at one hundred kilometres. The note is at one hundred and seven.', compare: 'past the edge of space' },
    { id: 'top', from: line('l11').e + 3.6, step: 31, read: 'By one common line, space starts at one hundred kilometres. The note is at one hundred and seven.', foldFrom: line('l11').e + 4.3 },
    { id: 'station', from: line('l12').s - 1.2, step: 32, read: 'Fold thirty-two. The space station can read it now.', compare: 'past the space station' },
    { id: 'pencil', from: at('Yes', 1, 'l12') - 0.1, step: 32, read: 'Fold thirty-two. The space station can read it now.', compare: 'past the space station' },
    { id: 'earth', from: line('l12').e + 1.0, step: 37, foldTo: line('l12').e + 3.5, read: 'Fold thirty-seven. Longer than Earth is wide.', compare: 'longer than Earth is wide' },
    { id: 'moon', from: line('l12').e + 4.0, step: 42, foldTo: line('l12').e + 6.1, read: 'Fold forty-two. Past the Moon. Half of that was the last fold.', compare: 'past the Moon' },
    { id: 'class', from: line('l13').s - 0.9, step: 42, read: 'Still not delivered.', compare: 'past the Moon' },
    { id: 'end', from: line('l14').s - 0.15, step: 42, compare: 'past the Moon' },
  ];
  const L = useLadder(rungs); const id = L.id; const h = metres(L.stepF); const k = L.local;
  // The camera never rests: it pushes through the shot, with a little hand in it, and jumps when a fold lands.
  const push = (from: V3, to: V3, shake = 0.06): V3 => { const q = lerp3(from, to, Math.min(1.1, k / Math.max(1, L.span)) * 2.1 - 0.55); const size = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]); const hand = size * 0.32; return [q[0] + Math.sin(t * 2.1) * hand + Math.sin(t * 61) * shake * L.pulse, q[1] + Math.sin(t * 1.5 + 1) * hand * 0.6 + Math.sin(t * 47 + 1) * shake * L.pulse, q[2]]; };

  // Each shot: its camera, its sky, its light and what stands in it.
  let pos: V3 = [0, 1, 5]; let target: V3 = [0, 1, 0]; let fov = 38; let sky: [string, string, string?] | null = null; let stars = 0; let fog: [string, number, number] | undefined; let scrim = 0.48; let body: ReactNode = null;
  const indoors = (<><SoftDay intensity={2.0} size={8} keyPos={[-3.5, 9, -7]} /><ambientLight intensity={0.5} color="#FFF1DC" /></>);
  const indoorsBack = (<><SoftDay intensity={2.0} size={8} keyPos={[3, 9, 7]} /><ambientLight intensity={0.5} color="#FFF1DC" /></>);
  let light: ReactNode = indoors;
  const dust = <Drift count={26} box={[4, 2.6, 4]} at={[0, 0.4, 1]} size={0.02} color="#FFF3CF" fall={0.1} />;

  if (id === 'hook' || id === 'desk') {
    pos = push([0.1, 1.28, -3.0], [0.06, 1.28, -2.7]); target = [0, 1.33, 1.2]; fov = 34; scrim = 0.34;
    // The note, held up where you can see it: as small as it will ever be.
    const note = <Bx s={[0.2, 0.14, 0.012]} p={[0.02, 0.98 + Math.sin(t * 3) * 0.008, 0.82]} r={[0, 0, 0.12]} c="#FFFDF4" glow={0.25} />;
    body = (<><Classroom /><Row leo={{ outL: 1.05, armL: 0.5, elbowL: 0.1, talk: mouth('l1'), headYaw: 0.5, twist: 0.2 + Math.sin(t * 1.4) * 0.03, brow: 0.4 }} ben={{ headYaw: -0.45 + Math.sin(t * 2) * 0.05, brow: 0.3, armL: 0.8, elbowL: 0.9 }} />{note}{dust}</>);
  } else if (id === 'teacher') {
    const spin = prog(line('l2').s - 0.5, line('l2').s - 0.1, ease.back);
    pos = push([0.42, 1.3, 1.75], [0.32, 1.32, 1.25]); target = [-0.15, 1.72, -3.6]; fov = 38; light = indoorsBack; scrim = 0.25;
    body = (<><Classroom /><BoxPerson who={TEACHER} p={[-0.25, 0, -3.1]} ry={Math.PI * (1 - spin)} pose={{ armR: 0.9 + spin * 0.8, elbowR: 0.9 - spin * 0.7, talk: mouth('l2'), brow: -0.8 * spin, armL: 0.2, headYaw: 0.1 }} /><Drift count={22} box={[4, 2.6, 3]} at={[0, 0.4, -2]} size={0.02} color="#FFF3CF" fall={0.1} /></>);
  } else if (id === 'macro') {
    // A tenth scale, so the note fills the frame: one unit here is ten centimetres. The standing ruler is real: a tick is a centimetre.
    const tall = h * 10; const lift = Math.sin(k * 5) * 0.012;
    pos = push([1.1, 3.4, 7.0], [0.95, 3.0, 6.2]); target = [0.05, 0.62, 0]; fov = 30; sky = [c.line, '#2A2230']; scrim = 0.5; light = <SoftDay intensity={2.8} size={6} keyPos={[3, 6, 3]} />;
    body = (<>
      <Bx s={[24, 0.4, 24]} p={[0, -0.2, 0]} c="#E0B67A" rough={0.6} cast={false} />
      <Bx s={[1.5, 0.05, 2.1]} p={[1.15, 0.03, -1.3]} r={[0, 0.2, 0]} c="#2F8C87" round={0.015} />
      <group position={[-0.55, 0.06, -1.5]} rotation={[0, 0.5, 0]}><Bx s={[2.2, 0.1, 0.1]} c="#F2C94C" round={0.02} /><Bx s={[0.18, 0.09, 0.09]} p={[1.15, 0, 0]} c="#E88D9D" round={0.02} /></group>
      <Column h={tall + lift} w={0.72} d={0.52} bands={7} />
      <group position={[0.62, 0, -0.42]}><Bx s={[0.5, 1.5, 0.03]} p={[0, 0.75, 0]} c="#F2C94C" />{Array.from({ length: 15 }).map((_, i) => <Bx key={i} s={[i % 5 === 0 ? 0.22 : 0.12, 0.012, 0.004]} p={[-0.13 - (i % 5 === 0 ? 0 : 0.05), 0.1 + i * 0.1, 0.018]} c="#1B1A17" cast={false} />)}</group>
      {[-1, 1].map((s) => <group key={s} position={[s * (0.62 + Math.sin(t * 5 + s) * 0.05), 0.17 + tall * 0.2, 0.05 + Math.sin(t * 4 + s) * 0.05]} rotation={[0, 0, s * -0.1]}><Bx s={[0.42, 0.34, 0.5]} c={LEO.skin} round={0.08} /><Bx s={[0.5, 0.45, 2.2]} p={[s * 0.08, 0.05, 1.5]} c={LEO.top} round={0.06} /></group>)}
    </>);
  } else if (id === 'sandwich') {
    pos = push([0.05, 1.22, -2.35], [0.03, 1.2, -2.1]); target = [0, 1.26, 1.2]; fov = 34; scrim = 0.34;
    body = (<><Classroom /><Row leo={{ armL: 1.3, armR: 1.3, elbowL: 0.35, elbowR: 0.35, outL: 0.5, headYaw: 0.25, brow: 0.5, eyes: 1.15 }} ben={{ headYaw: -0.5, brow: 0.7, eyes: 1.35, talk: mouth('l4'), lean: -0.05 }} /><Column h={h} w={NOTE.w} d={NOTE.d} p={[0.05, 0.755, 0.5]} bands={3.2} />{dust}</>);
  } else if (id === 'board') {
    pos = push([0.95, 1.2, 3.9], [0.85, 1.22, 3.4]); target = [0.55, 1.68, -2.6]; fov = 38; light = indoorsBack; scrim = 0.28;
    body = (<><Classroom /><Column h={h} w={NOTE.w} d={NOTE.d} p={[1.05, 0, 0.5]} bands={3.4} /><BoxPerson who={LEO} p={[0.42, 0, 0.5]} ry={Math.PI + 0.1} scale={0.8} pose={{ lean: -0.08, headYaw: 0.5, armR: 0.5, outR: 0.6, elbowR: 0.6, brow: 0.5 }} /><BoxPerson who={TEACHER} p={[0.72, 0, -3.2]} ry={Math.PI} pose={{ armR: 2.1 + Math.sin(t * 7) * 0.12, elbowR: 0.4, armL: 0.1, talk: mouth('l5'), headYaw: 0.1 }} /><Drift count={24} box={[4, 2.6, 3]} at={[0.6, 0.4, 1]} size={0.02} color="#FFF3CF" fall={0.1} /></>);
  } else if (id === 'upstairs') {
    const up = Math.max(0, h - 3.2) * prog(L.rung.from + 0.1, L.rung.from + 0.5);
    pos = push([-0.1, 1.05, 4.45], [-0.08, 1.02, 4.05]); target = [0.15, 1.72, 0]; fov = 46; scrim = 0.25; light = indoorsBack;
    body = (<><Classroom wall="#C2683F" dado="#F2DFB0" floor="#B8BBA8" board={false} /><group position={[0.7, 0, 0]}><Rubble r={0.8} seed={9} c="#8E8B7A" /><Column h={Math.min(up, 2.95) + 0.02} w={NOTE.w} d={NOTE.d} bands={3.4} /></group><BoxPerson who={IDA} p={[-0.2, 0, -0.9]} ry={1.0} scale={0.8} pose={{ headPitch: -0.35, armR: 0.3 + Math.sin(t * 3) * 0.1, eyes: 1.4, brow: 0.7 }} /><BoxPerson who={SIR} p={[1.5, 0, -1.2]} ry={-0.7} pose={{ armL: 0.4, armR: 0.5, headPitch: -0.3, brow: 0.5 }} /><BoxPerson who={AVA} p={[-0.45, 0, 1.4]} ry={Math.PI - 0.6} scale={0.8} pose={{ talk: mouth('l6'), armL: 1.6, outL: 0.5, elbowL: 0.1, headPitch: -0.12, headYaw: 1.2, eyes: 1.3, brow: 0.6 }} /><Drift count={46} box={[4, 3, 4]} at={[0.6, 0, 0.6]} size={0.04} fall={0.8} /></>);
  } else if (id === 'school') {
    pos = push([-17, 3.2, 48], [-15, 3.4, 44]); target = [2.5, 13.5, 0]; fov = 42; sky = ['#4F9FD8', '#DDF0F4']; scrim = 0.4; light = <SoftDay intensity={2.8} size={60} keyPos={[-30, 50, 40]} />;
    const lift = Math.max(0, h - 9);
    body = (<>
      <Bx s={[900, 0.2, 900]} p={[0, -0.1, 0]} c="#7FA866" cast={false} /><Bx s={[8, 0.1, 80]} p={[0, 0, 40]} c="#C5BFAE" cast={false} />
      <School /><Town plan={plans.behindSchool} />
      <Column h={lift + 9.4} w={1.5} d={1.1} p={[5.5, 0, 0]} bands={1.6} />
      {plans.trees.map((tr, i) => <Bx key={i} s={[tr.s * 1.4, tr.s * 1.4, tr.s * 1.4]} p={[tr.x > 0 ? tr.x + 24 : tr.x - 44, tr.s, Math.abs(tr.z) * 0.2 + 12]} c={i % 3 ? '#4F8F57' : '#6AA65F'} round={tr.s * 0.5} />)}
      <Drift count={40} box={[30, 26, 14]} at={[5, 0, 8]} size={0.3} fall={3} />
    </>);
  } else if (id === 'roof') {
    pos = push([-2.8, 1.5, 8.6], [-2.5, 1.5, 7.8]); target = [-0.2, 2.6, 0]; fov = 40; sky = ['#4F9FD8', '#DDF0F4']; scrim = 0.42; light = <SoftDay intensity={2.8} size={14} />;
    body = (<>
      <group position={[0, -9, 0]}><Town plan={plans.roofTown} /><Bx s={[400, 0.2, 400]} c="#7FA866" cast={false} /></group>
      <Bx s={[26, 0.5, 18]} p={[0, -0.25, 0]} c="#A79F92" cast={false} />
      <Bx s={[26.2, 0.7, 0.3]} p={[0, 0.2, 9]} c="#BE6A49" /><Bx s={[0.3, 0.7, 18]} p={[-13, 0.2, 0]} c="#BE6A49" />
      {[[5, -3], [-6, -4], [8, 3]].map(([x, z], i) => <Bx key={i} s={[1.5, 1, 1.5]} p={[x!, 0.5, z!]} c="#8A8C94" />)}
      <group position={[0.6, 0, 0]}><Rubble r={1.5} n={36} seed={4} c="#7C7267" /><Column h={Math.max(0, h - 9)} w={NOTE.w * 2} d={NOTE.d * 2} bands={2} /></group>
      <BoxPerson who={CARETAKER} p={[-1.7, 0, 3.8]} ry={0.45} pose={{ talk: mouth('l7'), headYaw: -0.45, headPitch: -0.12, armR: 0.15, brow: 0.2, armL: 1.0, elbowL: 1.1 }} holdL={<Bx s={[0.06, 1.7, 0.06]} p={[0, 0.3, 0]} c="#B98A55" />} />
      <Drift count={40} box={[10, 8, 10]} size={0.1} fall={0.9} />
    </>);
  } else if (id === 'town') {
    pos = push([-58, 30, 215], [-52, 32, 195]); target = [8, 50, 0]; fov = 40; sky = ['#4F9FD8', '#E5EFE6']; scrim = 0.42; fog = ['#DDE9E6', 240, 1100]; light = <SoftDay intensity={2.8} size={260} keyPos={[-120, 240, 180]} />;
    body = (<><Bx s={[3000, 0.2, 3000]} p={[0, -0.1, 0]} c="#7E8F72" cast={false} /><Town plan={plans.town} /><Column h={h} w={5} d={3.6} p={[46, 0, 0]} bands={1.4} /><Drift count={40} box={[160, 100, 160]} at={[30, 0, 60]} size={1.2} fall={9} /></>);
  } else if (id === 'front') {
    // Straight up the front of it, past a helicopter.
    pos = push([0.2, 2.2, 13], [0.1, 2.3, 12.2]); target = [-1.4, 34, -20]; fov = 56; sky = ['#2F86CF', '#BFE2F1']; scrim = 0.42; light = <SoftDay intensity={2.7} size={60} keyPos={[-20, 40, 40]} />;
    const flyX = -34 + k * 14;
    body = (<><Bx s={[800, 0.2, 800]} p={[0, -0.1, 0]} c="#6E7078" cast={false} /><Town plan={plans.town} /><Column h={h} w={8} d={5} p={[0, 0, -20]} bands={1.2} /><group position={[flyX, 56 + Math.sin(t * 2) * 1.5, -8]} rotation={[0, 0.5, 0.08]}><Bx s={[4.6, 1.8, 1.8]} c="#E0392B" round={0.6} /><Bx s={[3.6, 0.5, 0.5]} p={[-3.6, 0.3, 0]} c="#E0392B" /><Bx s={[9, 0.12, 0.4]} p={[0, 1.15, 0]} r={[0, t * 28, 0]} c="#20202A" /></group><Drift count={46} box={[34, 60, 20]} at={[0, 0, -6]} size={0.4} fall={4.5} /></>);
  } else if (id === 'news' || id === 'news2') {
    pos = push([-1.2, 1.55, 9.0], [-1.0, 1.58, 8.3]); target = [-0.2, 2.75, 0]; fov = 46; sky = ['#4F9FD8', '#E5EFE6']; scrim = 0.42; light = <SoftDay intensity={2.7} size={40} keyPos={[-20, 40, 30]} />;
    body = (<><Bx s={[800, 0.2, 800]} p={[0, -0.1, 0]} c="#6E7078" cast={false} /><Bx s={[8, 0.1, 800]} c="#54565E" cast={false} /><Town plan={plans.town} /><Column h={h} w={5} d={3.6} p={[6.5, 0, -20]} bands={1.4} /><BoxPerson who={REPORTER} p={[-1.1, 0, 5.0]} ry={0.2} pose={{ talk: mouth('l8'), armR: 1.25, elbowR: 1.2, headYaw: -0.1 + Math.sin(t * 1.3) * 0.08, brow: 0.2, lean: Math.sin(t * 1.1) * 0.03 }} holdR={<Bx s={[0.06, 0.2, 0.06]} p={[0, 0.08, 0.02]} c="#20202A" />} /><Drift count={46} box={[14, 12, 14]} size={0.16} fall={1.1} /></>);
  } else if (id === 'ivy' || id === 'no' || id === 'end') {
    const who = id === 'ivy' ? IVY : LEO;
    pos = push([0.03, 1.06, -1.7], [0.02, 1.05, -1.45]); target = [0, 1.33, 1.2]; fov = 26; scrim = 0.3;
    body = (<><Classroom hole /><BoxPerson who={who} p={[0, 0, 1.2]} ry={Math.PI} scale={0.8} pose={{ sit: 1, talk: mouth('l9', 'l10', 'l14'), headYaw: (id === 'ivy' ? 0.2 : -0.1) + Math.sin(t * 2.3) * 0.07, lean: Math.sin(t * 1.7) * 0.03, brow: id === 'ivy' ? 0.3 : id === 'end' ? 0.9 : -0.3, eyes: id === 'end' ? 1.25 : 1, armL: 0.3, armR: 0.3, headPitch: id === 'end' ? 0.08 : 0 }} /><Bx s={[1.7, 0.07, 0.72]} p={[0, 0.72, 0.55]} c="#E0B67A" round={0.02} /><Drift count={26} box={[3, 2.4, 2]} at={[0, 0.3, 0.6]} size={0.018} color="#FFF3CF" fall={0.14} /></>);
  } else if (id === 'skyline') {
    pos = push([-300, 420, 1660], [-270, 450, 1500]); target = [0, 500, 0]; fov = 42; sky = ['#4C9BD6', '#E9EFE4']; scrim = 0.42; fog = ['#D9E7E6', 1200, 5200]; light = <SoftDay intensity={2.7} size={700} keyPos={[-400, 900, 500]} />;
    const spire = [[64, 0, 300], [46, 300, 220], [30, 520, 180], [12, 700, 128]] as const; // stepped, 828 m to the tip: as tall as the real record holder, no one's in particular
    body = (<><Bx s={[12000, 1, 12000]} c="#8A9A84" cast={false} /><Town plan={plans.city} /><group position={[120, 0, -40]}>{spire.map(([w, y, hh], i) => <Bx key={i} s={[w, hh, w]} p={[0, y + hh / 2, 0]} c="#AEBFCB" />)}</group><Column h={h} w={46} d={34} p={[240, 0, 0]} bands={1.3} /><Drift count={36} box={[700, 900, 700]} at={[100, 0, 200]} size={5} fall={40} /></>);
  } else if (id === 'plane') {
    // An airliner going round it. The note is above them all, so they fly past its side.
    const fly = k / Math.max(0.6, L.span); const bank = Math.sin(fly * 3.14) * 0.5;
    pos = push([-6, 1, 44], [-5.4, 1.2, 41]); target = [0, 5.5, 0]; fov = 40; sky = ['#1B5FA8', '#CFE8F4']; scrim = 0.3; light = <SoftDay intensity={2.8} size={40} keyPos={[-20, 30, 30]} />;
    body = (<>
      <Column h={300} w={7} d={5} p={[9.5, -120, -8]} bands={1} />
      {clouds(k * 5.5, -13, 40)}
      <group position={[-30 + fly * 40, -2.6 + Math.sin(fly * 3.14) * 4.4, 8]} rotation={[0, Math.PI / 2 - 0.25 - bank * 0.5, -bank * 0.25]} scale={0.8}>
        <Bx s={[1.8, 1.8, 16]} c="#F7F4EC" round={0.8} />
        <Bx s={[15, 0.18, 2.6]} p={[0, -0.25, -0.2]} r={[0, 0, bank * 0.3]} c="#D7D4CC" /><Bx s={[0.2, 2.6, 2.2]} p={[0, 1.8, -7]} c="#E0392B" /><Bx s={[5, 0.14, 1.4]} p={[0, 0.5, -7.2]} c="#D7D4CC" />
        {[-1, 1].map((x) => <Bx key={x} s={[0.9, 0.9, 1.8]} p={[x * 3.4, -0.85, 0.3]} c="#8A8F9B" round={0.4} />)}
      </group>
    </>);
  } else if (id === 'cockpit' || id === 'cockpit2') {
    pos = push([-0.02, 1.08, 3.05], [0.0, 1.1, 2.75]); target = [-0.02, 1.66, -1.2]; fov = 40; sky = ['#1B5FA8', '#CFE8F4']; scrim = 0.28; light = <SoftDay intensity={2.3} size={8} keyPos={[2, 8, 7]} />;
    const deck = clouds(k * 3);
    body = (<>
      <Column h={260} w={2.8} d={2} p={[3.8 - k * 0.3, -100, -18]} bands={1.2} />
      {deck}
      <Bx s={[0.22, 3.6, 0.3]} p={[-1.25, 1.6, -0.95]} r={[0, 0, -0.1]} c="#2E3744" /><Bx s={[0.22, 3.6, 0.3]} p={[1.25, 1.6, -0.95]} r={[0, 0, 0.1]} c="#2E3744" /><Bx s={[0.12, 3.2, 0.2]} p={[0.15, 1.8, -1.05]} c="#2E3744" />
      <Bx s={[3.6, 0.5, 0.3]} p={[0, 3.05, -0.95]} c="#2E3744" /><Bx s={[3.6, 1, 1.1]} p={[0, 0.3, -0.6]} c="#3A4453" />
      {Array.from({ length: 18 }).map((_, i) => <Bx key={i} s={[0.1, 0.055, 0.02]} p={[-0.9 + (i % 9) * 0.22, 0.68 + Math.floor(i / 9) * 0.1, -0.03]} c={i % 5 === 0 ? '#F4B942' : i % 3 === 0 ? '#6FE3B1' : '#9FB8D0'} glow={1.2} cast={false} />)}
      <Bx s={[0.74, 1.3, 0.2]} p={[-0.28, 0.75, 0.12]} c="#49546A" round={0.05} />
      <BoxPerson who={PILOT} p={[-0.28, 0, 0.42]} ry={0.1} scale={0.92} pose={{ sit: 1, talk: mouth('l11'), headYaw: 0.1 + Math.sin(t * 1.7) * 0.12, armR: 1.35, elbowR: 1.5, brow: 0.3, lean: Math.sin(t * 1.3) * 0.03 }} holdR={<Bx s={[0.07, 0.16, 0.07]} c="#17171F" />} />
    </>);
  } else if (id === 'edge') {
    pos = push([-1.1, 0.55, 4.8], [-0.95, 1.0, 4.3]); target = [0.05, 1.28 + Math.min(1, k / L.span) * 0.5, 0]; fov = 34; sky = ['#01030A', '#2B72C4', '#071029']; stars = 150; scrim = 0.2; light = <SoftDay intensity={3} size={40} keyPos={[-30, 40, 40]} />;
    body = (<><Globe r={18} p={[0, -18, 0]} spin={k * 0.09 + 3.9} roll={-0.8} tilt={0.5} detail={64} /><Column h={(h / 107374) * 1.9} w={0.1} d={0.075} p={[0.45, 0, 0]} bands={1.5} /></>);
  } else if (id === 'top') {
    // From the top, straight down it: the whole planet is at the far end of a piece of paper.
    const tall = (h / 107374) * 4; const spin = k * 0.3 + 2.2;
    pos = push([1.5, tall + 1.1, 2.7], [1.45, tall + 1.25, 2.5]); target = [-1.0, -0.7, -0.9]; fov = 60; sky = ['#01030A', '#0C1A36']; stars = 150; scrim = 0.28; light = <SoftDay intensity={3} size={14} keyPos={[-8, 10, 8]} />;
    body = (<><Globe r={3.4} p={[0, -3.4, 0]} spin={spin} roll={0} tilt={-1.3} detail={48} /><Column h={tall} w={0.1} d={0.075} bands={1.6} /></>);
  } else if (id === 'pencil') {
    // Close enough to read. The wall is the note.
    pos = push([-1.6, 1.5, 3.8], [-0.9, 0.9, 2.9]); target = [0.15, 0.85, 0]; fov = 42; sky = ['#01030A', '#0A1226']; stars = 110; scrim = 0.7; light = <SoftDay intensity={2.8} size={10} keyPos={[-5, 8, 10]} />;
    body = (<><Column h={60} w={16} d={2} p={[3.4, -30, -2.2]} bands={0.28} /></>);
  } else if (id === 'station') {
    pos = push([0.3, 0.95, 5.4], [0.3, 0.92, 4.95]); target = [0.3, 0.72, 0]; fov = 40; sky = ['#01030A', '#0A1226']; stars = 150; scrim = 0.2; light = <SoftDay intensity={3} size={12} keyPos={[-6, 8, 10]} />;
    body = (<>
      <Globe r={60} p={[0, -63.6, -14]} spin={k * 0.12 + 3.4} roll={-0.8} tilt={0.4} detail={64} />
      <Column h={40} w={1.05} d={0.8} p={[1.42, -20, -1]} bands={2.4} />
      <Bx s={[7, 0.14, 0.14]} p={[-1.8, 0.15, -0.4]} c="#C9C5BA" metal={0.3} rough={0.5} />
      {[-4.2, -2.5, -0.8].map((x) => [1, -1].map((s) => <Bx key={`${x}${s}`} s={[1.5, 1.45, 0.02]} p={[x, 0.15 + s * 0.84, -0.42]} c="#27406E" metal={0.5} rough={0.35} />))}
      <Bx s={[1.6, 0.6, 0.6]} p={[-1.3, -0.25, -0.4]} c="#E9E4D6" round={0.2} />
      <BoxPerson who={ASTRONAUT} p={[-0.28, -0.42, 0.5]} ry={0.75} scale={0.72} pose={{ talk: mouth('l12'), headYaw: -0.55, armL: 0.9, outL: 0.25, armR: 1.1, walk: Math.sin(t * 0.8) * 0.1, lean: Math.sin(t * 0.5) * 0.04, brow: 0.5 }} />
    </>);
  } else if (id === 'earth') {
    pos = push([0.3, 1.2, 8.2], [0.3, 1.8, 9.4]); target = [0.05, 1.1, 0]; fov = 34; sky = ['#01030A', '#071129']; stars = 200; scrim = 0.15; light = <SoftDay intensity={3.1} size={8} keyPos={[-6, 5, 7]} />;
    body = (<><Globe r={1} p={[0.72, -1.72, 0]} spin={k * 0.45 + 2.2} tilt={0.3} roll={-0.9} detail={32} /><Column h={h / 6371000} w={0.05} d={0.04} p={[0.72, -0.74, 0]} bands={1.2} /><MoonBall r={0.34} p={[3.4, 6.2, -26]} detail={10} /></>);
  } else if (id === 'moon') {
    // The Moon's sky. The note leaves Earth, and each fold covers as much as all the others put together.
    const far: V3 = [4.7, 12, -130]; const tip = lerp3(far, [7, 8, 8], Math.min(1.2, h / 384400000) / 1.14); const dx = tip[0] - far[0], dy = tip[1] - far[1], dz = tip[2] - far[2];
    pos = push([1.2, 1.2, 12], [1.0, 1.9, 11]); target = [-1.1, 7.8, -30]; fov = 42; sky = ['#000208', '#050914']; stars = 240; scrim = 0.2; light = <SoftDay intensity={3.2} size={40} keyPos={[-20, 30, 30]} />;
    body = (<>
      <MoonBall r={70} p={[0, -70, 0]} detail={64} spin={0.4 + k * 0.02} />
      <Globe r={5.4} p={far} spin={k * 0.08 + 2.2} detail={32} />
      <mesh position={[(far[0] + tip[0]) / 2, (far[1] + tip[1]) / 2, (far[2] + tip[2]) / 2]} quaternion={towards(dx, dy, dz)} scale={[0.34, Math.hypot(dx, dy, dz), 0.26]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#FBF7EC" roughness={0.9} /></mesh>
    </>);
  } else if (id === 'class') {
    const gaze = Math.sin(t * 1.1) * 0.04;
    pos = push([0.02, 1.25, -3.55], [0.0, 1.27, -3.25]); target = [-0.05, 1.7, 1.3]; fov = 48; scrim = 0.34;
    body = (<><Classroom hole /><Desk p={[0, 0, 0.72]} /><Chair p={[0.42, 0, 1.3]} /><Chair p={[-0.42, 0, 1.3]} /><Column h={6} w={NOTE.w} d={NOTE.d} p={[-0.82, 0, 0.3]} bands={3.4} />
      <BoxPerson who={LEO} p={[0.42, 0, 1.25]} ry={Math.PI} scale={0.8} pose={{ sit: 1, headYaw: 0.45, brow: 0.7, eyes: 1.2 }} />
      <BoxPerson who={IVY} p={[0.74, 0, 0.1]} ry={Math.PI + 0.9} scale={0.8} pose={{ talk: mouth('l13'), headYaw: 0.25, armL: 0.35, armR: 0.35, outL: 0.2, brow: 0.25 }} />
      <BoxPerson who={BEN} p={[-0.42, 0, 1.25]} ry={Math.PI} scale={0.8} pose={{ sit: 1, headPitch: -0.3 + gaze, eyes: 1.2 }} />
      <BoxPerson who={TEACHER} p={[1.55, 0, 1.9]} ry={-2.7} pose={{ armL: 0.3, armR: 1.2, elbowR: 1.5, headPitch: -0.22, eyes: 1.2 }} />
      <Desk p={[0, 0, 3.1]} /><BoxPerson who={IDA} p={[0.75, 0, 3.7]} ry={Math.PI} scale={0.8} pose={{ sit: 1, headPitch: -0.32 + gaze }} />
      {dust}</>);
  }
  const hudOn = prog(line('l1').e + 0.45, line('l1').e + 0.75);
  // A sentence that runs across a cut keeps its place: it types in once.
  let readFrom = L.rung.from; for (let i = L.i - 1; i >= 0 && rungs[i]!.read === L.rung.read; i--) readFrom = rungs[i]!.from;
  const compare = rungs[L.i]!.step === L.step ? rungs[L.i]!.compare : undefined;
  return (
    <>
      {sky ? <Sky from={sky[0]} to={sky[1]} mid={sky[2]} stars={stars} /> : null}
      <Scene3D pos={pos} target={target} fov={fov} fog={fog}>
        {light}
        {body}
      </Scene3D>
      {id === 'station' ? <Pencil /> : null}
      {id === 'pencil' ? <Pencil big /> : null}
      {id === 'front' ? <Front /> : null}
      <Scrim amount={scrim} />
      {id === 'hook' ? <div style={{ position: 'absolute', left: 60, right: 60, top: 150, zIndex: 41, fontFamily: look.fonts.display, fontStyle: 'italic', fontWeight: 400, fontSize: 112, lineHeight: 1.04, letterSpacing: '-0.015em', color: c.ink, textShadow: `0 3px 22px ${c.line}cc` }}>What if you never stopped folding the note?</div> : null}
      <Readout topic="A note to Ivy" unit="Fold" step={L.step} value={fmtLen(metres(L.step))} compare={compare ?? (L.step === 0 ? 'one sheet of paper' : L.step === 1 ? 'two sheets' : undefined)} rule="Thickness ×2 every fold" pulse={L.pulse} opacity={hudOn} />
      {L.rung.read ? <ReadLine key={L.rung.read} text={L.rung.read} from={readFrom + 0.12} y={700} width={680} /> : null}
      <Spoken names={{ leo: 'Leo', ben: 'Ben', ivy: 'Ivy', teacher: 'Mrs Park', upstairs: 'Upstairs', caretaker: 'Caretaker', reporter: 'Local news', pilot: 'Your captain', astronaut: 'Station' }} />
      <Vignette />
      <Grain />
    </>
  );
}

// Cloud far below the flight deck, pure in `k`.
function clouds(k: number, y = -10, n = 30) {
  return <>{Array.from({ length: n }).map((_, i) => { const r = rng(i * 7 + 2); const x = (r() - 0.5) * 90; const z = 6 - r() * 76; const s = 2 + r() * 7; return <Bx key={i} s={[s * 2, s * 0.35, s]} p={[((x + k * 2.4 + 45) % 90) - 45, y - r() * 3, z]} c="#F7FAFB" round={0.8} rough={1} cast={false} />; })}</>;
}
