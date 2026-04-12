import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Objekt } from '../types';
import { ObjektCard } from './ObjektCard';
import { ARTISTS } from '../constants';
import { cn } from '../lib/utils';

interface UnitGridCompletePageProps {
  unitObjekt: Objekt;
  usedObjekts: Objekt[];
  season: string;
  completionCount: number;
  onDoOver: () => void;
  onContinue: () => void;
}

const SEASON_COLORS: Record<string, string> = {
  Spring: '#FFE527',
  Summer: '#619AFF',
  Autumn: '#B5315A',
  Winter: '#C6C6C6',
};

export function UnitGridCompletePage({
  unitObjekt,
  usedObjekts,
  season,
  completionCount,
  onDoOver,
  onContinue,
}: UnitGridCompletePageProps) {
  const [debug, setDebug] = useState({
    unitNameSize: 16,
    unitNameWeight: 500,
    completionTitleSize: 24,
    completionTitleWeight: 700,
    subtitleSize: 14,
    subtitleWeight: 400,
    mainObjektSize: 220,
    glowSize: 20,
    rotatingObjektSize: 110,
    dateTextSize: 14,
    dateTextWeight: 400,
    buttonRadius: 12,
    buttonTextSize: 16,
    buttonTextWeight: 600,
    gapUnitCompletion: 4,
    gapCompletionSubtitle: 8,
    gapBottomButtons: 40,
    gapButtonsDate: 24,
    textGroupY: 48,
    buttonSpacing: 12,
    gradientOpacity: 0.2,
    gradientSize: 150,
    mainContentY: 0,
  });

  const seasonName = season.match(/^([a-zA-Z]+)/)?.[1] || 'Spring';
  const seasonColor = SEASON_COLORS[seasonName] || '#FFE527';

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  const updateDebug = (key: keyof typeof debug, value: number) => {
    setDebug(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#08090B] overflow-hidden">
      {/* Top Titles */}
      <div 
        className="px-4 text-center relative z-10"
        style={{ paddingTop: `${debug.textGroupY}px` }}
      >
        <h3 
          className="text-[#B49DFF]"
          style={{ 
            fontSize: `${debug.unitNameSize}px`, 
            fontWeight: debug.unitNameWeight,
            marginBottom: `${debug.gapUnitCompletion}px`
          }}
        >
          {unitObjekt.artist.split(' X ').map(id => {
            const artist = ARTISTS.find(a => a.id === id);
            return artist ? artist.name : id;
          }).join(' & ')}
        </h3>
        <h1 
          className="text-[#FBFBFB]"
          style={{ 
            fontSize: `${debug.completionTitleSize}px`, 
            fontWeight: debug.completionTitleWeight,
            marginBottom: `${debug.gapCompletionSubtitle}px`
          }}
        >
          {season} Unit Grid Complete
        </h1>
        <p 
          className="text-[#ACB7BF]"
          style={{ 
            fontSize: `${debug.subtitleSize}px`,
            fontWeight: debug.subtitleWeight
          }}
        >
          You were the {getOrdinal(completionCount)} to complete it.
        </p>
      </div>

      {/* Main Content: Unit Objekt with Glow and Rotating Objekts */}
      <div 
        className="flex-1 relative flex items-center justify-center"
        style={{ transform: `translateY(${debug.mainContentY}px)` }}
      >
        {/* Animated Glow */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 ${debug.glowSize}px ${debug.glowSize/4}px rgba(111, 44, 254, 0.4)`,
              `0 0 ${debug.glowSize*2}px ${debug.glowSize*0.75}px rgba(111, 44, 254, 0.6)`,
              `0 0 ${debug.glowSize}px ${debug.glowSize/4}px rgba(111, 44, 254, 0.4)`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 rounded-[12px]"
        >
          <div 
            className="aspect-[1/1.5448]"
            style={{ width: `${debug.mainObjektSize}px` }}
          >
            <ObjektCard 
              objekt={unitObjekt} 
              showDetails={true}
              hideTags={true}
              className="rounded-[12px]"
            />
          </div>
        </motion.div>

        {/* Rotating Objekts (Infinite Line) */}
        <div className="absolute w-full overflow-hidden pointer-events-none">
          <motion.div 
            className="flex gap-4 whitespace-nowrap"
            animate={{ x: [0, -debug.rotatingObjektSize * 5.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            {[...usedObjekts, ...usedObjekts, ...usedObjekts, ...usedObjekts].map((obj, idx) => (
              <div 
                key={idx} 
                className="aspect-[1/1.5448] opacity-60 flex-shrink-0"
                style={{ width: `${debug.rotatingObjektSize}px` }}
              >
                <ObjektCard objekt={obj} hideTags={true} className="rounded-[4px]" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Part */}
      <div 
        className="px-6 flex flex-col items-center relative"
        style={{ paddingBottom: `${debug.gapBottomButtons}px` }}
      >
        {/* Gradient Background */}
        <div 
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ 
            height: `${debug.gradientSize}px`,
            opacity: debug.gradientOpacity,
            background: `linear-gradient(to top, ${seasonColor}, transparent)` 
          }}
        />

        <p 
          className="text-[#ABB6BE] relative z-10"
          style={{ 
            fontSize: `${debug.dateTextSize}px`,
            fontWeight: debug.dateTextWeight,
            marginBottom: `${debug.gapButtonsDate}px`
          }}
        >
          Date of Completion: {today}
        </p>

        <div 
          className="flex w-full relative z-10"
          style={{ gap: `${debug.buttonSpacing}px` }}
        >
          <button
            onClick={onDoOver}
            className="flex-1 h-[52px] bg-[#333E45] text-[#E9ECEF]"
            style={{ 
              borderRadius: `${debug.buttonRadius}px`,
              fontSize: `${debug.buttonTextSize}px`,
              fontWeight: debug.buttonTextWeight
            }}
          >
            Do over!
          </button>
          <button
            onClick={onContinue}
            className="flex-1 h-[52px] bg-[#6F2CFE] text-[#FBFBFB]"
            style={{ 
              borderRadius: `${debug.buttonRadius}px`,
              fontSize: `${debug.buttonTextSize}px`,
              fontWeight: debug.buttonTextWeight
            }}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Debug Menu */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/30 border-t border-white/10 p-4">
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
          <DebugControl label="Unit Name Size" value={debug.unitNameSize} onChange={(v) => updateDebug('unitNameSize', v)} />
          <DebugControl label="Unit Name Weight" value={debug.unitNameWeight} onChange={(v) => updateDebug('unitNameWeight', v)} step={100} />
          <DebugControl label="Title Size" value={debug.completionTitleSize} onChange={(v) => updateDebug('completionTitleSize', v)} />
          <DebugControl label="Title Weight" value={debug.completionTitleWeight} onChange={(v) => updateDebug('completionTitleWeight', v)} step={100} />
          <DebugControl label="Subtitle Size" value={debug.subtitleSize} onChange={(v) => updateDebug('subtitleSize', v)} />
          <DebugControl label="Subtitle Weight" value={debug.subtitleWeight} onChange={(v) => updateDebug('subtitleWeight', v)} step={100} />
          <DebugControl label="Main Objekt Size" value={debug.mainObjektSize} onChange={(v) => updateDebug('mainObjektSize', v)} />
          <DebugControl label="Glow Size" value={debug.glowSize} onChange={(v) => updateDebug('glowSize', v)} />
          <DebugControl label="Rotating Size" value={debug.rotatingObjektSize} onChange={(v) => updateDebug('rotatingObjektSize', v)} />
          <DebugControl label="Date Text Size" value={debug.dateTextSize} onChange={(v) => updateDebug('dateTextSize', v)} />
          <DebugControl label="Date Text Weight" value={debug.dateTextWeight} onChange={(v) => updateDebug('dateTextWeight', v)} step={100} />
          <DebugControl label="Button Radius" value={debug.buttonRadius} onChange={(v) => updateDebug('buttonRadius', v)} />
          <DebugControl label="Button Text Size" value={debug.buttonTextSize} onChange={(v) => updateDebug('buttonTextSize', v)} />
          <DebugControl label="Button Text Weight" value={debug.buttonTextWeight} onChange={(v) => updateDebug('buttonTextWeight', v)} step={100} />
          <DebugControl label="Gap Unit-Title" value={debug.gapUnitCompletion} onChange={(v) => updateDebug('gapUnitCompletion', v)} />
          <DebugControl label="Gap Title-Sub" value={debug.gapCompletionSubtitle} onChange={(v) => updateDebug('gapCompletionSubtitle', v)} />
          <DebugControl label="Gap Bottom-Buttons" value={debug.gapBottomButtons} onChange={(v) => updateDebug('gapBottomButtons', v)} />
          <DebugControl label="Gap Buttons-Date" value={debug.gapButtonsDate} onChange={(v) => updateDebug('gapButtonsDate', v)} />
          <DebugControl label="Text Group Y" value={debug.textGroupY} onChange={(v) => updateDebug('textGroupY', v)} />
          <DebugControl label="Button Spacing" value={debug.buttonSpacing} onChange={(v) => updateDebug('buttonSpacing', v)} />
          <DebugControl label="Gradient Opacity" value={debug.gradientOpacity} onChange={(v) => updateDebug('gradientOpacity', parseFloat(v.toFixed(2)))} step={0.05} />
          <DebugControl label="Gradient Size" value={debug.gradientSize} onChange={(v) => updateDebug('gradientSize', v)} />
          <DebugControl label="Main Content Y" value={debug.mainContentY} onChange={(v) => updateDebug('mainContentY', v)} />
        </div>
      </div>
    </div>
  );
}

const DebugControl = ({ label, value, onChange, step = 1 }: { label: string, value: number, onChange: (v: number) => void, step?: number }) => (
  <div className="flex-shrink-0 w-[140px] bg-[#171C20]/30 border border-[#232A30] rounded-[12px] p-3 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <span className="text-[10px] text-[#7C8992] font-bold uppercase tracking-wider leading-tight">{label}</span>
      <span className="text-[12px] text-white font-mono">{value}</span>
    </div>
    <div className="flex gap-1">
      <button 
        onClick={() => onChange(value - step)}
        className="flex-1 h-[32px] bg-[#232A30] rounded-[6px] flex items-center justify-center text-white text-[18px]"
      >
        -
      </button>
      <button 
        onClick={() => onChange(value + step)}
        className="flex-1 h-[32px] bg-[#232A30] rounded-[6px] flex items-center justify-center text-white text-[18px]"
      >
        +
      </button>
    </div>
  </div>
);
