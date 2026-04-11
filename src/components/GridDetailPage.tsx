import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { ARTISTS, OBJEKT_POOL } from '../constants';
import { Objekt, UserStats } from '../types';
import { cn } from '../lib/utils';
import { ComoIcon } from './Icons';

interface GridDetailPageProps {
  inventory: Objekt[];
  setInventory: React.Dispatch<React.SetStateAction<Objekt[]>>;
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  selectedSeason: string;
  selectedArtist: string;
  setSelectedArtist: (artist: string) => void;
  gridHistory: Record<string, number>;
  setGridHistory: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onBack: () => void;
  onShop: () => void;
}

const SEASON_COLORS: Record<string, string> = {
  Spring: '#FFE527',
  Summer: '#619AFF',
  Autumn: '#B5315A',
  Winter: '#C6C6C6',
};

export function GridDetailPage({
  inventory,
  setInventory,
  stats,
  setStats,
  selectedSeason,
  selectedArtist,
  setSelectedArtist,
  gridHistory,
  setGridHistory,
  onBack,
  onShop,
}: GridDetailPageProps) {
  const dragControls = useDragControls();
  const [debug, setDebug] = useState({
    emptySlotGradientOpacity: 1.0,
  });

  const updateDebug = (key: keyof typeof debug, delta: number) => {
    setDebug(prev => ({ ...prev, [key]: Number((prev[key] + delta).toFixed(3)) }));
  };

  const setDebugValue = (key: keyof typeof debug, value: number) => {
    setDebug(prev => ({ ...prev, [key]: value }));
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const seasonName = selectedSeason.match(/^([a-zA-Z]+)/)?.[1] || 'Spring';
  const seasonColor = SEASON_COLORS[seasonName] || '#FFE527';
  
  const gridKey = `${selectedArtist}-${selectedSeason}`;
  const attemptCount = (gridHistory[gridKey] || 0) + 1;

  // Get basic objekts for the current grid (101Z-108Z)
  const basicTypes = ['101Z', '102Z', '103Z', '104Z', '105Z', '106Z', '107Z', '108Z'];
  
  // Find the best objekt for each slot
  const gridObjekts = basicTypes.map(type => {
    const matches = inventory.filter(o => 
      o.artist === selectedArtist && 
      o.Season === selectedSeason && 
      o.Type === type
    );
    if (matches.length === 0) return null;
    // Sort by serial number descending
    return matches.sort((a, b) => (b.serialNumber || 0) - (a.serialNumber || 0))[0];
  });

  const isComplete = gridObjekts.every(o => o !== null);

  // Special Objekts for rewards (301Z, 302Z)
  const rewardPool = OBJEKT_POOL.filter(o => 
    o.artist === selectedArtist && 
    o.Season === selectedSeason && 
    (o.Type === '301Z' || o.Type === '302Z')
  );

  const [rewardIndex, setRewardIndex] = useState(0);

  useEffect(() => {
    if (rewardPool.length <= 1) return;
    const interval = setInterval(() => {
      setRewardIndex(prev => (prev + 1) % rewardPool.length);
    }, 1000); // 1 second
    return () => clearInterval(interval);
  }, [rewardPool]);

  const handleClaim = () => {
    if (!isComplete) return;

    // Select random reward
    const reward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    if (!reward) return;

    // Remove the 8 objekts used
    const usedIds = gridObjekts.map(o => o!.id);
    const newInventory = inventory.filter(o => !usedIds.includes(o.id));
    
    // Add the reward
    const newReward: Objekt = {
      ...reward,
      serialNumber: Math.floor(Math.random() * 99999) + 1,
      obtainedAt: new Date().toISOString(),
    };
    
    setInventory([newReward, ...newInventory]);
    setGridHistory(prev => ({
      ...prev,
      [gridKey]: (prev[gridKey] || 0) + 1
    }));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalObjekts: newInventory.length + 1,
      uniqueObjekts: new Set([newReward, ...newInventory].map(o => o.id)).size
    }));
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090B] overflow-y-auto hide-scrollbar flex flex-col">
      {/* Draggable Debug Menu */}
      <motion.div 
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        className="fixed top-20 right-4 w-64 bg-black/30 z-[100] rounded-lg flex flex-col overflow-hidden"
        style={{ height: '360px' }}
      >
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-between p-4 border-b border-white/10 cursor-move bg-black/40"
        >
          <span className="text-[10px] font-bold text-white/50 uppercase">Debug Menu</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          <DebugControl label="Empty Slot Grad Opacity" value={debug.emptySlotGradientOpacity} onChange={(v) => setDebugValue('emptySlotGradientOpacity', v)} onUpdate={(d) => updateDebug('emptySlotGradientOpacity', d)} step={0.1} />
        </div>
      </motion.div>

      {/* Header - Sticky at top */}
      <header 
        className="sticky top-0 px-4 flex justify-between items-center z-30 bg-[#08090B]"
        style={{ 
          paddingTop: '13px',
          paddingBottom: '0px'
        }}
      >
        <button onClick={onBack}>
          <ChevronLeft size={24} className="text-[#FBFBFB]" />
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={onShop}
            className="w-[55px] h-[30px] flex items-center justify-center text-[#04080B] font-semibold text-[13px] relative rounded-[10px] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #8395dd, #d1c2e1, #cfbbec, #bbafed, #90a9eb)' }}
          >
            Shop
          </button>
          <div className="flex items-center gap-[20px] bg-[#171C20] rounded-[10px] px-[6px] py-[4px] border-[1.4px] border-[#232A30]">
            <ComoIcon className="w-[17px] h-[17px] text-[#395EC6]" />
            <span className="text-[13px] font-medium text-[#FBFBFB]">{stats.como}</span>
          </div>
        </div>
      </header>

      {/* Content Flow */}
      <div className="flex flex-col items-center w-full" style={{ marginTop: '-10px' }}>
        {/* Artist Selector */}
        <div 
          className="w-full py-6 overflow-x-auto hide-scrollbar flex items-center"
          style={{ 
            transform: `scale(1.07)`, 
            transformOrigin: 'top center',
            gap: '24px',
            paddingLeft: '32px',
            paddingRight: '32px'
          }}
        >
          {ARTISTS.map(artist => {
            const isSelected = artist.name === selectedArtist;
            const artistGridKey = `${artist.name}-${selectedSeason}`;
            const completedCount = gridHistory[artistGridKey] || 0;
            
            return (
              <button 
                key={artist.id}
                onClick={() => setSelectedArtist(artist.name)}
                className="flex flex-col items-center flex-shrink-0"
                style={{ gap: isSelected ? '8px' : '9px' }}
              >
                <div className="relative w-fit mx-auto">
                  <div 
                    className={cn(
                      "rounded-full transition-all duration-300 relative overflow-hidden",
                      isSelected 
                        ? "border-[2px] border-[#6E2CFF]" 
                        : "border-[1px] border-[#4A575F]"
                    )}
                    style={{
                      width: isSelected ? `${50 * 1.1}px` : '50px',
                      height: isSelected ? `${50 * 1.1}px` : '50px',
                    }}
                  >
                    <img 
                      src={artist.imageUrl} 
                      alt={artist.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                    {/* Fill overlay for selected artist */}
                    {isSelected && (
                      <div 
                        className="absolute inset-0 bg-[#6E2CFF] pointer-events-none" 
                        style={{ opacity: 0.25 }}
                      />
                    )}
                  </div>
                  {/* Tag Container - Ensures perfect horizontal centering */}
                  <div 
                    className="absolute inset-x-0 flex justify-center z-10"
                    style={{ bottom: '-8px' }}
                  >
                    <div 
                      className={cn(
                        "px-2 py-[1px] rounded-full border-[1px] text-[10px]",
                        isSelected 
                          ? "bg-[#6E2CFF] border-[#8756FF] text-[#FBFBFB] font-medium" 
                          : "bg-[#242B31] border-[#343F45] text-[#ADB7C0] font-medium"
                      )}
                      style={{ 
                        transform: `scale(0.85)`,
                        letterSpacing: '0em'
                      }}
                    >
                      {completedCount}/8
                    </div>
                  </div>
                </div>
                <span 
                  className={cn(
                    "font-medium transition-colors",
                    isSelected ? "text-[#FBFBFB]" : "text-[#7C8992]"
                  )}
                  style={{ fontSize: isSelected ? '10.5px' : '9.6px' }}
                >
                  {artist.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Title Section */}
        <div 
          className="text-center" 
          style={{ 
            marginTop: '0px',
            marginBottom: '40px'
          }}
        >
          <h2 
            className="text-white"
            style={{ 
              fontSize: '21px',
              fontWeight: 600
            }}
          >
            Attempting the <span className="text-[#B59DFF]">{getOrdinal(attemptCount)}</span> Grid
          </h2>
          <p 
            className="text-[#7C8992]"
            style={{ 
              marginTop: '14px',
              fontSize: '12.2px',
              fontWeight: 400
            }}
          >
            Collect Objekts and earn a special reward
          </p>
        </div>

        {/* Grid */}
        <div 
          className="w-full px-6 flex justify-center pb-12"
          style={{ transform: `scale(0.90)`, transformOrigin: 'top center' }}
        >
          <div 
            className="grid grid-cols-3 w-full max-w-[340px]"
            style={{ gap: '10px 10px' }}
          >
            {/* 101-103 */}
            {[0, 1, 2].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                debug={debug}
                hexToRgba={hexToRgba}
              />
            ))}
            
            {/* 104, Reward, 105 */}
            <GridSlot 
              type={basicTypes[3].replace('Z', '')} 
              objekt={gridObjekts[3]} 
              seasonColor={seasonColor} 
              debug={debug}
              hexToRgba={hexToRgba}
            />
            
            <RewardSlot 
              isComplete={isComplete} 
              rewardPool={rewardPool} 
              rewardIndex={rewardIndex} 
              onClaim={handleClaim}
              debug={debug}
            />
            
            <GridSlot 
              type={basicTypes[4].replace('Z', '')} 
              objekt={gridObjekts[4]} 
              seasonColor={seasonColor} 
              debug={debug}
              hexToRgba={hexToRgba}
            />
            
            {/* 106-108 */}
            {[5, 6, 7].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                debug={debug}
                hexToRgba={hexToRgba}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const DebugControl = ({ label, value, onChange, onUpdate, step = 1 }: { label: string, value: number, onChange: (val: number) => void, onUpdate: (delta: number) => void, step?: number }) => (
  <div className="flex flex-col gap-1 mb-3">
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-white/70 uppercase">{label}</span>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="bg-transparent text-[10px] text-white font-mono text-right w-16 outline-none"
      />
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onUpdate(-step)}
        className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded flex items-center justify-center h-8"
      >
        <Minus size={14} className="text-white" />
      </button>
      <button 
        onClick={() => onUpdate(step)}
        className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded flex items-center justify-center h-8"
      >
        <Plus size={14} className="text-white" />
      </button>
    </div>
  </div>
);

interface GridSlotProps {
  type: string;
  objekt: Objekt | null;
  seasonColor: string;
  debug: any;
  hexToRgba: (hex: string, opacity: number) => string;
}

const GridSlot: React.FC<GridSlotProps> = ({ type, objekt, seasonColor, debug, hexToRgba }) => {
  const seasonColorRgba = hexToRgba(seasonColor, debug.emptySlotGradientOpacity);
  
  return (
    <div 
      className="aspect-[1/1.5448] relative overflow-hidden"
      style={{ 
        padding: '1px',
        borderRadius: '10px',
        background: `linear-gradient(to bottom, ${seasonColor}, #08090B 50%, ${seasonColor})`
      }}
    >
      <div 
        className="w-full h-full overflow-hidden relative"
        style={{ 
          borderRadius: '9px',
          background: objekt ? 'transparent' : `linear-gradient(to bottom, #08090B, ${seasonColorRgba}, #08090B), #08090B`,
        }}
      >
        {objekt ? (
          <img 
            src={objekt.imageUrl} 
            alt={type} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span 
              className="font-medium"
              style={{ 
                fontSize: '16px',
                background: 'linear-gradient(to bottom, #D6D6D6, #8B8B8B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {type}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface RewardSlotProps {
  isComplete: boolean;
  rewardPool: Objekt[];
  rewardIndex: number;
  onClaim: () => void;
  debug: any;
}

const RewardSlot: React.FC<RewardSlotProps> = ({ isComplete, rewardPool, rewardIndex, onClaim, debug }) => {
  const currentReward = rewardPool[rewardIndex];

  return (
    <div className="aspect-[1/1.5448] relative group">
      {/* Glow Animation */}
      <div className="absolute inset-0 bg-[#9B1EFF]/40 blur-2xl rounded-full animate-pulse" />
      
      <div 
        className={cn(
          "absolute inset-0 overflow-hidden transition-all duration-500",
          isComplete ? "cursor-pointer scale-105" : ""
        )}
        style={{ 
          padding: '2px',
          borderRadius: '10px',
          background: 'linear-gradient(45deg, #9B1EFF, #BF91FE, #E6D6FD)'
        }}
        onClick={isComplete ? onClaim : undefined}
      >
        <div 
          className="w-full h-full overflow-hidden relative"
          style={{
            borderRadius: '8px',
            background: isComplete ? 'linear-gradient(to bottom, #6A2AF3, #221062)' : '#171C20'
          }}
        >
          {!isComplete ? (
            <div className="w-full h-full relative">
              <AnimatePresence initial={false}>
                <motion.img
                  key={currentReward?.id}
                  src={currentReward?.imageUrl}
                  alt="Reward Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
              
              {/* Static Reward Tag */}
              <div 
                className="absolute z-20 flex items-center justify-center"
                style={{
                  top: '2px',
                  left: '2px',
                  backgroundColor: '#6E2DFD',
                  border: '1.3px solid #8B55FF',
                  borderRadius: '8px',
                  padding: '5px 7px',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0px',
                  lineHeight: 1
                }}
              >
                Reward
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star size={24} className="text-white fill-white" />
              </div>
              <div>
                <p className="text-white font-bold text-[14px] leading-tight">Claim</p>
                <p className="text-white font-bold text-[14px] leading-tight">reward</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
