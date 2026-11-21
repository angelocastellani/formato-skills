import { useMemo, type ReactNode } from 'react';
import { interpolate } from 'remotion';
import { Captions, Grain, Vignette, fmt, rng, useFilm } from '@pack/kit';
import {
  Balance, Cam, Globe, Ink, Label, Leader, Mass, PlateGround, PlateHead, PlateStage, PlateStamp, Ruler, Runner, Sheet, Stroke, Winds, along, capD, circleD, clamp01, declination, lerp, orthoProjection, polyline, routeOn, smooth, usePlate, type Pt,
} from '@pack/kit/formats/field-guide';

// The tern, drawn in its own coordinates (about 1000 x 700). Everything hangs off the wing beat, so it can flap while it draws.
const PIVOT: Pt = [640, 410]; const FAR: Pt = [700, 395];
const NEAR_LEAD: Pt[] = [[692, 392], [650, 300], [575, 205], [460, 125], [320, 65], [185, 30]];
const NEAR_TRAIL: Pt[] = [[185, 30], [285, 98], [372, 165], [462, 250], [540, 345], [592, 438]];
const FAR_LEAD: Pt[] = [[735, 372], [770, 270], [802, 176], [842, 94], [905, 26]];
const FAR_TRAIL: Pt[] = [[905, 26], [806, 128], [742, 216], [690, 298], [652, 386]];
const BODY: Pt[] = [[846, 338], [815, 316], [775, 318], [742, 342], [690, 372], [600, 402], [480, 452], [400, 486], [405, 505], [480, 506], [570, 492], [680, 458], [765, 408], [825, 368], [848, 352]];
const CAP: Pt[] = [[848, 340], [815, 316], [775, 318], [742, 342], [738, 364], [775, 354], [815, 353], [848, 348]];
const TAIL = 'M400 486C330 500 200 530 70 572C200 552 310 526 360 526C300 566 180 626 92 684C200 640 320 580 408 505Z';
const BILL = 'M846 337Q882 332 914 339Q882 347 848 352Z';
const BELLY = 'M404 503C480 512 570 500 680 462C730 440 770 415 826 368C770 395 690 430 600 446C530 460 460 480 404 503Z';
const FOOT = 'M470 505l-6 26l-18 12M470 505l6 28l-14 16';

const rotate = (p: Pt, o: Pt, a: number): Pt => { const x = p[0] - o[0], y = p[1] - o[1], c = Math.cos(a), s = Math.sin(a); return [o[0] + c * x - s * y, o[1] + s * x + c * y]; };
function bend(pts: Pt[], o: Pt, a: number) { return pts.map((p) => rotate(p, o, a * Math.pow(Math.hypot(p[0] - o[0], p[1] - o[1]) / 560, 1.2))); }
function sampled(p: Pt[], n: number): Pt[] {
  const out: Pt[] = []; const N = p.length - 1; const q = (i: number) => p[Math.max(0, Math.min(N, i))]!;
  for (let s = 0; s <= n; s++) {
    const f = (s / n) * N, i = Math.min(N - 1, Math.floor(f)), u = f - i, a = q(i - 1), b = q(i), c = q(i + 1), e = q(i + 2), u2 = u * u, u3 = u2 * u;
    const cr = (k: 0 | 1) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - e[k]) * u2 + (-a[k] + 3 * b[k] - 3 * c[k] + e[k]) * u3);
    out.push([cr(0), cr(1)]);
  }
  return out;
}
const chords = (lead: Pt[], trail: Pt[], n: number, from: number, to: number, p: number) => {
  const L = sampled(lead, n), T = sampled([...trail].reverse(), n); let d = ''; const stop = Math.floor(n * clamp01(p));
  for (let i = 0; i <= stop; i++) { const a = L[i]!, b = T[i]!; d += `M${(a[0] + (b[0] - a[0]) * from).toFixed(1)} ${(a[1] + (b[1] - a[1]) * from).toFixed(1)}L${(a[0] + (b[0] - a[0]) * to).toFixed(1)} ${(a[1] + (b[1] - a[1]) * to).toFixed(1)}`; }
  return d;
};

/** The hero, full size. `t0` is when the drawing of it starts; it keeps flapping whatever else happens. */
function Tern({ x, y, s, flap, t0, r = 0 }: { x: number; y: number; s: number; flap: number; t0: number; r?: number }) {
  const { prog } = useFilm(); const k = usePlate();
  const nl = bend(NEAR_LEAD, PIVOT, -flap), nt = bend(NEAR_TRAIL, PIVOT, -flap), fl = bend(FAR_LEAD, FAR, flap), ft = bend(FAR_TRAIL, FAR, flap);
  const near = smooth([...nl, ...nt.slice(1)], true), far = smooth([...fl, ...ft.slice(1)], true);
  const box: [number, number, number, number] = [60, 0, 880, 720];
  const hatch = k.tech === 'hatch'; const fan = prog(t0 + 1.0, t0 + 3.0, (u) => u);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)}) translate(-500 -340)`}>
      <path d={far} fill={k.paper} opacity={prog(t0 + 0.1, t0 + 0.6)} />
      {hatch ? <Stroke d={chords(fl, ft, 34, 0.05, 0.92, 1)} at={t0 + 1.2} dur={0.8} w={1.3} opacity={0.75} /> : <Mass d={far} at={t0 + 0.4} dur={0.9} tone="pale" box={box} origin={[720, 300]} />}
      <Stroke d={far} at={t0 + 0.05} dur={0.7} w={2.6} />
      <Mass d={TAIL} at={t0 + 0.3} dur={0.5} tone="paper" box={box} origin={[400, 500]} />
      <Stroke d={TAIL} at={t0 + 0.25} dur={0.7} w={2.6} />
      <path d={smooth(BODY, true)} fill={k.paper} opacity={prog(t0, t0 + 0.5)} />
      <Mass d={BELLY} at={t0 + 1.2} dur={1.8} tone="pale" box={[390, 340, 450, 180]} angle={-62} origin={[450, 500]} />
      <Stroke d={smooth(BODY, true)} at={t0} dur={0.8} w={3} />
      <Stroke d={FOOT} at={t0 + 0.85} dur={0.3} w={3} tone="accent" />
      <path d={near} fill={k.paper} opacity={prog(t0 + 0.2, t0 + 0.7)} />
      {hatch ? <path d={chords(nl, nt, 74, 0.04, 0.88, fan)} fill="none" stroke={k.strong} strokeWidth={1.35} opacity={0.82} /> : <Mass d={near} at={t0 + 0.5} dur={1.3} tone="mid" box={box} origin={[620, 380]} />}
      <Stroke d={chords(nl, nt, 13, 0.3, 1, 1)} at={t0 + 0.8} dur={0.9} w={1.8} />
      <Stroke d={near} at={t0 + 0.15} dur={0.8} w={3.2} />
      <Mass d={smooth(CAP, true)} at={t0 + 0.6} dur={0.7} tone="strong" box={[730, 305, 125, 65]} origin={[800, 330]} gap={3} />
      <Mass d={BILL} at={t0 + 0.75} dur={0.4} tone="accent" box={[840, 325, 80, 32]} origin={[846, 345]} />
      <path d={BILL} fill={k.accent} opacity={prog(t0 + 0.8, t0 + 1.1)} />
      <Stroke d={BILL} at={t0 + 0.7} dur={0.35} w={2.2} />
      <circle cx={816} cy={336} r={5} fill={k.paper} opacity={prog(t0 + 1, t0 + 1.2)} />
    </g>
  );
}

/** The same bird, far away: solid, fast wing beat, pointing where it flies. */
function Glyph({ x, y, s, flap, heading = 0, flip = false }: { x: number; y: number; s: number; flap: number; heading?: number; flip?: boolean }) {
  const k = usePlate();
  const near = smooth([...bend(NEAR_LEAD, PIVOT, -flap), ...bend(NEAR_TRAIL, PIVOT, -flap).slice(1)], true); const far = smooth([...bend(FAR_LEAD, FAR, flap), ...bend(FAR_TRAIL, FAR, flap).slice(1)], true);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((heading * 180) / Math.PI).toFixed(1)}) scale(${s.toFixed(3)} ${(flip ? -s : s).toFixed(3)}) translate(-620 -420)`}>
      <g fill={k.paper} stroke={k.paper} strokeWidth={36} strokeLinejoin="round"><path d={far} /><path d={TAIL} /><path d={smooth(BODY, true)} /><path d={near} /></g>
      <path d={far} fill={k.strong} /><path d={TAIL} fill={k.strong} /><path d={smooth(BODY, true)} fill={k.strong} /><path d={near} fill={k.strong} /><path d={BILL} fill={k.accent} />
    </g>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const monthOf = (doy: number) => MONTHS[Math.floor((((doy - 1) % 365) + 365) % 365 / 30.42) % 12]!;
// The route, after Egevang et al. 2010 as a sketch, not plotted from tracks. South along Africa; home by south-west Africa, across at the equator, up the west.
const SOUTH: [number, number][] = [[74, -20], [66, -25], [55, -32], [47, -35], [38, -28], [28, -20], [15, -19], [0, -14], [-15, -5], [-30, 2], [-45, -3], [-58, -10], [-66, -22]];
const HOME: [number, number][] = [[-66, -22], [-55, -6], [-40, 4], [-25, 8], [-12, 0], [-2, -18], [6, -32], [18, -42], [30, -44], [42, -39], [47, -35], [58, -32], [68, -24], [74, -20]];
// Named, never outlined: the globe has no coasts until real ones are added (see plate-land.ts).
const PLACES: [string, number, number][] = [['Greenland', 70, -40], ['Europe', 50, 12], ['Africa', 8, 18], ['Atlantic', 12, -38], ['S. America', -14, -62], ['Antarctica', -78, -20]];
const LEGS = 6; const AMP = [120, -120, 200, -200, 280, -280];

export default function Scenes() {
  const { at, line, t, prog, ease, look } = useFilm(); const k = usePlate(); const c = look.color;
  const a = useMemo(() => {
    const s = (id: string) => line(id).s, e = (id: string) => line(id).e;
    return { a2: s('a2'), a3: s('a3'), a4: s('a4'), a4e: e('a4'), a5: s('a5'), a5e: e('a5'), a6: s('a6'), a7: s('a7'), a7e: e('a7'), a8: s('a8'), a8e: e('a8'), a9: s('a9'), a10: s('a10'), a10e: e('a10'), a11: s('a11'), a12: s('a12'), a12e: e('a12'), a13: s('a13'), a13e: e('a13'), a14: s('a14') };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const steps = [
    { at: -1, num: 0, title: 'No more winter' },
    { at: a.a3, num: 1, title: 'The Arctic tern', word: 'Plate one' },
    { at: a.a6, num: 2, title: 'The route', word: 'Plate two' },
    { at: a.a11, num: 3, title: 'The bill', word: 'Plate three' },
    { at: a.a14, num: 4, title: 'A coat', word: 'Plate four' },
  ];

  // The calendar runs on the words, and the real tilt of the Earth follows from it.
  const doy = interpolate(t, [a.a4, a.a5, a.a5e, a.a7, a.a7e, a.a8e, a.a9 + 0.8, a.a10, a.a10e], [172, 172, 232, 240, 292, 345, 355, 355, 535], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const decl = declination(doy);

  // Wing beat: slow while it is being drawn, big on "fly", quick once it is far away.
  const big = prog(a.a2, a.a2 + 0.3) * (1 - prog(a.a3, a.a3 + 0.6) * 0.5);
  const flap = 0.08 + (0.2 + 0.26 * big) * Math.sin(t * 2 * Math.PI * (0.8 + 0.5 * big));
  const fast = 0.1 + 0.5 * Math.sin(t * 2 * Math.PI * 3.6);

  // The globe arrives under the bird, then shrinks to make room for the Moon.
  const out = prog(a.a11, a.a11 + 0.9, ease.inOut); const gx = 540, gy = lerp(835, 1262, out), gr = lerp(422, 106, out);
  const spin = -20 - Math.max(0, t - a.a11 - 0.4) * 34 + (1 - prog(a.a4, a.a6 - 0.1, ease.inOut)) * -360; // it turns until the route needs it still, and again once the route has gone
  const proj = orthoProjection(gx, gy, gr, -20);
  const south = routeOn(proj, SOUTH), home = routeOn(proj, HOME);
  const stopAt = 0.25;
  const pS = interpolate(t, [a.a7, at("month's", 1, 'a7') - 0.2, at('eat', 1, 'a7') + 0.1, at('Antarctica', 1, 'a8')], [0, stopAt, stopAt, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pH = interpolate(t, [a.a10, a.a10e], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut });
  const nest = proj(74, -20); const stop = proj(47, -35); const ant = proj(-66, -22);
  const S = along(south, pS), H = along(home, pH); const routeFade = 1 - prog(a.a11, a.a11 + 0.4);

  // The bird: from the portrait down to its nest on the globe, then along the route.
  const shrink = prog(a.a4, a.a4 + 1, ease.inOut); const leaves = prog(at('leaves', 1, 'a5') - 0.1, a.a7);
  const rise = prog(a.a3, a.a3 + 0.7, ease.inOut);
  const tx = lerp(540, nest.x, shrink), ty = lerp(lerp(760, 596, rise), nest.y - 26, shrink), ts = lerp(lerp(1.04, 0.86, rise), 0.13, shrink);

  // Plate three: the same distance, drawn out to the Moon.
  const moonC: Pt = [540, 612]; const moonR = 50;
  const petals = useMemo(() => {
    const y0 = 1262 - 106 - 6, y1 = 612 + 50 + 4; const out: Pt[] = [];
    for (let i = 0; i < LEGS; i++) for (let u = 0; u <= 40; u++) { const f = u / 40; const y = i % 2 === 0 ? lerp(y0, y1, f) : lerp(y1, y0, f); out.push([540 + AMP[i]! * Math.sin(Math.PI * f), y]); }
    return out;
  }, []);
  // One year is really this short a stretch of the line (71,000 of 2.4 million km). Then the years run.
  const oneYear = 71000 / 2400000;
  const pM = interpolate(t, [at('seventy', 1, 'a12') - 0.1, at('year', 1, 'a12'), at('thirty', 1, 'a12'), at('back', 1, 'a13') + 0.15], [0, oneYear, oneYear, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const M = along(petals, pM);
  const km = Math.round(pM * 2400000);
  const year = pM > 0 ? Math.max(1, Math.floor(1 + ((pM - oneYear) / (1 - oneYear)) * 29)) : 0;
  const trips = Math.floor(pM * 3 + 1e-6);

  const toCoat = prog(a.a14 - 0.05, a.a14 + 0.25);
  const camS = 1 + 0.03 * prog(0, a.a4, (x) => x) - 0.03 * prog(a.a4, a.a4 + 0.5) + 0.05 * prog(a.a4 + 0.5, a.a11, (x) => x) - 0.05 * out + 0.14 * prog(a.a9, a.a9 + 1.5, ease.inOut) * (1 - prog(a.a10, a.a10 + 0.6, ease.inOut));

  // Snow until the word that ends it.
  const r = useMemo(() => { const g = rng(31); return Array.from({ length: 90 }, () => ({ x: g() * 1080, y: g() * 1400, v: 90 + g() * 110, s: 2.5 + g() * 3.5, ph: g() * 6.28 })); }, []);
  const snow = 1 - prog(a.a2, a.a3);

  return (
    <>
      <PlateGround />
      <PlateStage>
        <Sheet at={0} />
        {snow > 0 ? <g opacity={snow}>{r.map((f, i) => <circle key={i} cx={f.x + Math.sin(t * 1.3 + f.ph) * 18} cy={270 + ((f.y + t * f.v) % 1110)} r={f.s} fill={k.fig} opacity={0.5} />)}</g> : null}
        <Cam cx={540} cy={800} s={camS}>
          <Ink>
            {t >= a.a4 && t < a.a14 + 0.3 ? (
              <g opacity={1 - toCoat}>
                <Globe cx={gx} cy={gy} r={gr} lon0={spin} decl={decl} at={a.a4 + 0.05} dur={1.1} nightAt={a.a4 + 0.5} rays={out < 0.2} detail={out > 0.5 ? 0.5 : 1} />
                {t < a.a11 ? <Winds proj={proj} at={a.a7} opacity={0.2 + 0.4 * prog(a.a10, a.a10 + 0.6)} tone={k.tech === 'hatch' ? 'pale' : 'line'} /> : null}
                {/* The light that never sets: the top of the world in June, the bottom by December */}
                {t < a.a5e + 0.5 ? <g opacity={1 - prog(at('dark', 1, 'a5'), at('dark', 1, 'a5') + 0.7)}><Mass d={capD(gx, gy, gr - 1, 66.6)} at={at('daylight', 1, 'a4')} dur={0.5} tone="accent" box={[gx - gr, gy - gr, 2 * gr, 0.42 * gr]} origin={[gx, gy - gr]} /></g> : null}
                {t >= a.a8 && t < a.a11 ? <g opacity={1 - prog(a.a10, a.a10 + 0.5)}><Mass d={capD(gx, gy, gr - 1, -66.6)} at={at('stopped', 1, 'a8')} dur={0.5} tone="accent" box={[gx - gr, gy + 0.9 * gr, 2 * gr, 0.2 * gr]} origin={[gx, gy + gr]} /></g> : null}
                <g opacity={routeFade}>
                  {pS > 0 ? <g><path d={S.d} fill="none" stroke={k.paper} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" /><path d={S.d} fill="none" stroke={k.accent} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" /></g> : null}
                  {pH > 0 ? <g><path d={H.d} fill="none" stroke={k.paper} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /><path d={H.d} fill="none" stroke={k.accent} strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14 12" /></g> : null}
                </g>
              </g>
            ) : null}
            {/* Plate one, the balance */}
            {t < a.a4 + 0.6 ? (
              <g opacity={1 - prog(a.a4, a.a4 + 0.35)}>
                <Balance cx={540} cy={962} len={290} at={at('About', 1, 'a3') - 0.1} tilt={11 * prog(at('lighter', 1, 'a3'), at('lighter', 1, 'a3') + 0.5, ease.back) + Math.sin(t * 2.2) * 0.8}
                  left={<g><Glyph x={0} y={-16} s={0.1} flap={0.1 + 0.3 * Math.sin(t * 6)} /></g>}
                  right={<g><rect x={-30} y={-78} width={60} height={110} rx={10} fill={k.paper} stroke={k.line} strokeWidth={4} /><rect x={-22} y={-68} width={44} height={84} fill={k.strong} opacity={0.82} /></g>} />
              </g>
            ) : null}
            {/* Plate three, the Moon */}
            {t >= a.a11 + 0.2 && t < a.a14 + 0.3 ? (
              <g opacity={1 - toCoat}>
                <Mass d={circleD(moonC[0], moonC[1], moonR)} at={a.a11 + 0.4} dur={0.7} tone={k.tech === 'brush' ? 'accent' : 'pale'} box={[moonC[0] - moonR, moonC[1] - moonR, 2 * moonR, 2 * moonR]} under />
                <Stroke d={circleD(moonC[0], moonC[1], moonR)} at={a.a11 + 0.3} dur={0.6} w={3} />
                {pM > 0 ? <path d={M.d} fill="none" stroke={k.accent} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" /> : null}
                <Ruler at={a.a11 + 0.5} dur={0.9} from={[998, 1320]} to={[998, 500]} ticks={30} major={10} len={22} />
                {pM > 0 ? <path d={`M998 1320L998 ${(1320 - 820 * clamp01(year / 30)).toFixed(1)}`} fill="none" stroke={k.accent} strokeWidth={9} /> : null}
              </g>
            ) : null}
            {/* Plate four */}
            {t >= a.a14 ? <Coat t0={a.a14 + 0.02} /> : null}
          </Ink>
          {/* The hero: portrait, then far away */}
          {shrink < 0.97 ? <Ink><Tern x={tx} y={ty} s={ts} flap={flap} t0={-0.3} /></Ink> : null}
          {shrink >= 0.97 && t < a.a7 ? <Glyph x={nest.x + Math.sin(t * 1.3) * 70 * (1 - leaves)} y={nest.y - 34 + Math.cos(t * 1.3) * 14 * (1 - leaves)} s={0.19} flap={leaves > 0 ? fast : 0.2 + 0.3 * Math.sin(t * 9)} flip={Math.cos(t * 1.3) < 0} /> : null}
          {t >= a.a7 && t < a.a10 ? <g opacity={routeFade}><Glyph x={S.tip[0]} y={S.tip[1]} s={0.19} flap={Math.abs(pS - stopAt) < 0.002 ? 0.1 + 0.2 * Math.sin(t * 8) : fast} heading={S.heading} flip={Math.abs(S.heading) > Math.PI / 2} /></g> : null}
          {t >= a.a10 && t < a.a11 + 0.4 ? <g opacity={routeFade}><Glyph x={H.tip[0]} y={H.tip[1]} s={0.19} flap={fast} heading={H.heading} flip={Math.abs(H.heading) > Math.PI / 2} /></g> : null}
          {pM > 0 && t < a.a14 + 0.3 ? <g opacity={1 - toCoat}><Glyph x={M.tip[0]} y={M.tip[1]} s={0.11} flap={fast} heading={M.heading} flip={Math.abs(M.heading) > Math.PI / 2} /></g> : null}
          {t >= a.a14 ? <Glyph x={lerp(-120, 1220, prog(a.a14 + 0.1, a.a14 + 2.6, (x) => x))} y={lerp(440, 300, prog(a.a14 + 0.1, a.a14 + 2.6, (x) => x))} s={0.13} flap={fast} /> : null}

          {/* Labels stay crisp: they are outside the boil */}
          {t < a.a4 ? (
            <g opacity={1 - prog(a.a4 - 0.1, a.a4 + 0.2)}>
              <Label text="100 g" at={at('hundred', 1, 'a3')} x={250 - 8} y={1262} anchor="middle" size={k.labelSize + 6} />
              <Label text="A phone, 170 g" at={at('lighter', 1, 'a3')} x={830} y={1262} anchor="middle" size={k.labelSize + 2} />
            </g>
          ) : null}
          {t >= a.a4 && t < a.a6 ? <g opacity={1 - prog(a.a6 - 0.2, a.a6)}><Leader text="No night" at={at('daylight', 1, 'a4')} from={[proj(82, -20).x, proj(82, -20).y]} to={[800, 372]} /></g> : null}
          {t >= a.a4 + 0.6 && t < a.a11 ? <g opacity={routeFade}>{PLACES.map(([name, lat, lon], i) => { const q = proj(lat, lon); return <Label key={name} text={name} at={a.a6 + 0.1 + i * 0.09} x={q.x} y={q.y} anchor="middle" size={k.labelSize - 2} italic />; })}</g> : null}
          {t >= at('second', 1, 'a9') && t < a.a10 + 0.4 ? <g opacity={1 - prog(a.a10, a.a10 + 0.4)}><Mass d={capD(gx, gy, gr - 1, 66.6)} at={at('second', 1, 'a9')} dur={0.5} tone="accent" box={[gx - gr, gy - gr, 2 * gr, 0.42 * gr]} origin={[gx, gy - gr]} /><Leader text="Summer one" at={at('second', 1, 'a9') + 0.1} from={[proj(78, -20).x, proj(78, -20).y]} to={[800, 372]} /></g> : null}
          {t >= a.a7 && t < a.a8 + 0.4 ? <g opacity={1 - prog(a.a8, a.a8 + 0.4)}><Leader text="A month at sea" at={at("month's", 1, 'a7')} from={[stop.x, stop.y]} to={[620, 378]} /></g> : null}
          {t >= a.a8 && t < a.a10 ? <Leader text={t < at('second', 1, 'a9') ? 'No sunset' : 'Summer two'} at={at('stopped', 1, 'a8')} from={[ant.x, ant.y]} to={[740, 1330]} /> : null}
          {t >= a.a10 && t < a.a11 ? <Leader text="Home: an S" at={at('giant', 1, 'a10')} from={[proj(28, -44).x, proj(28, -44).y]} to={[310, 470]} /> : null}
          {t >= a.a11 + 0.6 && t < a.a14 ? (
            <g opacity={1 - toCoat}>
              <Leader text="The Moon" at={a.a11 + 0.9} from={[moonC[0] + 42, moonC[1] - 28]} to={[690, 548]} />
              <Label text="Years" at={a.a11 + 1} x={984} y={480} anchor="end" size={k.labelSize - 4} />
              <Leader text="Home" at={a.a11 + 1.1} from={[gx + 76, gy - 72]} to={[760, 1190]} />
              <Label text="Not to scale" at={a.a11 + 1.3} x={k.pad} y={1372} size={k.labelSize - 4} />
            </g>
          ) : null}
          {t >= a.a14 + 0.5 ? <Label text="Distance: 0 km" at={a.a14 + 0.75} x={540} y={1268} anchor="middle" /> : null}
        </Cam>
      </PlateStage>
      <PlateHead steps={steps} />
      <PlateStamp steps={steps} />
      {t >= a.a4 + 0.4 && t < a.a11 ? <Runner value={t >= a.a4 ? monthOf(doy) : ''} x={k.pad} y={296} size={look.id === 'guide-swiss' ? 88 : 78} /> : null}
      {t >= a.a4 + 0.4 && t < a.a11 ? <Runner value={t < at('second', 1, 'a9') ? '1' : '2'} label={at('second', 1, 'a9') <= t ? 'summers' : 'summer'} x={k.pad} y={1180} size={100 + 150 * prog(at('second', 1, 'a9'), at('second', 1, 'a9') + 0.4, ease.back) * (1 - prog(a.a10 - 0.1, a.a10 + 0.5, ease.inOut))} color={t >= at('second', 1, 'a9') ? c.accent : undefined} /> : null}
      {t >= a.a11 + 0.3 && t < a.a14 ? (
        <>
          <Runner value={fmt(km)} unit="km" x={k.pad} y={296} size={look.id === 'guide-swiss' ? 96 : 104} label={year > 0 ? `Year ${year}${pM >= 1 ? '+' : ''}` : ' '} />
          <Runner value={trips} label="Moon trips" x={k.pad} y={1130} size={110} color={trips >= 3 ? c.accent : undefined} />
        </>
      ) : null}
      <Captions />
      <Vignette />
      <Grain />
    </>
  );
}

function Coat({ t0 }: { t0: number }) {
  const body: Pt[] = [[470, 362], [336, 420], [272, 790], [346, 820], [386, 560], [368, 1184], [712, 1184], [694, 560], [734, 820], [808, 790], [744, 420], [610, 362], [540, 540]];
  const d = polyline(body, true);
  return (
    <g>
      <Stroke d="M556 322C582 302 576 262 548 262C528 262 522 280 530 292M556 322L540 352L330 428M540 352L750 428" at={t0} dur={0.4} w={3.4} />
      <Mass d={d} at={t0 + 0.15} dur={1.2} tone="mid" box={[260, 350, 560, 850]} angle={-52} origin={[540, 420]} under />
      <Stroke d={d} at={t0 + 0.05} dur={0.7} w={3.6} />
      <Stroke d="M470 362L500 650L540 540L580 650L610 362M540 540L540 1184M386 560L372 410M694 560L708 410M408 900L500 900L500 960M672 900L580 900L580 960" at={t0 + 0.4} dur={0.7} w={2.6} />
      {[700, 800, 900, 1000].map((y, i) => <Stroke key={y} d={circleD(562, y, 10)} at={t0 + 0.6 + i * 0.06} dur={0.2} w={2.4} tone="accent" />)}
    </g>
  );
}
