import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
    const usedObjekts = gridObjekts.filter((o): o is Objekt => o !== null);
    let newInventory = [...inventory];
    usedObjekts.forEach(used => {
      const index = newInventory.findIndex(o => o.id === used.id && o.serialNumber === used.serialNumber);
      if (index !== -1) {
        newInventory.splice(index, 1);
      }
    });
    
    // Add the reward
    const existingCount = inventory.filter(o => o.id === reward.id).length;
    const newReward: Objekt = {
      ...reward,
      serialNumber: existingCount + 1,
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
            height: '130px',
            transform: `scale(1.07)`, 
            transformOrigin: 'top center',
            gap: '24px',
            paddingLeft: '32px',
            paddingRight: '32px'
          }}
        >
          {ARTISTS.map(artist => {
            const isSelected = artist.name === selectedArtist;
            
            // Count unique basic types (101Z-108Z) owned for this artist and season
            const basicTypesList = ['101Z', '102Z', '103Z', '104Z', '105Z', '106Z', '107Z', '108Z'];
            const ownedCount = basicTypesList.filter(type => 
              inventory.some(o => 
                o.artist === artist.name && 
                o.Season === selectedSeason && 
                o.Type === type
              )
            ).length;
            
            return (
              <button 
                key={artist.id}
                onClick={() => setSelectedArtist(artist.name)}
                className="flex flex-col items-center flex-shrink-0 h-full justify-center"
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
                      {ownedCount}/8
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
            className="grid grid-cols-3 w-full max-w-[340px] relative"
            style={{ gap: '10px 10px' }}
          >
            {/* Pulsing Background Image - On top of 8 slots, behind center slot */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <motion.img 
                src="/images/GridRewardGradientBg.png"
                alt="Reward Background"
                className="w-[120%] h-[120%] object-contain opacity-90"
                animate={{ 
                  scale: [0.62, 0.73, 0.62],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 101-103 */}
            {[0, 1, 2].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                hexToRgba={hexToRgba}
              />
            ))}
            
            {/* 104, Reward, 105 */}
            <GridSlot 
              type={basicTypes[3].replace('Z', '')} 
              objekt={gridObjekts[3]} 
              seasonColor={seasonColor} 
              hexToRgba={hexToRgba}
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
              hexToRgba={hexToRgba}
            />
            
            {/* 106-108 */}
            {[5, 6, 7].map(i => (
              <GridSlot 
                key={i} 
                type={basicTypes[i].replace('Z', '')} 
                objekt={gridObjekts[i]} 
                seasonColor={seasonColor} 
                hexToRgba={hexToRgba}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface GridSlotProps {
  type: string;
  objekt: Objekt | null;
  seasonColor: string;
  hexToRgba: (hex: string, opacity: number) => string;
}

const GridSlot: React.FC<GridSlotProps> = ({ type, objekt, seasonColor, hexToRgba }) => {
  const seasonColorRgba = hexToRgba(seasonColor, 0.15);
  
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
}

const RewardSlot: React.FC<RewardSlotProps> = ({ isComplete, rewardPool, rewardIndex, onClaim }) => {
  const currentReward = rewardPool[rewardIndex];

  return (
    <div className="aspect-[1/1.5448] relative group z-20">
      <div 
        className={cn(
          "absolute inset-0 overflow-hidden transition-all duration-500",
          isComplete ? "cursor-pointer" : ""
        )}
        style={{ 
          padding: '2px',
          borderRadius: '10px',
        }}
        onClick={isComplete ? onClaim : undefined}
      >
        {/* Rotating Border Gradient */}
        <motion.div 
          className="absolute inset-[-100%]"
          style={{
            background: 'conic-gradient(from 0deg, #9B1EFF, #BF91FE, #E6D6FD, #9B1EFF)',
          }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        />

        <div 
          className="w-full h-full overflow-hidden relative z-10"
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
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/images/TouchFinger.png" 
                  alt="Claim" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
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
