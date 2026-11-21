import { AbsoluteFill } from 'remotion';
import { Captions, Vignette, useFilm } from '@pack/kit';
import { lerp, type V3 } from '@pack/kit/three';
import { Bokeh, ContactBlob, POSES, ToyLights, ToyPerson, ToyStage, faceAt, geo, poseAt, rbox, toyMat, type Dress, type Pose } from '@pack/kit/formats/little-life';
import { HealthBar, QuestBanner, RaceBars, Toast, ToySea, WaterRings } from '@pack/kit/formats/drill';
import * as THREE from 'three';

/* A rip current, as a game you are losing. The bar is your stamina; the beach is the score. */

const YOU: Dress = { hairStyle: 'curls', hair: '#3E2A22', skin: '#F2BE98', top: '#F26B2E', bottom: '#1F8E86', shoe: '#FFE27A', trim: '#FFE27A', collar: 'round', sleeve: 'short' };
const SWIM = (s: number, look = 0): Pose => ({ L: [0.82, 1.72 + s * 0.3, 0.3 - s * 0.26], R: [-0.82, 1.72 - s * 0.3, 0.3 + s * 0.26], head: [-1.0, look, 0], hands: ['open', 'open'] });
const FLOAT: Pose = { L: [0.72, 1.46, 0.12], R: [-0.72, 1.46, 0.12], head: [0.42, 0, 0], hands: ['open', 'open'] };
const WAVE = (s: number): Pose => ({ L: [0.86 + s * 0.14, 1.84 + s * 0.06, 0.3], R: [-0.86 - s * 0.14, 1.84 - s * 0.06, 0.3], hands: ['open', 'open'], head: [-0.05, 0, s * 0.05] });

function Beach() {
  const sand = toyMat('clay', '#F2D9A2', 'prop');
  return (<>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -60]} material={sand} receiveShadow><planeGeometry args={[400, 120]} /></mesh>
    {[[-7, -6, '#E8483A'], [-2.6, -9, '#2F7FD6'], [3.4, -5.4, '#F4C430'], [8, -9, '#E8483A'], [13, -6, '#2FB57A'], [-13, -7, '#F4C430']].map(([x, z, c], i) => (
      <group key={i} position={[x as number, 0, z as number]}>
        <mesh geometry={geo('umb-pole', () => new THREE.CylinderGeometry(0.06, 0.06, 2, 10))} material={toyMat('vinyl', '#FFFDF4', 'prop')} position={[0, 1, 0]} castShadow />
        <mesh geometry={geo('umb', () => new THREE.ConeGeometry(1.25, 0.62, 16))} material={toyMat('vinyl', c as string, 'prop')} position={[0, 2.1, 0]} castShadow />
        <mesh geometry={rbox(0.9, 0.04, 1.8, 0.02, 2)} material={toyMat('vinyl', c as string, 'prop')} position={[1.2, 0.08, 0.5]} rotation={[0, 0.3, 0]} />
      </group>
    ))}
    {/* the lifeguard tower: the one thing on the beach worth swimming near */}
    <group position={[5.8, 0, -3]}>
      {[[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].map(([x, z], i) => <mesh key={i} geometry={rbox(0.14, 2.4, 0.14, 0.05)} material={toyMat('vinyl', '#FFFDF4', 'prop')} position={[x!, 1.2, z!]} castShadow />)}
      <mesh geometry={rbox(2.2, 1.5, 2.2, 0.16)} material={toyMat('vinyl', '#E8483A', 'prop')} position={[0, 3.1, 0]} castShadow />
      <mesh geometry={rbox(2.6, 0.2, 2.6, 0.08)} material={toyMat('vinyl', '#FFFDF4', 'prop')} position={[0, 4, 0]} castShadow />
    </group>
    <Bokeh items={[{ p: [-16, 7, -44], s: 22, c: '#6FBF7C', o: 0.75 }, { p: [4, 8, -48], s: 26, c: '#58AD72', o: 0.7 }, { p: [24, 7, -44], s: 22, c: '#7FCB88', o: 0.75 }, { p: [-34, 8, -50], s: 28, c: '#6FBF7C', o: 0.7 }, { p: [40, 8, -50], s: 28, c: '#58AD72', o: 0.7 }]} />
    <mesh position={[0, 30, -90]}><planeGeometry args={[400, 110]} /><meshBasicMaterial color="#9EDCF2" toneMapped={false} /></mesh>
    <mesh position={[-3, 18, -70]}><sphereGeometry args={[4.2, 28, 18]} /><meshBasicMaterial color="#FFF7D0" toneMapped={false} /></mesh>
    <Bokeh items={[{ p: [-3, 18, -68], s: 26, c: '#FFE68A', o: 0.85 }]} />
  </>);
}

const arrowGeo = () => geo('arrow-flat', () => { const k = new THREE.Shape(); k.moveTo(-0.16, -0.7); k.lineTo(0.16, -0.7); k.lineTo(0.16, 0.05); k.lineTo(0.5, 0.05); k.lineTo(0, 0.72); k.lineTo(-0.5, 0.05); k.lineTo(-0.16, 0.05); k.closePath(); const g = new THREE.ShapeGeometry(k); g.rotateX(Math.PI / 2); return g; });
/** The current, drawn the way a game draws one: arrows running out to sea. */
function ArrowsInRip({ x, zs, t, on, size = 1, color = '#FFFFFF' }: { x: number; zs: number[]; t: number; on: number; size?: number; color?: string }) {
  if (on <= 0) return null;
  return <>{zs.map((z0, i) => { const z = z0 + ((t * 2.6 + i * 1.3) % 4); const fade = Math.min(1, ((t * 2.6 + i * 1.3) % 4) * 1.2) * Math.min(1, (4 - ((t * 2.6 + i * 1.3) % 4)) * 1.2); return <mesh key={i} geometry={arrowGeo()} position={[x + (i % 2 ? 1.25 : -1.25) * size, 0.14, z]} scale={on * size}><meshBasicMaterial color={color} transparent opacity={0.92 * fade} side={THREE.DoubleSide} toneMapped={false} /></mesh>; })}</>;
}
/** White drops thrown up on every stroke. */
function Splash({ at: p, t, rate }: { at: V3; t: number; rate: number }) {
  const f = (t * rate) % 1; const side = Math.floor(t * rate) % 2 ? 1 : -1;
  return <>{[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = i * 2.4 + side, sp = 0.55 + (i % 3) * 0.22; return <mesh key={i} position={[p[0] + side * 0.42 + Math.cos(a) * sp * f, 0.1 + 1.5 * f * (1 - f) * (0.7 + (i % 2) * 0.5), p[2] - 1.0 + Math.sin(a) * sp * f]} scale={0.055 * (1 - f * 0.6) * (1 + (i % 3) * 0.4)}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#FFFFFF" toneMapped={false} /></mesh>; })}</>;
}

/** The way out, dotted. */
function Path({ pts, p, color = '#FFE27A' }: { pts: V3[]; p: number; color?: string }) {
  const seg: V3[] = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i]!, b = pts[i + 1]!; const n = Math.ceil(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.62); for (let k = 0; k < n; k++) seg.push([lerp(a[0], b[0], k / n), 0.16, lerp(a[2], b[2], k / n)]); }
  return <>{seg.slice(0, Math.floor(seg.length * p)).map((q, i) => <mesh key={i} position={q} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.17, 16]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>)}</>;
}

const bump = (d: number) => (d < -0.04 || d > 0.2 ? 0 : d < 0 ? (d + 0.04) / 0.04 : 1 - d / 0.2);

export default function Scenes() {
  const { at, line, t, prog, ease, look, words } = useFilm(); const c = look.color;
  const L = (id: string) => line(id).s;
  /* a game's camera: a small punch on every other word, a bigger one when a quest lands */
  const beats = words.words.filter((_, i) => i % 2 === 0).map((w) => w.s); const big = words.words.filter((w) => w.key || /^quest$/i.test(w.t)).map((w) => w.s);
  const kick = Math.max(...beats.map((w) => bump(t - w) * 0.03), ...big.map((w) => bump(t - w) * 0.07));
  /* the swimmer: dragged out while they fight it, then sideways, then in */
  const dragged = prog(0, L('q2'), ease.linear) * 11.6 + prog(L('q2'), L('q3'), ease.linear) * 0.8;
  const side = prog(at('sideways'), at('side', 1, 'q3b') + 0.3, ease.inOut); const angle = prog(at('angle', 1, 'q3b'), L('q4') - 0.1, ease.inOut);
  const q4 = t >= L('q4') && t < L('q5'); const q5 = t >= L('q5') && t < L('e1');
  let x = 0.2 + side * 3.8 + angle * 1.6; let z = 1.4 + dragged - angle * 3.8;
  if (q4) { const f = prog(at('angle', 1, 'q4'), L('q5'), ease.inOut); x = lerp(0.3, 2.8, f); z = lerp(13.5, 10.5, f); }
  if (q5) { x = 0.4; z = 14; }
  const swimming = t < L('q2'); const floating = (t >= L('q2') && t < L('q3')) || q4; const sideways = t >= L('q3') && t < L('q4');
  const wave = q5; const tilt = swimming || sideways ? 1.25 : floating ? -1.32 : 0.18;
  const stroke = Math.sin(t * (swimming ? 11 : 7));
  const body: Pose = swimming ? (t >= at('faster') && t < L('q1c') ? { ...SWIM(stroke, 0.5), head: [-1.18, 0.5, 0] } : SWIM(stroke, -1.5)) : sideways ? SWIM(stroke, 0) : floating ? { ...FLOAT, L: [0.72 + Math.sin(t * 2) * 0.05, 1.46 + Math.sin(t * 2) * 0.08, 0.12], R: [-0.72 - Math.sin(t * 2.3) * 0.05, 1.46 - Math.sin(t * 2.3) * 0.08, 0.12] } : wave ? (t >= at('wave', 1, 'q5') ? WAVE(Math.sin(t * 9)) : POSES.idle!) : POSES.idle!;
  const face = faceAt(t, [[0, 'worry'], [at('rip'), 'shock'], [L('q1'), { lid: 0.3, brow: -0.02, browAngle: -0.3, smile: -0.3, open: 0.3 }], [at('not', 1, 'q1b'), 'deadpan'], [at('drains'), 'sad'], [L('q2'), { lid: 0.5, smile: 0.3, browAngle: 0.1 }], [at('under'), 'neutral'], [at('Think'), 'happy'], [L('q3'), { lid: 0.3, browAngle: -0.2, smile: -0.1, open: 0.2 }], [L('q4'), 'sad'], [at('weakens'), { lid: 0.42, smile: 0.4 }], [L('q5'), 'worry'], [at('yell'), 'yell'], [at('valid'), 'yell'], [L('e1'), 'happy']]);
  const yawOf = sideways ? Math.PI / 2 + angle * 0.72 : swimming ? Math.PI - 0.62 : floating ? 0 : Math.PI;
  const y = swimming || sideways ? -0.5 : floating ? -0.44 : -0.62;

  /* stamina: the only number you own */
  const hp = 1 - prog(0, L('q2'), ease.linear) * 0.74 + prog(L('q2'), L('q3'), ease.linear) * 0.16 - prog(L('q3'), L('q4'), ease.linear) * 0.12 + prog(L('q4'), L('q5'), ease.linear) * 0.06 - prog(L('q5'), at('valid')) * 0.04 + prog(L('e1'), L('e1') + 0.8, ease.out) * 0.7;
  const meters = Math.round(z * 3);

  /* cameras: over the shoulder, then the map, then from the beach */
  let pos: V3; let target: V3; let fov = 30;
  if (t < L('q2')) { const push = prog(L('q1b'), L('q1c'), ease.inOut); pos = [x + 3.7, 2.7 - push * 0.2, z + 6.4]; target = [x + 0.42, 0.72, z - 1.7]; if (t >= at('faster') && t < L('q1c')) { pos = [x + 1.7, 1.3, z - 6.6]; target = [x + 0.75, 1.0, z - 1.0]; fov = 26; } if (t >= at('drains')) { pos = [x + 4.2, 1.6, z + 2.9]; target = [x + 0.72, 0.62, z - 1.05]; fov = 24; } }
  else if (t < L('q3')) { const m = prog(L('q2'), L('q2') + 0.5, ease.inOut); pos = [lerp(x + 2, x + 0.25, m), lerp(2, 10.5, m), lerp(z + 5, z + 1.4, m)]; target = [x, 0, z - 1.0]; fov = 27; }
  else if (t < L('q4')) { const m = prog(L('q3'), L('q3') + 0.7, ease.inOut); pos = [lerp(x, 2.4, m), lerp(7, 30, m), lerp(z + 2, 14.5, m)]; target = [lerp(x, 2.4, m), 0, lerp(z, 9.6, m)]; fov = lerp(27, 38, m); }
  else if (q4) { pos = [x + 0.5, 10.5, z + 1.4]; target = [x, 0, z - 1.0]; fov = 26; }
  else if (q5) { const m = prog(L('q5'), L('e1'), ease.linear); pos = [0.9, 1.3, 2.5]; target = [0.38, 1.5, z]; fov = lerp(27, 22, m); }
  else { const m = prog(L('e1'), L('e1') + 1.6, ease.inOut); pos = [lerp(1.4, 2.6, m), 1.25, lerp(6.8, 9.4, m)]; target = [0.5, lerp(1.7, 2.3, m), -1.2]; fov = 32; }

  const swimmerOn = t < L('e1');
  const atSea: V3 = [x, 0, z];
  const fx = t >= L('e1') ? 0 : 1;
  return (
    <>
      <ToyStage pos={pos} target={target} fov={fov * (1 - kick)} background="#9EDCF2" env={0.7} exposure={1.05}>
        <ToyLights keyPos={[-9, 18, 12]} size={26} intensity={2.5} fillK={0.8} ground="#E8D7B0" keyColor="#FFF4E0" />
        <ToySea ripX={0.2} ripW={2.6} rip={1 - prog(at('weakens'), at('weakens') + 1.2) * (q4 ? 1 : 0)} />
        <Beach />
        {swimmerOn ? (<group position={[x, y, z]} rotation={[0, yawOf, 0]} scale={t >= L('q3') && t < L('q4') ? 1.25 : 1}>
          <group position={[0, 0.56, 0]} rotation={[tilt, 0, 0]}>
            <group position={[0, -0.56, 0]}><ToyPerson pose={body} face={face} dress={YOU} seed={5} stuff="vinyl" /></group>
          </group>
        </group>) : null}
        {swimmerOn ? <WaterRings pos={atSea} k={floating ? 1.25 : 1} /> : null}
        {swimming || sideways ? <Splash at={atSea} t={t} rate={swimming ? 3.5 : 2.2} /> : null}
        <ArrowsInRip x={0.2} zs={[z - 4, z - 2, z, z + 1.5]} t={t} size={0.55} on={fx * prog(L('q1'), L('q1') + 0.3) * (1 - prog(L('q2') + 0.4, L('q2') + 0.7))} />
        <ArrowsInRip x={0.2} zs={[-1, 2, 5, 8, 11, 14]} t={t} size={1.1} on={fx * prog(L('q3'), L('q3') + 0.3) * (1 - prog(L('q4') - 0.1, L('q4')))} />
        {t >= L('q3') && t < L('q4') ? <Path pts={[[0.2, 0, 13.8], [4, 0, 13.8], [5.6, 0, 10]]} p={prog(at('sideways'), L('q4') - 0.2, ease.linear)} /> : null}
        {t >= L('e1') ? (<group position={[0.4, 0.06, -1.2]}>
          <ContactBlob r={1.05} opacity={0.5} />
          <ToyPerson pose={poseAt(t, [[0, POSES.hips!], [L('e2'), { ...POSES.hold!, L: [0.3, 1.0, 0.56], R: [-0.3, 1.0, 0.56], head: [0.3, 0, 0] }, 0.3]])} face={faceAt(t, [[0, 'happy'], [L('e2'), { lid: 0.2, smile: 0.5, look: [0, -0.7] }], [at('forecast'), 'beam']])} dress={YOU} seed={5} stuff="vinyl" />
          {t >= L('e2') ? <mesh geometry={rbox(0.46, 0.76, 0.06, 0.08)} material={toyMat('vinyl', '#21243A', 'prop')} position={[0, 1.08, 0.74]} rotation={[-0.95, 0, 0]} castShadow /> : null}
        </group>) : null}
      </ToyStage>

      <HealthBar value={Math.max(0.02, hp)} label="Stamina" />
      {t < L('e1') ? <div style={{ position: 'absolute', right: 56, top: 74, zIndex: 40, textAlign: 'right', fontFamily: look.fonts.display, color: c.ink, textShadow: `0 4px 0 ${c.line}` }}>
        <div style={{ fontSize: 30, letterSpacing: '0.06em' }}>BEACH</div><div style={{ fontSize: 76, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{meters} m</div></div> : null}

      <QuestBanner n={1} title="Stop swimming toward the beach" at={at('Quest', 1, 'q1')} until={L('q1b') - 0.02} />
      <QuestBanner n={2} title="Breathe and float" at={at('Quest', 1, 'q2')} until={L('q3') - 0.02} />
      <QuestBanner n={3} title="Try sideways" at={at('Quest', 1, 'q3')} until={L('q4') - 0.02} />
      <QuestBanner n={4} title="Float, then angle in" at={at('Quest', 1, 'q4')} until={L('q5') - 0.02} />
      <QuestBanner n={5} title="Wave and yell" at={at('Quest', 1, 'q5')} until={L('q5b') - 0.02} />
      {t < L('q1c') ? <RaceBars at={at('faster')} y={210} rows={[{ label: 'Rip current', value: 1, color: '#FF5A4A' }, { label: 'Olympic swimmer', value: 0.86, color: c.accent }, { label: 'You', value: 0.42, color: c.accent2 }]} /> : null}
      <Toast at={at('rip')} until={L('q1') - 0.02} y={300} tone="red">Rip current</Toast>
      <Toast at={at('drains')} until={L('q2') - 0.02} y={300} tone="red">Stamina draining</Toast>
      <Toast at={at('not', 1, 'q2b')} until={at('Think') - 0.02} y={520} tone="green">Out, not under</Toast>
      <Toast at={at('Think')} until={L('q3') - 0.02} y={520}>Treadmill, not drain</Toast>
      <Toast at={at('narrow')} until={at('angle', 1, 'q3b') - 0.02} y={520}>Often narrow</Toast>
      <Toast at={at('weakens')} until={L('q5') - 0.02} y={520} tone="green">Current weakening</Toast>
      {[0, 1, 2].map((i) => { const w = at('yell') + i * 0.16; if (t < w || t > L('e1')) return null; const p = (t - w) % 0.9 / 0.9; const d = 660 + p * 620; return <div key={i} style={{ position: 'absolute', left: 540, top: 1040, width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2, borderRadius: '50%', border: `10px solid ${c.ink}`, opacity: (1 - p) * 0.6, zIndex: 35 }} />; })}
      <Toast at={at('yell')} until={at('valid') - 0.02} y={520} tone="red">Help!</Toast>
      <Toast at={at('valid')} until={L('e1') - 0.02} y={300} tone="green">Valid move +1</Toast>
      <Toast at={at('sunny')} until={L('e2') - 0.02} y={300}>Perfect beach day</Toast>
      {t >= L('e2') ? (
        <div style={{ position: 'absolute', left: 150, right: 150, top: 240, zIndex: 43, background: `${c.panel}f4`, border: `4px solid ${c.ink}`, borderRadius: 18, padding: '22px 26px', color: c.ink, transform: `scale(${prog(L('e2'), L('e2') + 0.26, ease.back)})`, boxShadow: `0 8px 0 ${c.line}88` }}>
          <div style={{ fontFamily: look.fonts.display, fontSize: 34, color: c.accent, letterSpacing: '0.04em' }}>SIDE QUEST: TONIGHT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, fontFamily: look.fonts.display, fontSize: 48, lineHeight: 1.05 }}>
            <span style={{ width: 54, height: 54, border: `5px solid ${c.ink}`, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.accent2, fontSize: 56 }}>{t >= at('forecast') ? '✓' : ''}</span>
            Look up the surf forecast
          </div>
        </div>
      ) : null}
      <Captions />
      <Vignette />
    </>
  );
}
