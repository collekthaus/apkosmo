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
  const [debug, setDebug] = useState({
    inventoryHeaderHeight: 62,
    seasonTagOpacity: 0.5,
    seasonTagVPadding: 4,
    seasonTagHPadding: 12,
    seasonTagRadius: 8,
    gridTitleSize: 24,
    gridSlotBorderSize: 1.3,
    gridSlotTypeTextSize: 18,
    gridSlotTypeWeight: 500,
    pairBorderSize: 1.3,
    pairPadding: 8,
    slotGap: 8,
    pairGap: 16,
    slotWidth: 80,
    headerSeasonGap: 8,
    seasonTitleGap: 16,
    titleGridGap: 32,
    gridInventoryGap: 32,
    modalHeight: 78,
    modalTitleSize: 18,
    modalTitleWeight: 700,
  });

  const [showDebug, setShowDebug] = useState(true);

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

  const updateDebug = (key: keyof typeof debug, val: number) => {
    setDebug(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090B]">
      {/* Top Part */}
      <div 
        className="flex-1 flex flex-col overflow-y-auto hide-scrollbar"
        style={{ paddingBottom: `${debug.gridInventoryGap}px` }}
      >
        {/* Header */}
        <header className="px-4 py-4 flex items-center">
          <button onClick={onBack}>
            <ChevronLeft size={24} className="text-[#FBFBFB]" />
          </button>
        </header>

        {/* Season Tag */}
        <div className="flex justify-center" style={{ marginTop: `${debug.headerSeasonGap}px` }}>
          <div 
            style={{ 
              backgroundColor: `${seasonColor}${Math.round(debug.seasonTagOpacity * 255).toString(16).padStart(2, '0')}`,
              color: seasonColor,
              fontWeight: 600,
              fontSize: '12px',
              paddingTop: `${debug.seasonTagVPadding}px`,
              paddingBottom: `${debug.seasonTagVPadding}px`,
              paddingLeft: `${debug.seasonTagHPadding}px`,
              paddingRight: `${debug.seasonTagHPadding}px`,
              borderRadius: `${debug.seasonTagRadius}px`
            }}
          >
            {selectedSeason}
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-center text-[#FBFBFB] font-semibold"
          style={{ 
            marginTop: `${debug.seasonTitleGap}px`, 
            marginBottom: `${debug.titleGridGap}px`,
            fontSize: `${debug.gridTitleSize}px`
          }}
        >
          {member1} & {member2}
        </h1>

        {/* Grid Slots */}
        <div className="flex justify-center" style={{ gap: `${debug.pairGap}px` }}>
          {/* Pair 1 */}
          <div 
            className="flex rounded-[12px] border-[#232A30]"
            style={{ 
              gap: `${debug.slotGap}px`, 
              padding: `${debug.pairPadding}px`,
              borderWidth: `${debug.pairBorderSize}px`
            }}
          >
            <UnitSlot 
              type="301" 
              objekt={selectedSlots.member1_301} 
              onRemove={() => handleRemoveObjekt('member1_301')} 
              debug={debug}
            />
            <UnitSlot 
              type="302" 
              objekt={selectedSlots.member1_302} 
              onRemove={() => handleRemoveObjekt('member1_302')} 
              debug={debug}
            />
          </div>

          {/* Pair 2 */}
          <div 
            className="flex rounded-[12px] border-[#232A30]"
            style={{ 
              gap: `${debug.slotGap}px`, 
              padding: `${debug.pairPadding}px`,
              borderWidth: `${debug.pairBorderSize}px`
            }}
          >
            <UnitSlot 
              type="301" 
              objekt={selectedSlots.member2_301} 
              onRemove={() => handleRemoveObjekt('member2_301')} 
              debug={debug}
            />
            <UnitSlot 
              type="302" 
              objekt={selectedSlots.member2_302} 
              onRemove={() => handleRemoveObjekt('member2_302')} 
              debug={debug}
            />
          </div>
        </div>
      </div>

      {/* Bottom Part */}
      <div className="h-[50%] bg-[#171C20] flex flex-col">
        {/* Filters */}
        <div 
          className="px-4 flex items-center gap-[10px]"
          style={{ height: `${debug.inventoryHeaderHeight}px` }}
        >
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

      {/* Debug Menu */}
      {showDebug && (
        <div className="fixed bottom-4 left-4 right-4 z-[100] bg-black/30 p-4 rounded-2xl flex gap-4 overflow-x-auto no-scrollbar pointer-events-auto">
          <DebugControl label="Inv Header Height" value={debug.inventoryHeaderHeight} onChange={(v: number) => updateDebug('inventoryHeaderHeight', v)} />
          <DebugControl label="Season Tag Opacity" value={debug.seasonTagOpacity} onChange={(v: number) => updateDebug('seasonTagOpacity', v)} />
          <DebugControl label="Season Tag V-Pad" value={debug.seasonTagVPadding} onChange={(v: number) => updateDebug('seasonTagVPadding', v)} />
          <DebugControl label="Season Tag H-Pad" value={debug.seasonTagHPadding} onChange={(v: number) => updateDebug('seasonTagHPadding', v)} />
          <DebugControl label="Season Tag Radius" value={debug.seasonTagRadius} onChange={(v: number) => updateDebug('seasonTagRadius', v)} />
          <DebugControl label="Grid Title Size" value={debug.gridTitleSize} onChange={(v: number) => updateDebug('gridTitleSize', v)} />
          <DebugControl label="Slot Border Size" value={debug.gridSlotBorderSize} onChange={(v: number) => updateDebug('gridSlotBorderSize', v)} />
          <DebugControl label="Slot Type Size" value={debug.gridSlotTypeTextSize} onChange={(v: number) => updateDebug('gridSlotTypeTextSize', v)} />
          <DebugControl label="Slot Type Weight" value={debug.gridSlotTypeWeight} onChange={(v: number) => updateDebug('gridSlotTypeWeight', v)} isWeight />
          <DebugControl label="Pair Border Size" value={debug.pairBorderSize} onChange={(v: number) => updateDebug('pairBorderSize', v)} />
          <DebugControl label="Pair Padding" value={debug.pairPadding} onChange={(v: number) => updateDebug('pairPadding', v)} />
          <DebugControl label="Slot Gap" value={debug.slotGap} onChange={(v: number) => updateDebug('slotGap', v)} />
          <DebugControl label="Pair Gap" value={debug.pairGap} onChange={(v: number) => updateDebug('pairGap', v)} />
          <DebugControl label="Slot Width" value={debug.slotWidth} onChange={(v: number) => updateDebug('slotWidth', v)} />
          <DebugControl label="Header-Season Gap" value={debug.headerSeasonGap} onChange={(v: number) => updateDebug('headerSeasonGap', v)} />
          <DebugControl label="Season-Title Gap" value={debug.seasonTitleGap} onChange={(v: number) => updateDebug('seasonTitleGap', v)} />
          <DebugControl label="Title-Grid Gap" value={debug.titleGridGap} onChange={(v: number) => updateDebug('titleGridGap', v)} />
          <DebugControl label="Grid-Inv Gap" value={debug.gridInventoryGap} onChange={(v: number) => updateDebug('gridInventoryGap', v)} />
          <DebugControl label="Modal Height" value={debug.modalHeight} onChange={(v: number) => updateDebug('modalHeight', v)} />
          <DebugControl label="Modal Title Size" value={debug.modalTitleSize} onChange={(v: number) => updateDebug('modalTitleSize', v)} />
          <DebugControl label="Modal Title Weight" value={debug.modalTitleWeight} onChange={(v: number) => updateDebug('modalTitleWeight', v)} isWeight />
        </div>
      )}

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
        height={debug.modalHeight}
        titleSize={debug.modalTitleSize}
        titleWeight={debug.modalTitleWeight}
      />
    </div>
  );
}

const DebugControl = ({ label, value, onChange, isWeight = false }: any) => (
  <div className="flex flex-col bg-black/40 p-3 rounded-xl min-w-[140px] border border-white/10">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] text-white/50 uppercase font-bold leading-tight">{label}</span>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="bg-transparent text-white text-[14px] font-mono w-12 text-right focus:outline-none"
      />
    </div>
    <div className="flex gap-1">
      <button 
        onClick={() => onChange(value - (isWeight ? 100 : 1))}
        className="flex-1 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white text-xl transition-colors"
      >
        -
      </button>
      <button 
        onClick={() => onChange(value + (isWeight ? 100 : 1))}
        className="flex-1 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white text-xl transition-colors"
      >
        +
      </button>
    </div>
  </div>
);

interface UnitSlotProps {
  type: string;
  objekt: Objekt | null;
  onRemove: () => void;
  debug: any;
}

const UnitSlot: React.FC<UnitSlotProps> = ({ type, objekt, onRemove, debug }) => {
  return (
    <div 
      className="aspect-[1/1.5448] bg-[#171C20] border-[#232A30] rounded-[8px] relative flex items-center justify-center overflow-hidden"
      style={{ 
        width: `${debug.slotWidth}px`,
        borderWidth: `${debug.gridSlotBorderSize}px`
      }}
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
        <span 
          className="text-[#49565E]"
          style={{ 
            fontSize: `${debug.gridSlotTypeTextSize}px`,
            fontWeight: debug.gridSlotTypeWeight
          }}
        >
          {type}
        </span>
      )}
    </div>
  );
};
