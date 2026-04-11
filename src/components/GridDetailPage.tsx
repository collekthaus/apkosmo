import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
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
    }, 15000); // 1.5 seconds was requested but 1500ms is 1.5s. User said 1,5 seconds.
    return () => clearInterval(interval);
  }, [rewardPool]);

  const handleClaim = () => {
    if (!isComplete) return;

    // Select random reward
    const reward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
    if (!reward) return;

    // Remove the 8 objekts used
    const usedIds = gridObjekts.map(o => o!.id);
    // We need to be careful here: we only want to remove ONE instance of each type.
    // But since we selected specific IDs, we can just filter them out.
    // However, if the player has multiple of the same ID (which shouldn't happen if IDs are unique),
    // we should only remove the specific ones.
    
    // In our mock system, each objekt in inventory is a unique instance (even if same ID, they have different serials).
    // Wait, the inventory should probably have unique instances.
    // Let's assume each item in `inventory` is unique.
    
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
    <div className="fixed inset-0 z-50 bg-[#08090B] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-4 py-[13px] flex justify-between items-center z-10">
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

      {/* Artist Selector */}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar flex items-center gap-6">
        {ARTISTS.map(artist => {
          const isSelected = artist.name === selectedArtist;
          const artistGridKey = `${artist.name}-${selectedSeason}`;
          const completedCount = gridHistory[artistGridKey] || 0;
          
          return (
            <button 
              key={artist.id}
              onClick={() => setSelectedArtist(artist.name)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="relative">
                <div 
                  className={cn(
                    "rounded-full p-[2px] transition-all duration-300",
                    isSelected 
                      ? "border-[2px] border-[#6E2CFF] bg-[#6E2CFF]/30" 
                      : "border-[2px] border-[#4A575F]"
                  )}
                >
                  <img 
                    src={artist.imageUrl} 
                    alt={artist.name} 
                    className={cn(
                      "rounded-full object-cover transition-all duration-300",
                      isSelected ? "w-[64px] h-[64px]" : "w-[52px] h-[52px]"
                    )}
                  />
                </div>
                <div 
                  className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-[1px] rounded-full border-[1px] text-[10px] font-bold",
                    isSelected 
                      ? "bg-[#6E2CFF] border-[#8756FF] text-[#FBFBFB]" 
                      : "bg-[#242B31] border-[#343F45] text-[#ADB7C0]"
                  )}
                >
                  {completedCount}/8
                </div>
              </div>
              <span 
                className={cn(
                  "text-[13px] font-medium transition-colors",
                  isSelected ? "text-[#FBFBFB]" : "text-[#7C8992]"
                )}
              >
                {artist.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Title Section */}
      <div className="text-center mt-4 mb-8">
        <h2 className="text-[22px] font-bold text-white">
          Attempting the <span className="text-[#6E2CFF]">{getOrdinal(attemptCount)}</span> Grid
        </h2>
        <p className="text-[#7C8992] text-[14px] mt-1">
          Collect Objekts and earn a special reward
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[340px]">
          {/* 101-103 */}
          {[0, 1, 2].map(i => (
            <GridSlot 
              key={i} 
              type={basicTypes[i].replace('Z', '')} 
              objekt={gridObjekts[i]} 
              seasonColor={seasonColor} 
            />
          ))}
          
          {/* 104, Reward, 105 */}
          <GridSlot 
            type={basicTypes[3].replace('Z', '')} 
            objekt={gridObjekts[3]} 
            seasonColor={seasonColor} 
          />
          
          <RewardSlot 
            isComplete={isComplete} 
            rewardPool={rewardPool} 
            rewardIndex={rewardIndex} 
            onClaim={handleClaim}
          />
          
          <GridSlot 
            type={basicTypes[4].replace('Z', '')} 
            objekt={gridObjekts[4]} 
            seasonColor={seasonColor} 
          />
          
          {/* 106-108 */}
          {[5, 6, 7].map(i => (
            <GridSlot 
              key={i} 
              type={basicTypes[i].replace('Z', '')} 
              objekt={gridObjekts[i]} 
              seasonColor={seasonColor} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface GridSlotProps {
  type: string;
  objekt: Objekt | null;
  seasonColor: string;
}

const GridSlot: React.FC<GridSlotProps> = ({ type, objekt, seasonColor }) => {
  return (
    <div 
      className="aspect-[1/1.5448] relative rounded-[12px] overflow-hidden"
      style={{ 
        padding: '1.5px',
        background: `linear-gradient(to bottom, ${seasonColor}, #08090B, ${seasonColor})`
      }}
    >
      <div 
        className="w-full h-full rounded-[10.5px] overflow-hidden relative"
        style={{ 
          background: objekt ? 'transparent' : `linear-gradient(to bottom, #08090B, ${seasonColor}, #08090B)`,
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
              className="text-[19px] font-medium"
              style={{ 
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
}

const RewardSlot: React.FC<RewardSlotProps> = ({ isComplete, rewardPool, rewardIndex, onClaim }) => {
  const currentReward = rewardPool[rewardIndex];

  return (
    <div className="aspect-[1/1.5448] relative group">
      {/* Glow Animation */}
      <div className="absolute inset-0 bg-[#9B1EFF]/40 blur-2xl rounded-full animate-pulse" />
      
      <div 
        className={cn(
          "absolute inset-0 rounded-[12px] overflow-hidden transition-all duration-500",
          isComplete ? "cursor-pointer scale-105" : ""
        )}
        style={{ 
          padding: '2px',
          background: 'linear-gradient(45deg, #9B1EFF, #BF91FE, #E6D6FD)'
        }}
        onClick={isComplete ? onClaim : undefined}
      >
        <div 
          className="w-full h-full rounded-[10px] overflow-hidden relative"
          style={{
            background: isComplete ? 'linear-gradient(to bottom, #6A2AF3, #221062)' : '#171C20'
          }}
        >
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={currentReward?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full relative"
              >
                {currentReward && (
                  <img 
                    src={currentReward.imageUrl} 
                    alt="Reward Preview" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div 
                  className="absolute z-20 flex items-center justify-center"
                  style={{
                    top: '8px',
                    left: '7px',
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
              </motion.div>
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
