import React from 'react';
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
  const seasonName = season.match(/^([a-zA-Z]+)/)?.[1] || 'Spring';
  const seasonColor = SEASON_COLORS[seasonName] || '#FFE527';

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#08090B] overflow-hidden">
      {/* Top Titles */}
      <div className="pt-12 px-4 text-center">
        <h3 className="text-[#B49DFF] text-[16px] font-medium mb-1">
          {unitObjekt.artist.split(' X ').map(id => {
            const artist = ARTISTS.find(a => a.id === id);
            return artist ? artist.name : id;
          }).join(' & ')}
        </h3>
        <h1 className="text-[#FBFBFB] text-[24px] font-bold mb-2">
          {season} Unit Grid Complete
        </h1>
        <p className="text-[#ACB7BF] text-[14px]">
          You were the {getOrdinal(completionCount)} to complete it.
        </p>
      </div>

      {/* Main Content: Unit Objekt with Glow and Rotating Objekts */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Animated Glow */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px 5px rgba(111, 44, 254, 0.4)",
              "0 0 40px 15px rgba(111, 44, 254, 0.6)",
              "0 0 20px 5px rgba(111, 44, 254, 0.4)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 rounded-[12px]"
        >
          <div className="w-[220px] aspect-[1/1.5448]">
            <ObjektCard 
              objekt={unitObjekt} 
              serialTag={`#${String(unitObjekt.serialNumber).padStart(5, '0')}`}
              showDetails={true}
              className="rounded-[12px]"
            />
          </div>
        </motion.div>

        {/* Rotating Objekts (Infinite Line) */}
        <div className="absolute w-full overflow-hidden pointer-events-none">
          <motion.div 
            className="flex gap-4 whitespace-nowrap"
            animate={{ x: [0, -400] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            {[...usedObjekts, ...usedObjekts, ...usedObjekts].map((obj, idx) => (
              <div key={idx} className="w-[80px] aspect-[1/1.5448] opacity-60 flex-shrink-0">
                <ObjektCard objekt={obj} className="rounded-[4px]" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Part */}
      <div className="pb-10 px-6 flex flex-col items-center relative">
        {/* Gradient Background */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[150px] opacity-20 pointer-events-none"
          style={{ 
            background: `linear-gradient(to top, ${seasonColor}, transparent)` 
          }}
        />

        <p className="text-[#ABB6BE] text-[14px] mb-6 relative z-10">
          Date of Completion: {today}
        </p>

        <div className="flex w-full gap-3 relative z-10">
          <button
            onClick={onDoOver}
            className="flex-1 h-[52px] bg-[#333E45] text-[#E9ECEF] rounded-[12px] font-semibold text-[16px]"
          >
            Do over!
          </button>
          <button
            onClick={onContinue}
            className="flex-1 h-[52px] bg-[#6F2CFE] text-[#FBFBFB] rounded-[12px] font-semibold text-[16px]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
