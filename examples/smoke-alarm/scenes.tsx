import { useFilm, Captions, Vignette } from '@pack/kit';
import { Scene3D, lerp, lerp3, type V3 } from '@pack/kit/three';
import { rbox } from '@pack/kit/formats/little-life';
import { SCAN_POSES, ScanBody, ScanCard, ScanChecklist, ScanHud, ScanReading, mixScanPose, useScan, type ScanPose } from '@pack/kit/formats/drill';

/* A smoke alarm at night, as a sensor would draw it: every surface stippled, every edge a noisy line, nothing amber but what
   you must look at. The film keeps one real clock running and one room all the way through. */

type Shot = [number, V3, V3, number, number?];
function camAt(t: number, shots: Shot[], ease: (x: number) => number) {
  let i = 0; for (let k = 0; k < shots.length; k++) if (t >= shots[k]![0]) i = k;
  const c = shots[i]!; const d = c[4] ?? 0; if (i === 0 || d === 0 || t > c[0] + d) return { pos: c[1], target: c[2], fov: c[3] };
  const a = shots[i - 1]!; const e = ease((t - c[0]) / d); return { pos: lerp3(a[1], c[1], e), target: lerp3(a[2], c[2], e), fov: lerp(a[3], c[3], e) };
}

const ROOM = { w: 3.6, d: 4.2, h: 2.7 };

function Room({ scan, doorOpen, doorHot, hotPhone, hotWindow, hallHot, flood, glowBehind }: { scan: ReturnType<typeof useScan>; doorOpen: number; doorHot: number; hotPhone: number; hotWindow: number; hallHot: number; flood: number; glowBehind: number }) {
  const wall = scan('wall', { base: 0.2, edge: 0.75, hot: flood * 0.3 }); const floor = scan('floor', { base: 0.42, edge: 0.7, hot: flood * 0.36 }); const fire = scan('fire', { base: 0.1, edge: 0.4, hot: 0.95 }); const soft = scan('soft', { base: 0.5, edge: 0.9, rim: 0.3 }); const hard = scan('hard', { base: 0.32, edge: 0.95, rim: 0.18 });
  const door = scan('door', { base: 0.2, edge: 1, rim: 0.2, hot: doorHot }); const knob = scan('knob', { base: 0.8, edge: 1, rim: 0.6, hot: Math.max(doorHot, 0.34) }); const phone = scan('phone', { base: 0.3, edge: 1, rim: 0.3, hot: hotPhone }); const win = scan('win', { base: 0.14, edge: 0.95, rim: 0.1, hot: hotWindow }); const hall = scan('hall', { base: 0.05, edge: 0.3, hot: hallHot });
  const { w, d, h } = ROOM;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={floor}><planeGeometry args={[24, 24, 1, 1]} /></mesh>
      <mesh position={[0, h / 2, -d / 2]} geometry={rbox(w * 2, h, 0.2, 0.04, 3)} material={wall} />
      <mesh position={[-w, h / 2, 0]} geometry={rbox(0.2, h, d + 8, 0.04, 3)} material={wall} />
      {/* the right wall, with a door in it and a hall beyond the door */}
      <mesh position={[w * 0.7, h / 2, -d / 2 + 0.55 - 0.5]} geometry={rbox(0.2, h, 0.2, 0.03, 2)} material={wall} />
      <mesh position={[w * 0.7, h / 2, 1.9]} geometry={rbox(0.2, h, 4.6, 0.03, 2)} material={wall} />
      <mesh position={[w * 0.7, 2.25 + 0.25, -0.75]} geometry={rbox(0.2, 0.5, 1.05, 0.03, 2)} material={wall} />
      {hallHot > 0.01 ? <mesh position={[w * 0.7 + 1.3, h / 2, -0.8]} geometry={rbox(2.4, h, 2.4, 0.04, 2)} material={hall} /> : null}
      {glowBehind > 0.01 ? <mesh position={[w * 0.7 - 0.5, h / 2, -0.75]} geometry={rbox(0.1, h, 1.4, 0.02, 1)} material={fire} /> : null}
      {glowBehind > 0.01 ? <mesh position={[w * 0.7 + 0.07, 0.015, -0.74]} geometry={rbox(0.06, 0.03, 0.96, 0.005, 1)} material={fire} /> : null}
      <group position={[w * 0.7 - 0.02, 0, -0.26]} rotation={[0, doorOpen * 1.75, 0]}>
        <mesh position={[0, 1.12, -0.48]} geometry={rbox(0.09, 2.2, 0.96, 0.03, 3)} material={door} />
        <mesh position={[-0.1, 1.05, -0.86]} material={knob}><sphereGeometry args={[0.065, 18, 14]} /></mesh>
        <mesh position={[0.1, 1.05, -0.86]} material={knob}><sphereGeometry args={[0.065, 18, 14]} /></mesh>
      </group>
      {/* a window: the second way out */}
      <group position={[-w * 0.1, 1.5, -d / 2 + 0.13]}>
        <mesh geometry={rbox(1.5, 1.2, 0.05, 0.02, 2)} material={win} />
        <mesh geometry={rbox(0.05, 1.2, 0.07, 0.01, 1)} material={hard} />
        <mesh geometry={rbox(1.5, 0.05, 0.07, 0.01, 1)} material={hard} />
      </group>
      {/* the bed */}
      <group position={[-2.05, 0, -0.1]}>
        <mesh position={[0, 0.2, 0]} geometry={rbox(1.6, 0.4, 2.5, 0.05)} material={hard} />
        <mesh position={[0, 0.52, 0.12]} geometry={rbox(1.56, 0.26, 2.2, 0.12)} material={soft} />
        <mesh position={[0, 0.72, -0.92]} geometry={rbox(0.86, 0.2, 0.46, 0.1)} material={soft} />
        <mesh position={[0, 0.72, -1.3]} geometry={rbox(1.7, 1.44, 0.1, 0.04)} material={hard} />
      </group>
      {/* the nightstand, and what you would stop for */}
      <group position={[-0.86, 0, -1.52]}>
        <mesh position={[0, 0.3, 0]} geometry={rbox(0.62, 0.6, 0.54, 0.04)} material={hard} />
        {/* a laptop, open; a folded wallet */}
        <mesh position={[-0.12, 0.612, 0.05]} geometry={rbox(0.32, 0.018, 0.22, 0.006, 2)} material={phone} />
        <mesh position={[-0.12, 0.72, -0.08]} rotation={[-0.3, 0, 0]} geometry={rbox(0.32, 0.21, 0.012, 0.006, 2)} material={phone} />
        <mesh position={[0.2, 0.615, 0.08]} rotation={[0, 0.35, 0]} geometry={rbox(0.11, 0.03, 0.08, 0.01, 2)} material={phone} />
      </group>
      {/* the alarm */}
      <mesh position={[0.3, h - 0.12, -d / 2 + 0.2]} rotation={[Math.PI / 2, 0, 0]} material={knob}><cylinderGeometry args={[0.13, 0.15, 0.09, 24]} /></mesh>
    </>
  );
}

export default function Scenes() {
  const { at, line, t, prog, ease, look, frame } = useFilm(); const c = look.color; const L = (id: string) => line(id).s;

  /* the smoke line falls from the ceiling and stays */
  const smoke = lerp(3.2, 1.16, prog(at('Smoke'), at('so', 1, 's2'), ease.inOut)); const smokeNow = t < L('t1') ? smoke : 99;

  /* the door */
  const doorOpenFlash = (t >= L('s4') ? 1 : 0) * (1 - prog(at('Close'), at('Close') + 0.3, ease.back));
  const testOpen = prog(L('t1'), L('t1') + 0.5, ease.inOut) * (1 - prog(at('shut', 1, 't2') - 0.15, at('shut', 1, 't2') + 0.18, ease.back));
  const lastDoor = t >= L('e1') ? 1 - prog(at('door', 1, 'e1') - 0.04, at('door', 1, 'e1') + 0.22, ease.back) : 0;
  const doorOpen = t < L('t1') ? doorOpenFlash : t < L('e1') ? testOpen : lastDoor;
  const doorHot = prog(at('hot'), at('hot') + 0.5, ease.out) * (1 - prog(L('s4') - 0.04, L('s4')));
  const hallHot = t < L('t1') ? 0 : t >= L('e1') ? 0.3 * (1 - prog(at('door', 1, 'e1') - 0.04, at('door', 1, 'e1') + 0.22)) : prog(L('t1'), at('five', 1, 't1')) * 0.94 * (1 - prog(at('shut', 1, 't2') - 0.1, at('shut', 1, 't2') + 0.1));
  const flood = t >= L('t1') ? prog(L('t1'), at('hundred', 1, 't1'), ease.inOut) * (1 - prog(at('shut', 1, 't2') - 0.1, at('shut', 1, 't2') + 0.2, ease.out)) : 0;

  /* the body */
  const seq: [number, ScanPose, number?][] = [[0, SCAN_POSES.lie!], [at('Leave'), SCAN_POSES.stand!, 0.5], [at('stand', 1, 's2'), SCAN_POSES.crawl!, 0.4], [L('s3'), SCAN_POSES.reach!, 0.35], [L('s4'), SCAN_POSES.crawl!, 0.3], [L('s5'), SCAN_POSES.phone!, 0.01], [L('t1'), SCAN_POSES.lie!, 0.01]];
  let k = 0; for (let i = 0; i < seq.length; i++) if (t >= seq[i]![0]) k = i;
  const pose = k === 0 ? seq[0]![1] : mixScanPose(seq[k - 1]![1], seq[k]![1], ease.inOut(Math.min(1, (t - seq[k]![0]) / (seq[k]![2] ?? 0.3))));
  const crawlStep = Math.sin(t * 5) * 0.08; const crawling = (t >= at('stand', 1, 's2') && t < L('s3')) || (t >= L('s4') && t < L('s5'));
  const bodyPose: ScanPose = crawling ? { ...pose, L: [pose.L[0], pose.L[1], pose.L[2] + crawlStep], R: [pose.R[0], pose.R[1], pose.R[2] - crawlStep] } : pose;
  const toDoor = prog(at('stand', 1, 's2'), L('s3'), ease.linear);
  const bed: V3 = [-2.05, 0.62, 0.2]; const edge: V3 = [0.05, 0, 0.7]; const doorSide: V3 = [1.8, 0, -1.12]; const hallA: V3 = [2.75, 0, -0.75]; const hallB: V3 = [3.55, 0, -0.45];
  let bodyAt: V3 = lerp3(bed, edge, prog(at('Leave'), at('Leave') + 0.5, ease.inOut)); bodyAt = lerp3(bodyAt, doorSide, toDoor); if (t >= L('s4') && t < L('t1')) bodyAt = lerp3(hallA, hallB, prog(L('s4'), at('slows'), ease.linear)); if (t >= L('t1')) bodyAt = bed;
  const yaw = t < at('Leave') ? Math.PI : t < at('stand', 1, 's2') ? 0.5 : t < L('s5') ? Math.PI * 0.5 + 0.1 : t >= L('t1') ? Math.PI : 0;

  /* cameras: there is one room; we only move in it */
  const wide: [V3, V3, number] = [[1.9, 1.75, 5.3], [-0.72, 0.92, -0.7], 44];
  const doorSeen: [V3, V3, number] = [[-0.55, 1.15, 1.5], [2.1, 0.9, -1.0], 42];
  const shots: Shot[] = [
    [0, ...wide], [at('alarm'), [1.2, 1.4, 4.9], [0.1, 1.6, -1.4], 40, 0.6],
    [L('a2'), ...wide, 0.5], [at('Not'), [-0.5, 1.05, 0.55], [-0.84, 0.58, -1.5], 28],
    [L('s2'), [2.5, 1.2, 4.7], [0.35, 1.0, -0.4], 42, 0.4],
    [L('s3'), ...doorSeen, 0.4], [at('second'), [-0.55, 1.0, 2.5], [-0.36, 1.42, -2], 32, 0.5],
    [L('s4'), [6.3, 1.2, 0.8], [2.5, 0.95, -0.85], 38],
    [L('t1'), [-0.6, 1.5, 3.5], [1.2, 1.0, -0.7], 44], [at('shut', 1, 't2'), [-0.4, 1.4, 3.3], [0.9, 1.0, -0.8], 42, 0.4], [L('e1'), [-0.9, 1.25, 2.6], [2.2, 0.98, -0.74], 42],
  ];
  const cam = camAt(t, shots, ease.inOut);
  if (t >= L('s2') + 0.4 && t < L('s3')) { cam.pos = [Math.min(bodyAt[0] + 2.1, 2.2), 1.2, bodyAt[2] + 4.3]; cam.target = [bodyAt[0] - 0.05, 0.98, bodyAt[2] - 0.4]; cam.fov = 40; }
  const shake = t < L('a2') + 0.5 && t > at('alarm') ? 0.012 : 0.003; const j = (s: number) => Math.sin(frame * s) * shake;
  const posJ: V3 = [cam.pos[0] + j(1.7), cam.pos[1] + j(2.3), cam.pos[2]];

  const outside = t >= L('s5') && t < L('t1');
  const alarmHot = t < L('s2') ? (frame % 20 < 10 ? 1 : 0.1) : 0;
  const scan = useScan({ light: outside ? [3, 8, 6] : [1.3, 2.5, 2.8], smoke: outside ? 99 : smokeNow, rings: 1, ring: t < L('s2') ? [-2, 0, 0] : t < L('s5') ? [bodyAt[0], 0, bodyAt[2]] : [1.5, 0, -0.5] });
  const bodyMat = scan('body', { base: 0.02, edge: 0.2, rim: 3.2, hot: t >= L('s5') && t < L('t1') ? 0 : 0 });
  const roomMats = { doorOpen, flood, glowBehind: t >= L('s4') && t < L('s5') ? 1 : 0, doorHot: doorHot, hotPhone: prog(at('Not'), at('Not') + 0.2) * (1 - prog(L('s2') - 0.02, L('s2'))) * 0.95, hotWindow: prog(at('second'), at('second') + 0.3) * (1 - prog(L('s4') - 0.03, L('s4'))) * 0.82, hallHot };

  /* outside: a house, an outline, a phone */
  const house = scan('house', { base: 0.2, edge: 0.95, rim: 0.15 }); const houseHot = scan('househot', { base: 0.2, edge: 1, hot: 0.9 }); const ground = scan('floor2', { base: 0.3, edge: 0.6 });
  const out: { pos: V3; target: V3; fov: number } = { pos: [-1.2, 1.3, 9.6], target: [0.6, 2.1, 0], fov: 44 };

  const reading = t < L('t1') ? null : t < at('shut', 1, 't2') ? Math.round(lerp(100, 500, prog(at('open'), at('hundred', 1, 't1'), ease.out))) : Math.round(lerp(500, 100, prog(at('shut', 1, 't2'), at('hundred', 1, 't2'), ease.out)));
  const clockLeft = Math.max(0, 120 - Math.floor(t - at('two')));
  return (
    <>
      <Scene3D pos={outside ? out.pos : posJ} target={outside ? out.target : cam.target} fov={outside ? out.fov : cam.fov} background={c.bg} shadows={false}>
        {!outside ? <Room scan={scan} {...roomMats} /> : (<group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={ground}><planeGeometry args={[60, 60, 1, 1]} /></mesh>
          <group position={[1.6, 0, -2]}>
            <mesh position={[0, 1.8, 0]} geometry={rbox(5.2, 3.6, 3.6, 0.05)} material={house} />
            <mesh position={[0, 3.6, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.55, 1]}><coneGeometry args={[4.4, 3, 4]} /><primitive object={house} attach="material" /></mesh>
            {[[-1.5, 2.5], [1.5, 2.5], [1.5, 1.0]].map(([x, y], i) => <mesh key={i} position={[x!, y!, 1.82]} geometry={rbox(0.86, 0.9, 0.06, 0.02, 2)} material={houseHot} />)}
            <mesh position={[-1.2, 0.95, 1.82]} geometry={rbox(0.9, 1.9, 0.06, 0.02, 2)} material={house} />
          </group>
        </group>)}
        <ScanBody pos={outside ? [-0.72, 0, 3.4] : (bodyAt)} yaw={outside ? 0.5 : yaw} pose={bodyPose} mat={bodyMat} />
        {outside ? <mesh position={[-0.85, 1.5, 3.66]} geometry={rbox(0.11, 0.2, 0.03, 0.012, 2)} material={houseHot} /> : null}
      </Scene3D>
      <ScanHud room={outside ? 'YARD' : t >= L('s3') && t < L('s5') ? 'DOOR' : 'BEDROOM'} status={t < at('alarm') ? 'STATUS · QUIET' : t < L('t1') ? `ESCAPE · ${Math.floor(clockLeft / 60)}:${String(clockLeft % 60).padStart(2, '0')}` : t < at('Tonight') ? 'TEST BURN' : 'STATUS · QUIET'} hot={t >= at('alarm') && t < L('t1')} />
      {alarmHot > 0.5 ? <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 30, background: `radial-gradient(ellipse at 60% 28%, ${c.accent}26, transparent 55%)` }} /> : null}
      <ScanCard label="ALERT · BEDROOM" title="Your smoke alarm goes off" amberLast={2} at={L('a1')} until={L('a2') - 0.03} />
      <ScanCard label="TIME" title="Two minutes" sub="A fire can turn deadly that fast" amberLast={2} at={L('a2')} until={L('s1') - 0.03} />
      <ScanCard label="STEP 01" title="Leave your things" sub="They stay" at={L('s1')} until={L('s2') - 0.03} />
      {t >= at('Not') && t < L('s2') ? <ScanChecklist y={480} items={[{ label: 'Wallet', on: at('wallet'), off: true }, { label: 'Laptop', on: at('laptop'), off: true }]} /> : null}
      <ScanCard label="STEP 02" title="Stay low" sub="Smoke fills the ceiling first" at={L('s2')} until={L('s3') - 0.03} />
      <ScanCard label="STEP 03" title="Feel the door" at={L('s3')} until={at('hot') - 0.03} />
      {t >= L('s3') && t < at('hot') ? <ScanChecklist y={400} title="BEFORE YOU OPEN" items={[{ label: 'Knob', on: at('knob') }, { label: 'Door', on: at('door', 2, 's3') }]} /> : null}
      <ScanCard label="HOT" title="Leave it shut" sub="Use your second way out" amberLast={1} at={at('hot')} until={L('s4') - 0.03} />
      <ScanCard label="STEP 04" title="Close doors behind you" amberLast={1} sub="It slows the fire" at={L('s4')} until={L('s5') - 0.03} />
      <ScanCard label="STEP 05" title="Call from outside" sub="Never go back in" at={L('s5')} until={L('t1') - 0.03} />
      {reading !== null && t < L('e1') ? <ScanReading value={`${reading}°`} unit="F" tone={t >= at('shut', 1, 't2') ? 'ink' : 'amber'} /> : null}
      <ScanCard label={t < at('shut', 1, 't2') ? 'TEST BURN · DOOR OPEN' : 'TEST BURN · DOOR SHUT'} title={t < at('shut', 1, 't2') ? 'Open bedroom' : 'Shut bedroom'} amberLast={t < at('shut', 1, 't2') ? 0 : 0} at={L('t1')} until={L('e1') - 0.03} />
      <ScanCard label="TONIGHT" title="Close your bedroom door" amberLast={1} at={L('e1')} until={99} />
      <Captions />
      <Vignette amount={0.3} />
    </>
  );
}
