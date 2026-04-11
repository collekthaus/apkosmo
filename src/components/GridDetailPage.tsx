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
    headerBottomPadding: 13,
    pageHeaderGap: 0,
    artistNavTitleGap: 24,
    titleSubtitleGap: 4,
    subtitleGridGap: 40,
    gridScale: 1.0,
    gridGapX: 12,
    gridGapY: 12,
    titleSize: 22,
    subtitleSize: 14,
    titleWeight: 600,
    subtitleWeight: 400,
    slotCornerRadius: 12,
    mainSlotBorderSize: 1.5,
    centerSlotBorderSize: 2,
    rewardTagX: 7,
    rewardTagY: 8,
    typeNumberSize: 16,
    gradientSize: 50,
    gradientDensity: 1.0,
    fillOpacity: 1.0,
    artistNavScale: 1.0,
    counterTagScale: 1.0,
    counterTagY: -4,
    artistNameSize: 13,
    artistNameGap: 8,
    selectedArtistFillOpacity: 0.4,
    counterTagKerning: 0,
  });

  const updateDebug = (key: keyof typeof debug, delta: number) => {
    setDebug(prev => ({ ...prev, [key]: Number((prev[key] + delta).toFixed(3)) }));
  };

  const setDebugValue = (key: keyof typeof debug, value: number) => {
    setDebug(prev => ({ ...prev, [key]: value }));
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
          <DebugControl label="Header B-Padding" value={debug.headerBottomPadding} onChange={(v) => setDebugValue('headerBottomPadding', v)} onUpdate={(d) => updateDebug('headerBottomPadding', d)} />
          <DebugControl label="Page Header Gap" value={debug.pageHeaderGap} onChange={(v) => setDebugValue('pageHeaderGap', v)} onUpdate={(d) => updateDebug('pageHeaderGap', d)} />
          <DebugControl label="Artist Nav-Title Gap" value={debug.artistNavTitleGap} onChange={(v) => setDebugValue('artistNavTitleGap', v)} onUpdate={(d) => updateDebug('artistNavTitleGap', d)} />
          <DebugControl label="Title-Subtitle Gap" value={debug.titleSubtitleGap} onChange={(v) => setDebugValue('titleSubtitleGap', v)} onUpdate={(d) => updateDebug('titleSubtitleGap', d)} />
          <DebugControl label="Subtitle-Grid Gap" value={debug.subtitleGridGap} onChange={(v) => setDebugValue('subtitleGridGap', v)} onUpdate={(d) => updateDebug('subtitleGridGap', d)} />
          <DebugControl label="Grid Scale" value={debug.gridScale} onChange={(v) => setDebugValue('gridScale', v)} onUpdate={(d) => updateDebug('gridScale', d)} step={0.1} />
          <DebugControl label="Grid Gap X" value={debug.gridGapX} onChange={(v) => setDebugValue('gridGapX', v)} onUpdate={(d) => updateDebug('gridGapX', d)} />
          <DebugControl label="Grid Gap Y" value={debug.gridGapY} onChange={(v) => setDebugValue('gridGapY', v)} onUpdate={(d) => updateDebug('gridGapY', d)} />
          <DebugControl label="Title Size" value={debug.titleSize} onChange={(v) => setDebugValue('titleSize', v)} onUpdate={(d) => updateDebug('titleSize', d)} />
          <DebugControl label="Subtitle Size" value={debug.subtitleSize} onChange={(v) => setDebugValue('subtitleSize', v)} onUpdate={(d) => updateDebug('subtitleSize', d)} />
          <DebugControl label="Title Weight" value={debug.titleWeight} onChange={(v) => setDebugValue('titleWeight', v)} onUpdate={(d) => updateDebug('titleWeight', d)} step={100} />
          <DebugControl label="Subtitle Weight" value={debug.subtitleWeight} onChange={(v) => setDebugValue('subtitleWeight', v)} onUpdate={(d) => updateDebug('subtitleWeight', d)} step={100} />
          <DebugControl label="Slot Corner Radius" value={debug.slotCornerRadius} onChange={(v) => setDebugValue('slotCornerRadius', v)} onUpdate={(d) => updateDebug('slotCornerRadius', d)} />
          <DebugControl label="Main Slot Border" value={debug.mainSlotBorderSize} onChange={(v) => setDebugValue('mainSlotBorderSize', v)} onUpdate={(d) => updateDebug('mainSlotBorderSize', d)} step={0.1} />
          <DebugControl label="Center Slot Border" value={debug.centerSlotBorderSize} onChange={(v) => setDebugValue('centerSlotBorderSize', v)} onUpdate={(d) => updateDebug('centerSlotBorderSize', d)} step={0.1} />
          <DebugControl label="Reward Tag X" value={debug.rewardTagX} onChange={(v) => setDebugValue('rewardTagX', v)} onUpdate={(d) => updateDebug('rewardTagX', d)} />
          <DebugControl label="Reward Tag Y" value={debug.rewardTagY} onChange={(v) => setDebugValue('rewardTagY', v)} onUpdate={(d) => updateDebug('rewardTagY', d)} />
          <DebugControl label="Type Number Size" value={debug.typeNumberSize} onChange={(v) => setDebugValue('typeNumberSize', v)} onUpdate={(d) => updateDebug('typeNumberSize', d)} />
          <DebugControl label="Gradient Size" value={debug.gradientSize} onChange={(v) => setDebugValue('gradientSize', v)} onUpdate={(d) => updateDebug('gradientSize', d)} />
          <DebugControl label="Gradient Density" value={debug.gradientDensity} onChange={(v) => setDebugValue('gradientDensity', v)} onUpdate={(d) => updateDebug('gradientDensity', d)} step={0.1} />
          <DebugControl label="Fill Opacity" value={debug.fillOpacity} onChange={(v) => setDebugValue('fillOpacity', v)} onUpdate={(d) => updateDebug('fillOpacity', d)} step={0.1} />
          <DebugControl label="Artist Nav Scale" value={debug.artistNavScale} onChange={(v) => setDebugValue('artistNavScale', v)} onUpdate={(d) => updateDebug('artistNavScale', d)} step={0.1} />
          <DebugControl label="Counter Tag Scale" value={debug.counterTagScale} onChange={(v) => setDebugValue('counterTagScale', v)} onUpdate={(d) => updateDebug('counterTagScale', d)} step={0.1} />
          <DebugControl label="Counter Tag Y" value={debug.counterTagY} onChange={(v) => setDebugValue('counterTagY', v)} onUpdate={(d) => updateDebug('counterTagY', d)} />
          <DebugControl label="Artist Name Size" value={debug.artistNameSize} onChange={(v) => setDebugValue('artistNameSize', v)} onUpdate={(d) => updateDebug('artistNameSize', d)} />
          <DebugControl label="Artist Name Gap" value={debug.artistNameGap} onChange={(v) => setDebugValue('artistNameGap', v)} onUpdate={(d) => updateDebug('artistNameGap', d)} />
          <DebugControl label="Selected Fill Opacity" value={debug.selectedArtistFillOpacity} onChange={(v) => setDebugValue('selectedArtistFillOpacity', v)} onUpdate={(d) => updateDebug('selectedArtistFillOpacity', d)} step={0.1} />
          <DebugControl label="Counter Kerning" value={debug.counterTagKerning} onChange={(v) => setDebugValue('counterTagKerning', v)} onUpdate={(d) => updateDebug('counterTagKerning', d)} step={0.001} />
        </div>
      </motion.div>

      {/* Header - Sticky at top */}
      <header 
        className="sticky top-0 px-4 flex justify-between items-center z-30 bg-[#08090B]"
        style={{ 
          paddingTop: '13px',
          paddingBottom: `${debug.headerBottomPadding}px`
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
      <div className="flex flex-col items-center w-full" style={{ marginTop: `${debug.pageHeaderGap}px` }}>
        {/* Artist Selector */}
        <div 
          className="w-full px-4 py-6 overflow-x-auto hide-scrollbar flex items-center gap-6"
          style={{ transform: `scale(${debug.artistNavScale})`, transformOrigin: 'top center' }}
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
                style={{ gap: `${debug.artistNameGap}px` }}
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
                      width: isSelected ? '55px' : '50px',
                      height: isSelected ? '55px' : '50px',
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
                        style={{ opacity: debug.selectedArtistFillOpacity }}
                      />
                    )}
                  </div>
                  {/* Tag Container - Ensures perfect horizontal centering */}
                  <div 
                    className="absolute inset-x-0 flex justify-center z-10"
                    style={{ bottom: `${debug.counterTagY}px` }}
                  >
                    <div 
                      className={cn(
                        "px-2 py-[1px] rounded-full border-[1px] text-[10px]",
                        isSelected 
                          ? "bg-[#6E2CFF] border-[#8756FF] text-[#FBFBFB] font-medium" 
                          : "bg-[#242B31] border-[#343F45] text-[#ADB7C0] font-medium"
                      )}
                      style={{ 
                        transform: `scale(${debug.counterTagScale})`,
                        letterSpacing: `${debug.counterTagKerning}em`
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
                  style={{ fontSize: `${debug.artistNameSize}px` }}
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
            marginTop: `${debug.artistNavTitleGap}px`,
            marginBottom: `${debug.subtitleGridGap}px`
          }}
        >
          <h2 
            className="text-white"
            style={{ 
              fontSize: `${debug.titleSize}px`,
              fontWeight: debug.titleWeight
            }}
          >
            Attempting the <span className="text-[#B59DFF]">{getOrdinal(attemptCount)}</span> Grid
          </h2>
          <p 
            className="text-[#7C8992]"
            style={{ 
              marginTop: `${debug.titleSubtitleGap}px`,
              fontSize: `${debug.subtitleSize}px`,
              fontWeight: debug.subtitleWeight
            }}
          >
            Collect Objekts and earn a special reward
          </p>
        </div>

        {/* Grid */}
        <div 
          className="w-full px-6 flex justify-center pb-12"
          style={{ transform: `scale(${debug.gridScale})`, transformOrigin: 'top center' }}
        >
          <div 
            className="grid grid-cols-3 w-full max-w-[340px]"
            style={{ gap: `${debug.gridGapY}px ${debug.gridGapX}px` }}
          >
            {/* 101-103 */}
            {[0, 1, 2].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                debug={debug}
              />
            ))}
            
            {/* 104, Reward, 105 */}
            <GridSlot 
              type={basicTypes[3].replace('Z', '')} 
              objekt={gridObjekts[3]} 
              seasonColor={seasonColor} 
              debug={debug}
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
            />
            
            {/* 106-108 */}
            {[5, 6, 7].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                debug={debug}
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
}

const GridSlot: React.FC<GridSlotProps> = ({ type, objekt, seasonColor, debug }) => {
  return (
    <div 
      className="aspect-[1/1.5448] relative overflow-hidden"
      style={{ 
        padding: `${debug.mainSlotBorderSize}px`,
        borderRadius: `${debug.slotCornerRadius}px`,
        background: `linear-gradient(to bottom, ${seasonColor}, #08090B ${debug.gradientSize}%, ${seasonColor})`
      }}
    >
      <div 
        className="w-full h-full overflow-hidden relative"
        style={{ 
          borderRadius: `${debug.slotCornerRadius - debug.mainSlotBorderSize}px`,
          background: objekt ? 'transparent' : `linear-gradient(to bottom, #08090B, ${seasonColor}, #08090B)`,
          opacity: debug.fillOpacity
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
                fontSize: `${debug.typeNumberSize}px`,
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
          padding: `${debug.centerSlotBorderSize}px`,
          borderRadius: `${debug.slotCornerRadius}px`,
          background: 'linear-gradient(45deg, #9B1EFF, #BF91FE, #E6D6FD)'
        }}
        onClick={isComplete ? onClaim : undefined}
      >
        <div 
          className="w-full h-full overflow-hidden relative"
          style={{
            borderRadius: `${debug.slotCornerRadius - debug.centerSlotBorderSize}px`,
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
                  top: `${debug.rewardTagY}px`,
                  left: `${debug.rewardTagX}px`,
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
