import React, { useMemo } from 'react';
import type { WesternChartResult } from '../../../services/astrology/westernCalculator';

const R = 320;
const PAD = 40;
const S = (R + PAD) * 2;
const CX = S / 2, CY = S / 2;

const R_SIGN_O = R;
const R_SIGN_I = R - 45;
const R_HOUSE_O = R_SIGN_I;
const R_HOUSE_I = R_SIGN_I - 25;
const R_PLANET = R_HOUSE_I - 40;
const R_INNER = 50;

const Z = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
// Alternating colors for zodiac background to match chiemtinhlaso style
const SIGN_BGS = [
  '#744775', '#334c68', '#425b7a', '#744775', 
  '#744775', '#334c68', '#334c68', '#744775', 
  '#334c68', '#744775', '#334c68', '#425b7a'
];
// Colors for the zodiac symbols
const SIGN_COLORS = [
  '#e74c3c', '#2ecc71', '#e67e22', '#3498db',
  '#e74c3c', '#2ecc71', '#e67e22', '#3498db',
  '#e74c3c', '#2ecc71', '#e67e22', '#3498db'
];

const G: Record<string,string> = { sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂', jupiter:'♃', saturn:'♄', uranus:'♅', neptune:'♆', pluto:'♇', chiron: '⚷', northnode: '☊', partOfFortune: '⊗', vertex: '⪫' };
const GC: Record<string,string> = { 
  sun: '#e74c3c', moon: '#bdc3c7', mercury: '#2ecc71', venus: '#e67e22',
  mars: '#e74c3c', jupiter: '#9b59b6', saturn: '#e67e22', uranus: '#2ecc71',
  neptune: '#3498db', pluto: '#bdc3c7', chiron: '#bdc3c7', northnode: '#9b59b6',
  partOfFortune: '#bdc3c7', vertex: '#bdc3c7'
};

const AC: Record<string,string> = { conjunction:'#bdc3c7', opposition:'#e74c3c', trine:'#3498db', square:'#e056fd', sextile:'#2ecc71', quincunx: '#f39c12' };

const nd = (v:number) => ((v%360)+360)%360;
export const longitudeToChartAngleDegrees = (longitude:number, ascendant:number) =>
  nd(180 - (longitude - ascendant));
const la = (longitude:number, ascendant:number) =>
  longitudeToChartAngleDegrees(longitude, ascendant)*Math.PI/180;
const xy = (r:number,a:number) => ({ x:CX+r*Math.cos(a), y:CY+r*Math.sin(a) });

export const WesternWheelChart: React.FC<{ result: WesternChartResult }> = ({ result }) => {
  // Combine planets and other points for the chart wheel
  const allPoints = [...result.planets];
  
  if (result.partOfFortune) {
    allPoints.push({
      body: 'partOfFortune',
      tropicalLongitude: result.partOfFortune.longitude,
      sign: result.partOfFortune.sign,
      signIndex: result.partOfFortune.signIndex,
      degreeInSign: result.partOfFortune.longitude % 30,
      house: 0, retrograde: false, siderealLongitude: 0, nakshatra: '', nakshatraIndex: 0, pada: 0, ra: 0, dec: 0, distance: 0
    });
  }

  const pl = useMemo(() => {
    const list = allPoints.filter(p=>G[p.body]).map(p=>({
      b: p.body, a: la(p.tropicalLongitude, result.ascendant), 
      di: p.degreeInSign, sig: p.sign, h: p.house,
      rx: p.retrograde
    }));
    
    // Spread overlapping planets visually
    const sorted = [...list].sort((a,b) => a.a - b.a);
    for(let i=0; i<sorted.length; i++) {
      for(let j=i+1; j<sorted.length; j++) {
        const diff = Math.abs(sorted[i].a - sorted[j].a);
        if (diff < 0.08) {
          // Adjust radius to avoid collision
          (sorted[j] as any).radiusOffset = ((sorted[j] as any).radiusOffset || 0) - 25;
        } else if (diff > 0.15) {
          break; // Optimization
        }
      }
    }
    return sorted;
  }, [allPoints, result.ascendant]);

  const cu = useMemo(() => result.houses.map((h,index)=>{
    const a = la(h.longitude, result.ascendant);
    const next = result.houses[(index+1)%result.houses.length];
    const midLongitude = nd(h.longitude + nd(next.longitude-h.longitude)/2);
    return {
      i: h.index, a,
      o: xy(R_HOUSE_O, a), n: xy(R_INNER, a),
      l: xy((R_HOUSE_O+R_HOUSE_I)/2, la(midLongitude, result.ascendant)),
    };
  }), [result]);

  const aa = la(result.ascendant, result.ascendant);
  const ma = la(result.midheaven, result.ascendant);
  const ai = Math.floor(((result.ascendant%360)+360)%360/30);

  const al = useMemo(() => {
    const mt = ['conjunction','opposition','trine','square','sextile', 'quincunx'];
    return result.aspects.filter(a=>mt.includes(a.type)&&G[a.planetA]&&G[a.planetB]).map(asp=>{
      const pA=pl.find(p=>p.b===asp.planetA), pB=pl.find(p=>p.b===asp.planetB);
      if(!pA||!pB) return null;
      const rA = R_PLANET + ((pA as any).radiusOffset || 0) - 15;
      const rB = R_PLANET + ((pB as any).radiusOffset || 0) - 15;
      const a=xy(rA,pA.a), b=xy(rB,pB.a);
      return { t:asp.type, x1:a.x, y1:a.y, x2:b.x, y2:b.y };
    }).filter(Boolean);
  }, [result.aspects, pl]);

  return (
    <div style={{display:'flex',justifyContent:'center'}} data-western-chart-export className="bg-[#152336] p-4 sm:p-8 rounded-xl shadow-lg border border-[#374e68]/40">
      <svg viewBox={`0 0 ${S} ${S}`} style={{width:'100%',maxWidth:S}} role="img" aria-label="Western Birth Chart">
        
        {/* Outer Zodiac Ring */}
        {Array.from({length:12},(_,i)=>{
          const a1=la(i*30,result.ascendant), a2=la((i+1)*30,result.ascendant);
          const p1=xy(R_SIGN_O,a1), p2=xy(R_SIGN_O,a2), p3=xy(R_SIGN_I,a2), p4=xy(R_SIGN_I,a1);
          const d=`M${p1.x},${p1.y} A${R_SIGN_O},${R_SIGN_O} 0 0 0 ${p2.x},${p2.y} L${p3.x},${p3.y} A${R_SIGN_I},${R_SIGN_I} 0 0 1 ${p4.x},${p4.y} Z`;
          const mid=xy((R_SIGN_O+R_SIGN_I)/2,la((i+0.5)*30,result.ascendant));
          return (
            <g key={'sg'+i}>
              <path d={d} fill={SIGN_BGS[i]} stroke="#213247" strokeWidth="1" />
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize="22" fill={SIGN_COLORS[i]}>{Z[i]}</text>
            </g>
          );
        })}

        {/* Detailed Zodiac Ticks */}
        {Array.from({length:360},(_,i)=>{
          const a=la(i,result.ascendant);
          const isDec = i % 10 === 0;
          const isDeg = i % 5 === 0;
          const r1 = R_SIGN_I;
          const r2 = isDec ? r1 + 8 : isDeg ? r1 + 5 : r1 + 3;
          const p1 = xy(r1, a);
          const p2 = xy(r2, a);
          return <line key={`t${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#fff" strokeWidth={isDec ? 1 : 0.5} opacity={isDec ? 0.8 : 0.4} />;
        })}

        {/* House Ring */}
        <circle cx={CX} cy={CY} r={R_HOUSE_O} fill="none" stroke="#4a6984" strokeWidth="1" />
        <path d={`M ${CX+R_HOUSE_O} ${CY} A ${R_HOUSE_O} ${R_HOUSE_O} 0 1 1 ${CX-R_HOUSE_O} ${CY} A ${R_HOUSE_O} ${R_HOUSE_O} 0 1 1 ${CX+R_HOUSE_O} ${CY} Z`} fill="#654a2a" opacity="0.4" />
        <circle cx={CX} cy={CY} r={R_HOUSE_I} fill="none" stroke="#4a6984" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R_HOUSE_I} fill="#152336" /> {/* Inner background */}

        {/* house cusp lines and numbers */}
        {cu.map(h=>{
          return <g key={'h'+h.i}>
            <line x1={h.o.x} y1={h.o.y} x2={h.n.x} y2={h.n.y} stroke="#4a6984" strokeWidth="1" opacity={0.8}/>
            <text x={h.l.x} y={h.l.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#f1c40f">{h.i}</text>
          </g>;
        })}

        {/* ASC & MC axes */}
        <line x1={xy(R_HOUSE_O,aa).x} y1={xy(R_HOUSE_O,aa).y} x2={xy(R_HOUSE_O,aa+Math.PI).x} y2={xy(R_HOUSE_O,aa+Math.PI).y} stroke="#e74c3c" strokeWidth="2" opacity={0.8}/>
        <line x1={xy(R_HOUSE_O,ma).x} y1={xy(R_HOUSE_O,ma).y} x2={xy(R_HOUSE_O,ma+Math.PI).x} y2={xy(R_HOUSE_O,ma+Math.PI).y} stroke="#3498db" strokeWidth="1.5" opacity={0.6} strokeDasharray="6,3"/>

        {/* Planets Area Background */}
        <circle cx={CX} cy={CY} r={R_HOUSE_I} fill="none" stroke="#4a6984" strokeWidth="0.5" opacity={0.3}/>

        {/* aspect lines */}
        {al.map((l,i)=>{
          if(!l) return null;
          return <line key={'al'+i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={AC[l.t]||'#999'} strokeWidth={l.t === 'conjunction' ? "0" : "1"} opacity={0.6}
            strokeDasharray={l.t==='opposition'?'4,4':l.t==='square'?'':l.t==='quincunx'?'2,2':undefined}/>;
        })}

        {/* Center circle */}
        <circle cx={CX} cy={CY} r={R_INNER} fill="#152336" stroke="#4a6984" strokeWidth="1" />

        {/* planets with degree labels */}
        {pl.map(p=>{
          const radOffset = (p as any).radiusOffset || 0;
          const ps = xy(R_PLANET + radOffset, p.a);
          const degPos = xy(R_PLANET + radOffset - 22, p.a);
          const rxPos = xy(R_PLANET + radOffset + 14, p.a + 0.04);
          const fs = ['sun','moon'].includes(p.b) ? 22 : 18;
          
          const d = Math.floor(p.di);
          const m = Math.floor((p.di-d)*60).toString().padStart(2,'0');

          return <g key={p.b}>
            {/* Guide line from planet to house ring */}
            <line x1={ps.x} y1={ps.y} x2={xy(R_HOUSE_I, p.a).x} y2={xy(R_HOUSE_I, p.a).y} stroke="#4a6984" strokeWidth="0.5" strokeDasharray="2,2" opacity={0.5} />
            <text x={ps.x} y={ps.y} textAnchor="middle" dominantBaseline="central" fontSize={fs}
              fill={GC[p.b]||'#fff'} fontWeight="bold" style={{userSelect:'none', textShadow: '0 0 2px #000'}}>{G[p.b]}</text>
            <text x={degPos.x} y={degPos.y} textAnchor="middle" dominantBaseline="central" fontSize="10"
              fontWeight="normal" fill="#bdc3c7">{d}°{m}'</text>
            {p.rx && <text x={rxPos.x} y={rxPos.y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="#e74c3c">Rx</text>}
          </g>;
        })}

        {/* ASC label in center */}
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill="#fff" opacity={0.8}>ASC {Z[ai]}</text>
      </svg>
    </div>
  );
};

export default WesternWheelChart;
