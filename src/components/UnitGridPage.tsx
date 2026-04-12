import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, X, RotateCcw, ChevronDown } from 'lucide-react';
import { OBJEKT_POOL, ARTISTS } from '../constants';
import { Objekt, UserStats } from '../types';
import { cn } from '../lib/utils';
import { ComoIcon } from './Icons';
import { ObjektCard } from './ObjektCard';
import { ArtistFilterModal } from './ArtistFilterModal';

interface UnitGridPageProps {
  inventory: Objekt[];
  stats: UserStats;
  selectedSeason: string;
  onBack: () => void;
  onShop: () => void;
}

const SEASON_COLORS: Record<string, string> = {
  Spring: '#FFE527',
  Summer: '#619AFF',
  Autumn: '#B5315A',
  Winter: '#C6C6C6',
};

export function UnitGridPage({
  inventory,
  stats,
  selectedSeason,
  onBack,
  onShop,
}: UnitGridPageProps) {
  const [selectedSlots, setSelectedSlots] = useState<{
    member1_301: Objekt | null;
    member1_302: Objekt | null;
    member2_301: Objekt | null;
    member2_302: Objekt | null;
  }>({
    member1_301: null,
    member1_302: null,
    member2_301: null,
    member2_302: null,
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [isArtistFilterOpen, setIsArtistFilterOpen] = useState(false);

  const seasonName = selectedSeason.match(/^([a-zA-Z]+)/)?.[1] || 'Spring';
  const seasonColor = SEASON_COLORS[seasonName] || '#FFE527';

  // Filter inventory for Special Objekts of the selected season
  const specialObjekts = useMemo(() => {
    return inventory.filter(o => 
      o.Class === 'Special' && 
      o.Season === selectedSeason &&
      (o.Type === '301Z' || o.Type === '302Z')
    );
  }, [inventory, selectedSeason]);

  // Apply artist filters
  const filteredObjekts = useMemo(() => {
    let result = specialObjekts;
    if (selectedArtists.length > 0) {
      result = result.filter(o => selectedArtists.includes(o.artist));
    }
    return result;
  }, [specialObjekts, selectedArtists]);

  const member1 = selectedSlots.member1_301?.artist || selectedSlots.member1_302?.artist || 'Member 1';
  const member2 = selectedSlots.member2_301?.artist || selectedSlots.member2_302?.artist || 'Member 2';

  const handleSelectObjekt = (objekt: Objekt) => {
    const isAlreadySelected = [
      selectedSlots.member1_301,
      selectedSlots.member1_302,
      selectedSlots.member2_301,
      selectedSlots.member2_302
    ].some(s => s && s.id === objekt.id && s.serialNumber === objekt.serialNumber);
    if (isAlreadySelected) return;

    const type = objekt.Type; // '301Z' or '302Z'
    const artist = objekt.artist;

    setSelectedSlots(prev => {
      const next = { ...prev };
      
      // If artist matches member1 or member1 is empty
      const currentMember1 = next.member1_301?.artist || next.member1_302?.artist || 'Member 1';
      const currentMember2 = next.member2_301?.artist || next.member2_302?.artist || 'Member 2';

      if (currentMember1 === 'Member 1' || currentMember1 === artist) {
        if (type === '301Z' && !next.member1_301) {
          next.member1_301 = objekt;
          return next;
        }
        if (type === '302Z' && !next.member1_302) {
          next.member1_302 = objekt;
          return next;
        }
      }

      if (currentMember2 === 'Member 2' || currentMember2 === artist) {
        if (type === '301Z' && !next.member2_301) {
          next.member2_301 = objekt;
          return next;
        }
        if (type === '302Z' && !next.member2_302) {
          next.member2_302 = objekt;
          return next;
        }
      }

      return next;
    });
  };

  const handleRemoveObjekt = (slotKey: keyof typeof selectedSlots) => {
    setSelectedSlots(prev => ({
      ...prev,
      [slotKey]: null
    }));
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'Artist') {
      setIsArtistFilterOpen(true);
    } else {
      setActiveFilters(prev => 
        prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
      );
    }
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setSelectedArtists([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090B]">
      {/* Top Part */}
      <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar pb-8">
        {/* Header */}
        <header className="px-4 py-4 flex items-center">
          <button onClick={onBack}>
            <ChevronLeft size={24} className="text-[#FBFBFB]" />
          </button>
        </header>

        {/* Season Tag */}
        <div className="flex justify-center mt-2">
          <div 
            className="px-3 py-1 rounded-[8px]"
            style={{ 
              backgroundColor: `${seasonColor}80`, // 50% opacity
              color: seasonColor,
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            {selectedSeason}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-[#FBFBFB] text-[24px] font-semibold mt-4 mb-8">
          {member1} & {member2}
        </h1>

        {/* Grid Slots */}
        <div className="flex justify-center gap-4 px-6">
          {/* Pair 1 */}
          <div className="flex gap-2 p-2 rounded-[12px] border-[1.3px] border-[#232A30]">
            <UnitSlot 
              type="301" 
              objekt={selectedSlots.member1_301} 
              onRemove={() => handleRemoveObjekt('member1_301')} 
            />
            <UnitSlot 
              type="302" 
              objekt={selectedSlots.member1_302} 
              onRemove={() => handleRemoveObjekt('member1_302')} 
            />
          </div>

          {/* Pair 2 */}
          <div className="flex gap-2 p-2 rounded-[12px] border-[1.3px] border-[#232A30]">
            <UnitSlot 
              type="301" 
              objekt={selectedSlots.member2_301} 
              onRemove={() => handleRemoveObjekt('member2_301')} 
            />
            <UnitSlot 
              type="302" 
              objekt={selectedSlots.member2_302} 
              onRemove={() => handleRemoveObjekt('member2_302')} 
            />
          </div>
        </div>
      </div>

      {/* Bottom Part */}
      <div className="h-[50%] bg-[#171C20] flex flex-col border-t-[1.3px] border-[#232A30]">
        {/* Filters */}
        <div className="px-4 py-4 flex items-center gap-[10px]">
          {(activeFilters.length > 0 || selectedArtists.length > 0) && (
            <button 
              onClick={resetFilters}
              className="flex-shrink-0 bg-[#2A333A] rounded-[10px] border-[1.3px] border-[#49565E] flex items-center justify-center"
              style={{ width: '30px', height: '30px' }}
            >
              <RotateCcw size={16} className="text-[#CFD8DD]" />
            </button>
          )}

          <button 
            onClick={() => toggleFilter('Objekt number')}
            className={cn(
              "h-[30px] px-3 rounded-[12px] border-[1.3px] text-[13px] font-medium whitespace-nowrap transition-colors",
              activeFilters.includes('Objekt number')
                ? "bg-[#FAFAFA] border-[#49565E] text-[#232A30]"
                : "bg-[#2A333A] border-[#49565E] text-[#CFD8DD]"
            )}
          >
            Objekt number
          </button>
          
          <div className="w-[1.5px] h-[22px] bg-[#232A30] flex-shrink-0" />

          <button 
            onClick={() => toggleFilter('Artist')}
            className={cn(
              "h-[30px] px-3 rounded-[12px] border-[1.3px] text-[13px] font-medium whitespace-nowrap flex items-center gap-1 transition-colors",
              selectedArtists.length > 0
                ? "bg-[#FAFAFA] border-[#49565E] text-[#232A30]"
                : "bg-[#2A333A] border-[#49565E] text-[#CFD8DD]"
            )}
          >
            <span>
              {selectedArtists.length === 0 
                ? "Artist" 
                : selectedArtists.length === 1 
                  ? selectedArtists[0] 
                  : `${selectedArtists[0]} +${selectedArtists.length - 1}`}
            </span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="grid grid-cols-3 gap-2">
            {filteredObjekts.map((objekt, idx) => {
              const isSelected = [
                selectedSlots.member1_301,
                selectedSlots.member1_302,
                selectedSlots.member2_301,
                selectedSlots.member2_302
              ].some(s => s && s.id === objekt.id && s.serialNumber === objekt.serialNumber);
              return (
                <div 
                  key={`${objekt.id}-${idx}`}
                  className={cn("relative transition-opacity", isSelected && "opacity-50")}
                  onClick={() => handleSelectObjekt(objekt)}
                >
                  <ObjektCard 
                    objekt={objekt}
                    serialTag={`#${String(objekt.serialNumber || 1).padStart(5, '0')}`}
                    showDetails={true}
                    showBorder={activeFilters.includes('Objekt number')}
                    className="rounded-[7px]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Artist Filter Modal */}
      <ArtistFilterModal 
        isOpen={isArtistFilterOpen}
        onClose={() => setIsArtistFilterOpen(false)}
        selectedArtists={selectedArtists}
        selectedTypes={[]}
        selectedOnlineStatus={[]}
        selectedSeason={selectedSeason}
        onApply={(artists) => {
          setSelectedArtists(artists);
        }}
        initialTab="Artist"
        simpleMode={true}
      />
    </div>
  );
}

interface UnitSlotProps {
  type: string;
  objekt: Objekt | null;
  onRemove: () => void;
}

const UnitSlot: React.FC<UnitSlotProps> = ({ type, objekt, onRemove }) => {
  return (
    <div 
      className="w-[80px] aspect-[1/1.5448] bg-[#171C20] border-[1.3px] border-[#232A30] rounded-[8px] relative flex items-center justify-center overflow-hidden"
    >
      {objekt ? (
        <>
          <img 
            src={objekt.imageUrl} 
            alt={objekt.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white z-10"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </>
      ) : (
        <span className="text-[#49565E] text-[18px] font-medium">{type}</span>
      )}
    </div>
  );
};
