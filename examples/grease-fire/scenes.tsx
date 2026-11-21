import { AbsoluteFill } from 'remotion';
import { Captions, Grain, Vignette, useFilm } from '@pack/kit';
import { PrintBurst, PrintStage, RuleCard, useBeat } from '@pack/kit/formats/drill';

/* A pan fire as a 1930s printed cartoon: cream and teal, one red, everything keeping the beat on twos. The flame is the only
   character. Your arm comes in from off screen, in an oven mitt, because the film is about you. */

/** The flame: it grows, it laughs, it gets squashed. `k` is size, `grin` 0..1, `flat` 0..1 for under a lid. */
function Flame({ x, y, k, grin, flat, look: lk }: { x: number; y: number; k: number; grin: number; flat: number; look: number }) {
  const { look } = useFilm(); const c = look.color; const { s, bounce, step } = useBeat(); const lick = (i: number) => Math.sin(step * 0.31 + i * 1.7);
  const w = 118 * (1 + flat * 0.7), h = 240 * (1 - flat * 0.78) * (1 + bounce * 0.05);
  const outer = `M${-w} 0 C${-w * 1.1} ${-h * 0.42} ${-w * 0.44 + lick(1) * 10} ${-h * 0.56} ${-w * 0.56 + lick(2) * 16} ${-h * 0.92} C${-w * 0.2} ${-h * 0.7} ${-w * 0.1} ${-h * 0.82} ${lick(3) * 22} ${-h * 1.2} C${w * 0.2} ${-h * 0.82} ${w * 0.3} ${-h * 0.74} ${w * 0.58 + lick(4) * 16} ${-h * 0.96} C${w * 0.48} ${-h * 0.56} ${w * 1.1} ${-h * 0.42} ${w} 0 Z`;
  const inner = `M${-w * 0.6} 0 C${-w * 0.7} ${-h * 0.3} ${-w * 0.2} ${-h * 0.4} ${lick(5) * 10} ${-h * 0.78} C${w * 0.2} ${-h * 0.4} ${w * 0.7} ${-h * 0.3} ${w * 0.6} 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${s * 3})`}>
      <path d={outer} fill={c.accent} stroke={c.line} strokeWidth={8} strokeLinejoin="round" />
      <path d={inner} fill="#F0A13A" />
      {/* a face with pie-free printed eyes: dots in white ovals */}
      <g transform={`translate(0 ${-h * 0.34})`}>
        {[-1, 1].map((e) => <g key={e}><ellipse cx={e * 19} cy={0} rx={15} ry={34 * (1 - flat * 0.6)} fill="#FBF3DD" stroke={c.line} strokeWidth={6} /><circle cx={e * 19 + lk * 6} cy={6} r={8} fill={c.line} /></g>)}
        <path d={`M-40 -52 L-6 ${-30 - grin * 8}`} stroke={c.line} strokeWidth={9} strokeLinecap="round" /><path d={`M40 -52 L6 ${-30 - grin * 8}`} stroke={c.line} strokeWidth={9} strokeLinecap="round" />
        {grin > 0.5 ? <g><path d={`M-58 40 Q0 ${96 + bounce * 12} 58 40 Z`} fill={c.line} /><path d="M-42 44 L42 44 L34 58 L-34 58 Z" fill="#FBF3DD" /><path d="M-20 44 V58 M0 44 V58 M20 44 V58" stroke={c.line} strokeWidth={4} /></g> : <path d="M-22 58 Q0 40 22 58" fill="none" stroke={c.line} strokeWidth={8} strokeLinecap="round" />}
      </g>
    </g>
  );
}

/** Your arm: a rubber hose from off screen, an oven mitt on the end. */
function Mitt({ from, to, sag = 90, holding }: { from: [number, number]; to: [number, number]; sag?: number; holding?: 'none' | 'glass' }) {
  const { look } = useFilm(); const c = look.color; const mid: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + sag]; const d = `M${from.join(' ')} Q${mid.join(' ')} ${to.join(' ')}`;
  return (
    <g>
      <path d={d} fill="none" stroke={c.line} strokeWidth={62} strokeLinecap="round" />
      <path d={d} fill="none" stroke={c.panel} strokeWidth={44} strokeLinecap="round" />
      <g transform={`translate(${to[0]} ${to[1]}) rotate(${(Math.atan2(to[1] - mid[1], to[0] - mid[0]) * 180) / Math.PI + 90}) scale(1.35)`}>
        <path d="M-52 40 C-70 -30 -44 -96 0 -98 C44 -96 62 -30 50 40 Z" fill={c.accent} stroke={c.line} strokeWidth={8} />
        <path d="M46 -22 C78 -40 92 -14 78 8 C70 22 58 26 48 22 Z" fill={c.accent} stroke={c.line} strokeWidth={8} />
        <rect x={-60} y={30} width={118} height={30} rx={8} fill={c.panel} stroke={c.line} strokeWidth={7} />
        <path d="M-30 -60 L28 -10 M-34 -24 L30 24 M-6 -82 L38 -44" stroke="#F3C3B0" strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Kitchen({ burner }: { burner: number }) {
  const { look } = useFilm(); const c = look.color; const { bounce } = useBeat();
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1000} fill="#E8D9B4" />
      {Array.from({ length: 13 }, (_, i) => <rect key={i} x={i * 90} y={0} width={45} height={1000} fill="#DFCDA2" opacity={0.42} />)}
      {/* window with a printed hill */}
      <g transform="translate(700 300)">
        <rect x={0} y={0} width={250} height={250} fill="#BFDAC9" stroke={c.line} strokeWidth={9} />
        <path d="M0 200 Q70 110 140 170 Q190 130 250 190 L250 250 L0 250 Z" fill={c.accent2} />
        <path d="M125 0 V250 M0 125 H250" stroke={c.line} strokeWidth={8} />
        <path d="M-34 -18 C-10 60 -10 170 -44 250 L-70 250 L-70 -18 Z" fill="#E08A9A" stroke={c.line} strokeWidth={7} />
        <path d="M284 -18 C260 60 260 170 294 250 L320 250 L320 -18 Z" fill="#E08A9A" stroke={c.line} strokeWidth={7} />
      </g>
      {/* a shelf */}
      <g transform="translate(70 400)">
        <rect x={0} y={0} width={400} height={18} fill="#6F523D" stroke={c.line} strokeWidth={6} />
        <rect x={30} y={-104} width={64} height={104} fill={c.accent} stroke={c.line} strokeWidth={6} /><rect x={118} y={-84} width={54} height={84} fill={c.accent2} stroke={c.line} strokeWidth={6} /><rect x={196} y={-72} width={90} height={72} rx={8} fill="#F5ECD2" stroke={c.line} strokeWidth={6} />
      </g>
      {/* the wainscot */}
      <rect x={0} y={820} width={1080} height={200} fill={c.accent2} stroke={c.line} strokeWidth={8} />
      {/* checker floor */}
      <rect x={0} y={1010} width={1080} height={910} fill="#E2D2A6" />
      {Array.from({ length: 8 * 9 }, (_, i) => { const col = i % 9, row = Math.floor(i / 9); return (col + row) % 2 ? <rect key={i} x={col * 120} y={1010 + row * 120} width={120} height={120} fill={c.accent2} opacity={0.9} /> : null; })}
      <rect x={0} y={1004} width={1080} height={12} fill={c.line} />
      {/* the sink: the worst idea in the room */}
      <g transform="translate(884 760)">
        <rect x={0} y={0} width={230} height={560} fill={c.accent2} stroke={c.line} strokeWidth={9} />
        <rect x={0} y={0} width={230} height={46} fill="#F5ECD2" stroke={c.line} strokeWidth={9} />
        <path d="M108 0 V-108 Q108 -160 60 -160 L20 -160 V-132" fill="none" stroke={c.line} strokeWidth={36} strokeLinejoin="round" />
        <path d="M108 0 V-108 Q108 -160 60 -160 L20 -160 V-132" fill="none" stroke="#CFC3A4" strokeWidth={20} strokeLinejoin="round" />
        <rect x={84} y={-186} width={48} height={24} rx={8} fill={c.accent} stroke={c.line} strokeWidth={6} />
      </g>
      {/* the stove */}
      <g transform={`translate(190 ${760 + bounce * 3})`}>
        <rect x={0} y={0} width={700} height={70} rx={8} fill="#F5ECD2" stroke={c.line} strokeWidth={9} />
        <rect x={20} y={70} width={660} height={430} fill={c.accent2} stroke={c.line} strokeWidth={9} />
        <rect x={80} y={190} width={540} height={230} rx={10} fill="#2C5C57" stroke={c.line} strokeWidth={8} />
        <rect x={150} y={150} width={400} height={18} rx={9} fill="#F5ECD2" stroke={c.line} strokeWidth={6} />
        {/* the burner knob: the rule turns it */}
        {[0, 1, 2, 3].map((i) => { const on = i === 1; return <g key={i} transform={`translate(${130 + i * 150} 108)`}><circle r={30} fill="#F5ECD2" stroke={c.line} strokeWidth={7} /><path d="M0 0 V-24" stroke={on ? c.accent : c.line} strokeWidth={8} strokeLinecap="round" transform={on ? `rotate(${(1 - burner) * -90})` : ''} /></g>; })}
        <rect x={40} y={500} width={70} height={36} fill={c.line} /><rect x={590} y={500} width={70} height={36} fill={c.line} />
      </g>
    </g>
  );
}

export default function Scenes() {
  const { at, line, t, prog, ease, look } = useFilm(); const c = look.color; const L = (id: string) => line(id).s; const { s: beat, bounce } = useBeat();

  /* the fire's own story */
  const water = prog(at('sinks'), at('flashes'), ease.in); const boom = prog(at('flashes'), at('flashes') + 0.25, ease.out) * (1 - prog(L('r2') - 0.1, L('r2') + 0.1));
  const thrown = prog(at('throws') - 0.08, L('r2') - 0.15, ease.in); const thrownOn = t >= at('throws') - 0.08 && t < L('r2') - 0.1;
  const lid = prog(at('Slide') + 0.1, at('lid') + 0.3, ease.back); const offKnob = prog(at('burner') - 0.1, at('burner') + 0.25, ease.back);
  const big = prog(L('r4'), at('Any') + 0.5, ease.out) * (1 - prog(L('e1') - 0.1, L('e1')));
  const flat = lid * (1 - big); const peek = prog(at('peeking'), at('peeking') + 0.1) * (1 - prog(at('peeking') + 0.45, at('peeking') + 0.7));
  const fireK = (t < L('r1') ? 1 : t < at('sinks') ? 1 + bounce * 0.04 : 1 + boom * 1.1) * (t >= L('e1') ? 0 : 1) + big * 1.0;
  const coolP = prog(at('stays'), at('cool'), ease.linear);
  const fireGone = coolP > 0.98 && big < 0.02;
  const grin = t < L('r1') ? 1 : boom > 0.1 ? 1 : flat > 0.5 ? 0 : 1;
  const panY = 716 + bounce * 6; const panX = 470;

  /* the lid's job: from the mitt onto the hook beside the stove, as the voice says so */
  const hang = at('stove') - 0.1; const HOOK: [number, number] = [108, 590];
  const lidCarry = prog(L('e1'), hang, ease.inOut); const lidHung = t >= hang; const swing = lidHung ? Math.sin((t - hang) * 7) * 14 * Math.exp(-(t - hang) * 1.6) : 0;

  /* your arm */
  const armAt = (): { from: [number, number]; to: [number, number]; sag: number } | null => {
    if (t < L('r1') - 0.1) { const p = prog(at('hand'), at('tap'), ease.back); return { from: [1180, 1700], to: [lerp2(1090, 985, p) + beat * 4, lerp2(980, 690, p)], sag: 120 }; }
    if (t < at('flashes')) return { from: [1180, 1700], to: [lerp2(985, 800, prog(at('sinks') - 0.2, at('sinks'))), lerp2(690, 560, prog(at('sinks') - 0.2, at('sinks')))], sag: 160 };
    if (t < L('r2')) return { from: [1180, 1700], to: [lerp2(1040, 1120, thrown), lerp2(1010, 1180, thrown) + beat * 6], sag: 140 };
    if (t < L('r2b')) return { from: [1180, 1700], to: [lerp2(1040, 620, lid), panY - 130], sag: 220 };
    if (t < L('r3')) return { from: [1180, 1700], to: [760, panY - 80], sag: 240 };
    if (t < L('r4')) return { from: [1180, 1700], to: [1040, 1050], sag: 200 };
    if (t < L('e1')) return null;
    if (t >= hang + 0.3) return prog(hang + 0.3, hang + 0.8, ease.inOut) >= 1 ? null : { from: [1180, 1560], to: [lerp2(190, 1250, prog(hang + 0.3, hang + 0.8, ease.inOut)), lerp2(HOOK[1] + 70, 1500, prog(hang + 0.3, hang + 0.8, ease.inOut))], sag: 60 };
    { const p = prog(L('e1'), hang, ease.inOut); return { from: [1180, 1560], to: [lerp2(1090, 190, p), lerp2(1000, HOOK[1] + 70, p)], sag: 150 - p * 120 }; }
  };
  const arm = armAt();

  /* the door you leave by, the lid you keep */
  const leave = t >= L('r4') && t < L('e1');
  const lidShown = t >= L('r2') || t < -1; const lidX = t >= L('e1') ? 958 : t >= L('r4') ? -300 : lerp2(1140, panX + 2, lid); const lidY = t >= L('e1') ? 600 + bounce * 4 : panY - 56 - flat * 2 - peek * 64 + (t >= L('r3') ? Math.abs(beat) * 0 : 0);
  const lidRot = t >= L('e1') ? -82 + beat * 2 : peek * -16;
  const cooling = t >= at('stays') && t < L('r4');
    return (
    <AbsoluteFill>
      <PrintStage>
        <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(0 ${DROP})`}>
          <Kitchen burner={1 - offKnob} />
          {/* the pan */}
          <g transform={`translate(${panX} ${panY})`}>
            <path d="M-210 -40 L210 -40 L180 40 Q0 60 -180 40 Z" fill="#3A332A" stroke={c.line} strokeWidth={9} />
            <rect x={200} y={-34} width={210} height={30} rx={14} fill="#3A332A" stroke={c.line} strokeWidth={9} />
          </g>
          {!fireGone && fireK > 0.02 ? <Flame x={panX} y={panY - 46} k={fireK * 1.25} grin={grin} flat={flat} look={t > L('r1') && t < L('r2') ? 1 : -0.3} /> : null}
          {/* water going in */}
          {t >= at('sinks') && t < at('flashes') ? <g>{[0, 1, 2, 3, 4].map((i) => <path key={i} d="M0 0 q-14 34 0 52 a18 18 0 0 0 0 -52" transform={`translate(${lerp2(650, panX + (i - 2) * 22, ((water * 1.6 + i * 0.17) % 1))} ${lerp2(520, panY - 70, ((water * 1.6 + i * 0.17) % 1))})`} fill="#BFDAC9" stroke={c.line} strokeWidth={6} />)}</g> : null}
          {/* the lid */}
          {t >= L('e1') ? <g>
            <path d={`M${HOOK[0] - 26} ${HOOK[1] - 20} H${HOOK[0] + 26} M${HOOK[0]} ${HOOK[1] - 20} V${HOOK[1]} q0 14 -14 12`} fill="none" stroke={c.line} strokeWidth={11} strokeLinecap="round" />
            <g transform={lidHung ? `translate(${HOOK[0]} ${HOOK[1]}) rotate(${swing}) translate(0 118)` : `translate(${lerp2(1040, 170, lidCarry)} ${lerp2(930, HOOK[1] + 118, lidCarry)}) rotate(${(1 - lidCarry) * 40})`}>
              <circle cx={0} cy={-104} r={9} fill={c.line} />
              <circle r={100} fill="#CFC3A4" stroke={c.line} strokeWidth={9} /><circle r={72} fill="none" stroke="#FBF3DD" strokeWidth={7} /><circle r={24} fill={c.accent} stroke={c.line} strokeWidth={8} />
            </g>
            {lidHung ? <g opacity={1 - prog(hang + 0.3, hang + 0.9)}>{[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.4, r0 = 118 + prog(hang, hang + 0.5) * 34; return <path key={i} d={`M${HOOK[0] + Math.cos(a) * r0} ${HOOK[1] + 118 + Math.sin(a) * r0} l${Math.cos(a) * 32} ${Math.sin(a) * 32}`} stroke={c.line} strokeWidth={9} strokeLinecap="round" />; })}</g> : null}
          </g> : null}
          {lidShown && t < L('e1') ? <g transform={`translate(${lidX} ${lidY}) rotate(${lidRot})`}>
            <path d="M-222 0 Q-210 -74 0 -80 Q210 -74 222 0 Z" fill="#CFC3A4" stroke={c.line} strokeWidth={9} />
            <circle cx={0} cy={-96} r={22} fill={c.accent} stroke={c.line} strokeWidth={8} />
            <path d="M-150 -30 Q-60 -62 40 -60" fill="none" stroke="#FBF3DD" strokeWidth={10} strokeLinecap="round" />
          </g> : null}
          {cooling ? <g transform="translate(160 610)"><circle r={92} fill="#F5ECD2" stroke={c.line} strokeWidth={9} /><path d={`M0 0 L0 -72`} stroke={coolP > 0.9 ? c.accent2 : c.accent} strokeWidth={10} strokeLinecap="round" transform={`rotate(${90 - coolP * 180})`} /><circle r={12} fill={c.line} /><text textAnchor="middle" y={58} fontFamily={look.fonts.body} fontWeight={700} fontSize={32} fill={c.line}>{coolP > 0.9 ? 'COOL' : 'HOT'}</text></g> : null}
          {t >= at('tap') - 0.05 && t < at('flashes') ? <g transform={`translate(${arm ? arm.to[0] - 96 : 0} ${arm ? arm.to[1] - 74 : 0}) rotate(${-prog(at('sinks') - 0.2, at('sinks')) * 56})`}>
            <path d="M-38 -70 L38 -70 L30 62 L-30 62 Z" fill="#FBF3DD" opacity={0.92} stroke={c.line} strokeWidth={7} /><path d="M-34 -22 L34 -22 L30 58 L-30 58 Z" fill="#BFDAC9" />
          </g> : null}
          {arm ? <Mitt from={arm.from} to={arm.to} sag={arm.sag} /> : null}
          {boom > 0 && t < at('throws') + 0.15 ? <PrintBurst x={panX + 40} y={panY + 250} r={270 * boom} color="#F0A13A" ink={c.line} text="FWOOSH!" font={look.fonts.display} size={84 * boom} p={1} spikes={15} /> : null}
          {/* the steam throws burning oil out of the pan and at you: gobs that grow as they reach the lens */}
          {thrownOn ? THROW.map(([tx, ty, d], i) => { const p = Math.max(0, Math.min(1, (t - at('throws') + 0.08 - d) / 0.85)); const k = 0.35 + p * p * 3.3; return p <= 0 ? null : <g key={i} transform={`translate(${lerp2(panX, tx, p * p)} ${lerp2(panY - 120, ty, p * p)}) scale(${k}) rotate(${i * 50 + p * 90})`}><path d="M0 -62 C34 -24 46 2 46 22 A46 46 0 0 1 -46 22 C-46 2 -34 -24 0 -62 Z" fill={c.accent} stroke={c.line} strokeWidth={7} /><path d="M0 -14 C14 2 20 12 20 24 A20 20 0 0 1 -20 24 C-20 12 -14 2 0 -14 Z" fill="#F0A13A" /></g>; }) : null}
          </g>
          {/* No: the tap gets a stamp, the pan does not get carried */}
          {t >= at('No') && t < at('sinks') ? <PrintBurst x={540} y={1340} r={270} color={c.panel} ink={c.accent} text="NO WATER" font={look.fonts.display} size={60} p={prog(at('No'), at('No') + 0.2, ease.back)} spikes={16} rot={-6} /> : null}
          {t >= at('carry') && t < L('r3') ? <PrintBurst x={540} y={1340} r={260} color={c.panel} ink={c.accent} text="STAY PUT" font={look.fonts.display} size={62} p={prog(at('carry'), at('carry') + 0.2, ease.back)} spikes={16} rot={6} /> : null}
          {t >= at('peeking') && t < at('stays') ? <PrintBurst x={540} y={1340} r={270} color={c.panel} ink={c.accent} text="NO PEEKING" font={look.fonts.display} size={50} p={prog(at('peeking'), at('peeking') + 0.2, ease.back)} spikes={16} rot={-5} /> : null}
          {/* get out: the door comes across the whole picture, and a little fire shows through the keyhole */}
          {leave && t >= at('out', 1, 'r4') ? <g transform={`translate(${lerp2(1120, 0, prog(at('door', 1, 'r4') - 0.34, at('door', 1, 'r4') + 0.02, ease.back))} 0)`}>
            <rect x={-6} y={-10} width={1100} height={1940} fill="#6F523D" stroke={c.line} strokeWidth={12} />
            {[[70, 480, 400, 460], [570, 480, 440, 460], [70, 1020, 400, 480], [570, 1020, 440, 480]].map(([x, y, w, h], i) => <rect key={i} x={x!} y={y!} width={w!} height={h!} fill="#5D4331" stroke={c.line} strokeWidth={9} />)}
            <circle cx={90} cy={990} r={32} fill={c.accent} stroke={c.line} strokeWidth={8} />
            <circle cx={90} cy={1062} r={13} fill="#F0A13A" stroke={c.line} strokeWidth={5} /><rect x={84} y={1062} width={12} height={32} fill="#F0A13A" stroke={c.line} strokeWidth={4} />
          </g> : null}
          {leave && t >= at('call') ? <PrintBurst x={540} y={1100} r={250} color={c.accent} ink={c.line} text="CALL FOR HELP" font={look.fonts.display} size={50} p={prog(at('call'), at('call') + 0.2, ease.back)} spikes={14} rot={-4} /> : null}
        </svg>
        <RuleCard big="Pan fire!" title="Your hand is on the tap" word="Right now" at={0.02} until={L('r1') - 0.02} />
        <RuleCard n={1} title="No water" at={at('Rule', 1, 'r1')} until={L('r2') - 0.02} />
        <RuleCard n={2} title="Lid on, burner off" at={at('Rule', 1, 'r2')} until={L('r3') - 0.02} />
        <RuleCard n={3} title="The lid stays" at={at('Rule', 1, 'r3')} until={L('r4') - 0.02} />
        <RuleCard n={4} title="Out, door shut" at={at('Rule', 1, 'r4')} until={L('e1') - 0.02} />
        <RuleCard big="Tonight" title="A lid by the stove" word="One small job" at={at('Tonight')} until={99} />
      </PrintStage>
      <Captions />
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
}
const lerp2 = (a: number, b: number, p: number) => a + (b - a) * p;
const THROW: [number, number, number][] = [[120, 760, 0], [980, 620, 0.06], [300, 1160, 0.14], [820, 1120, 0.2], [540, 1400, 0.28], [60, 1320, 0.34], [1040, 1320, 0.4]];
const DROP = 270;
