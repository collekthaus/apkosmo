import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ARTISTS } from '../constants';
import { cn } from '../lib/utils';

interface ArtistFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedArtists: string[];
  selectedTypes: string[];
  selectedOnlineStatus: string[];
  selectedSeason: string | null;
  onApply: (artists: string[], types: string[], onlineStatus: string[], season: string | null) => void;
  initialTab?: 'Artist' | 'Season' | 'Type' | 'On/Offline' | 'Other';
}

const OBJEKT_CLASSES = ['Basic', 'Event', 'Motion', 'Special', 'Unit', 'ETC'];
const ONLINE_STATUS_OPTIONS = ['Z Online', 'A Offline'];

import { OBJEKT_POOL } from '../constants';

const getAvailableSeasons = () => {
  const seasons = Array.from(new Set(OBJEKT_POOL.map(o => o.Season)));
  const grouped: { [name: string]: string[] } = {};
  
  seasons.forEach(s => {
    const match = s.match(/^([a-zA-Z]+)(\d+)$/);
    if (match) {
      const name = match[1];
      const num = match[2];
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(num);
    }
  });

  // Sort numbers descending
  Object.keys(grouped).forEach(name => {
    grouped[name].sort((a, b) => parseInt(b) - parseInt(a));
  });

  return grouped;
};

const AVAILABLE_SEASONS = getAvailableSeasons();
const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter']; // Order as per reference

export const ArtistFilterModal: React.FC<ArtistFilterModalProps> = ({
  isOpen,
  onClose,
  selectedArtists: initialArtists,
  selectedTypes: initialTypes,
  selectedOnlineStatus: initialOnlineStatus,
  selectedSeason: initialSeason,
  onApply,
  initialTab = 'Artist'
}) => {
  const [tempArtists, setTempArtists] = useState<string[]>(initialArtists);
  const [tempTypes, setTempTypes] = useState<string[]>(initialTypes);
  const [tempOnlineStatus, setTempOnlineStatus] = useState<string[]>(initialOnlineStatus);
  const [tempSeason, setTempSeason] = useState<string | null>(initialSeason);
  const [activeTab, setActiveTab] = useState<'Artist' | 'Season' | 'Type' | 'On/Offline' | 'Other'>(initialTab);

  // For Season tab internal state
  const initialSeasonName = initialSeason ? initialSeason.match(/^([a-zA-Z]+)/)?.[1] || null : null;
  const [selectedSeasonName, setSelectedSeasonName] = useState<string | null>(initialSeasonName);

  // Sync temp states when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempArtists(initialArtists);
      setTempTypes(initialTypes);
      setTempOnlineStatus(initialOnlineStatus);
      setTempSeason(initialSeason);
      const name = initialSeason ? initialSeason.match(/^([a-zA-Z]+)/)?.[1] || null : null;
      setSelectedSeasonName(name);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialArtists, initialTypes, initialOnlineStatus, initialSeason, initialTab]);

  const toggleArtist = (name: string) => {
    setTempArtists(prev => 
      prev.includes(name) 
        ? prev.filter(a => a !== name) 
        : [...prev, name]
    );
  };

  const toggleType = (type: string) => {
    setTempTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const toggleOnlineStatus = (status: string) => {
    setTempOnlineStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleClear = () => {
    setTempArtists([]);
    setTempTypes([]);
    setTempOnlineStatus([]);
    setTempSeason(null);
    setSelectedSeasonName(null);
  };

  const handleApply = () => {
    // Sort artists based on the original ARTISTS list order
    const sortedArtists = [...tempArtists].sort((a, b) => {
      const indexA = ARTISTS.findIndex(art => art.name === a);
      const indexB = ARTISTS.findIndex(art => art.name === b);
      return indexA - indexB;
    });
    // Sort types based on OBJEKT_CLASSES order
    const sortedTypes = [...tempTypes].sort((a, b) => {
      const indexA = OBJEKT_CLASSES.indexOf(a);
      const indexB = OBJEKT_CLASSES.indexOf(b);
      return indexA - indexB;
    });
    // Sort online status based on ONLINE_STATUS_OPTIONS order
    const sortedOnlineStatus = [...tempOnlineStatus].sort((a, b) => {
      const indexA = ONLINE_STATUS_OPTIONS.indexOf(a);
      const indexB = ONLINE_STATUS_OPTIONS.indexOf(b);
      return indexA - indexB;
    });
    onApply(sortedArtists, sortedTypes, sortedOnlineStatus, tempSeason);
    onClose();
  };

  const tabs = ['Artist', 'Season', 'Type', 'On/Offline', 'Other'] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#232A30] rounded-t-[24px] flex flex-col"
            style={{ height: '78vh' }}
          >
            {/* Top Holder */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-[#49565E] rounded-full" />
            </div>

            {/* Tabs */}
            <div className="relative px-4">
              <div 
                className="flex overflow-x-auto no-scrollbar border-b border-[#2B343B] justify-center"
                style={{ gap: '28px' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "py-3 whitespace-nowrap transition-colors relative flex items-center",
                      activeTab === tab ? "text-[#FBFBFB]" : "text-[#7C8992]"
                    )}
                    style={{ 
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    {tab}
                    {tab === 'Artist' && tempArtists.length > 0 && (
                      <div 
                        className="w-1 h-1 rounded-full bg-[#6E2CFF] absolute" 
                        style={{ 
                          top: 'calc(50% - 10px)', 
                          right: '-8px',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    )}
                    {tab === 'Season' && tempSeason && (
                      <div 
                        className="w-1 h-1 rounded-full bg-[#6E2CFF] absolute" 
                        style={{ 
                          top: 'calc(50% - 10px)', 
                          right: '-8px',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    )}
                    {tab === 'Type' && tempTypes.length > 0 && (
                      <div 
                        className="w-1 h-1 rounded-full bg-[#6E2CFF] absolute" 
                        style={{ 
                          top: 'calc(50% - 10px)', 
                          right: '-8px',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    )}
                    {tab === 'On/Offline' && tempOnlineStatus.length > 0 && (
                      <div 
                        className="w-1 h-1 rounded-full bg-[#6E2CFF] absolute" 
                        style={{ 
                          top: 'calc(50% - 10px)', 
                          right: '-8px',
                          transform: 'translateY(-50%)'
                        }}
                      />
                    )}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 bg-[#FBFBFB]"
                        style={{ height: '1.3px', left: '-14px', right: '-14px' }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {activeTab === 'Artist' && (
                <div className="p-6">
                  <div 
                    className="grid grid-cols-3"
                    style={{ 
                      columnGap: '16px',
                      rowGap: '30px'
                    }}
                  >
                    {ARTISTS.map((artist) => {
                      const isSelected = tempArtists.includes(artist.name);
                      return (
                        <button
                          key={artist.id}
                          onClick={() => toggleArtist(artist.name)}
                          className="flex flex-col items-center group"
                          style={{ gap: '6px' }}
                        >
                          <div 
                            className="relative"
                            style={{ width: '97px', height: '97px' }}
                          >
                            <div 
                              className={cn(
                                "w-full h-full rounded-full overflow-hidden transition-all",
                                isSelected ? "border-[#6E2CFF]" : "border-transparent"
                              )}
                              style={{ borderWidth: '2.2px' }}
                            >
                              <img 
                                src={artist.imageUrl} 
                                alt={artist.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isSelected && (
                                <div 
                                  className="absolute inset-0 bg-[#6E2CFF] rounded-full" 
                                  style={{ opacity: 0.3 }}
                                />
                              )}
                            </div>
                          </div>
                          <span 
                            className={cn(
                              "transition-colors",
                              isSelected ? "text-[#FBFBFB]" : "text-[#7C8992]"
                            )}
                            style={{ 
                              fontSize: '13px',
                              fontWeight: 500
                            }}
                          >
                            {artist.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'Season' && (
                <div className="flex h-full relative">
                  {/* Left Column: Season Names */}
                  <div className="flex-1 p-6 space-y-3" style={{ paddingLeft: '24px', paddingRight: '12px' }}>
                    {SEASON_NAMES.map((name) => {
                      const isAvailable = !!AVAILABLE_SEASONS[name];
                      const isSelected = selectedSeasonName === name;
                      
                      return (
                        <button
                          key={name}
                          disabled={!isAvailable}
                          onClick={() => {
                            setSelectedSeasonName(name);
                            // Auto-select highest number
                            if (AVAILABLE_SEASONS[name]) {
                              setTempSeason(`${name}${AVAILABLE_SEASONS[name][0]}`);
                            }
                          }}
                          className={cn(
                            "w-full transition-all text-left",
                            isSelected 
                              ? "bg-[#FAFAFA] border-[#4C555C] text-[#24292D]" 
                              : isAvailable 
                                ? "bg-[#2A333A] border-[#4A545D] text-[#D0D7DD]"
                                : "bg-[#1A1F23] border-[#2B343B] text-[#4A545D] cursor-not-allowed"
                          )}
                          style={{ 
                            borderRadius: '12px',
                            borderWidth: '1.3px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingLeft: '13px',
                            fontSize: '13px',
                            fontWeight: 500,
                            height: '30px'
                          }}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Vertical Divisor */}
                  <div className="w-[1px] h-full bg-[#2B343B] absolute left-1/2 top-0" />

                  {/* Right Column: Season Numbers */}
                  <div className="flex-1 p-6 space-y-3" style={{ paddingLeft: '12px', paddingRight: '24px' }}>
                    {selectedSeasonName && AVAILABLE_SEASONS[selectedSeasonName]?.map((num) => {
                      const fullSeason = `${selectedSeasonName}${num}`;
                      const isSelected = tempSeason === fullSeason;
                      
                      return (
                        <button
                          key={num}
                          onClick={() => setTempSeason(fullSeason)}
                          className={cn(
                            "w-full transition-all text-left",
                            isSelected 
                              ? "bg-[#FAFAFA] border-[#4C555C] text-[#24292D]" 
                              : "bg-[#2A333A] border-[#4A545D] text-[#D0D7DD]"
                          )}
                          style={{ 
                            borderRadius: '12px',
                            borderWidth: '1.3px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingLeft: '13px',
                            fontSize: '13px',
                            fontWeight: 500,
                            height: '30px'
                          }}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'Type' && (
                <div className="p-6" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                  <div 
                    className="grid grid-cols-2"
                    style={{ 
                      columnGap: '12px',
                      rowGap: '12px'
                    }}
                  >
                    {OBJEKT_CLASSES.map((cls) => {
                      const isSelected = tempTypes.includes(cls);
                      return (
                        <button
                          key={cls}
                          onClick={() => toggleType(cls)}
                          className={cn(
                            "transition-all text-left",
                            isSelected 
                              ? "bg-[#FAFAFA] border-[#4C555C] text-[#24292D]" 
                              : "bg-[#2A333A] border-[#4A545D] text-[#D0D7DD]"
                          )}
                          style={{ 
                            borderRadius: '12px',
                            borderWidth: '1.3px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingLeft: '13px',
                            width: '160px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                        >
                          {cls}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'On/Offline' && (
                <div className="p-6" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
                  <div 
                    className="grid grid-cols-2"
                    style={{ 
                      columnGap: '12px',
                      rowGap: '12px'
                    }}
                  >
                    {ONLINE_STATUS_OPTIONS.map((status) => {
                      const isSelected = tempOnlineStatus.includes(status);
                      return (
                        <button
                          key={status}
                          onClick={() => toggleOnlineStatus(status)}
                          className={cn(
                            "transition-all text-left",
                            isSelected 
                              ? "bg-[#FAFAFA] border-[#4C555C] text-[#24292D]" 
                              : "bg-[#2A333A] border-[#4A545D] text-[#D0D7DD]"
                          )}
                          style={{ 
                            borderRadius: '12px',
                            borderWidth: '1.3px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingLeft: '13px',
                            width: '160px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'Other' && (
                <div className="p-6 h-full flex items-center justify-center text-[#7C8992] text-[13px]">
                  {/* Blank as requested */}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col bg-[#232A30]">
              {/* Selected List */}
              {(tempArtists.length > 0 || tempTypes.length > 0 || tempOnlineStatus.length > 0 || tempSeason) && (
                <div 
                  className="flex items-center gap-x-4 px-6 py-2 bg-[#2A333A] overflow-x-auto no-scrollbar"
                  style={{ height: '38px' }}
                >
                  {tempSeason && (
                    <div 
                      className="flex items-center gap-1 text-[#D2D7DB] flex-shrink-0"
                      style={{ 
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <span>{tempSeason}</span>
                      <button 
                        onClick={() => {
                          setTempSeason(null);
                          setSelectedSeasonName(null);
                        }}
                        className="p-0.5 hover:bg-white/10 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {tempArtists.map((name) => (
                    <div 
                      key={name} 
                      className="flex items-center gap-1 text-[#D2D7DB]"
                      style={{ 
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <span>{name}</span>
                      <button 
                        onClick={() => toggleArtist(name)}
                        className="p-0.5 hover:bg-white/10 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {tempTypes.map((type) => (
                    <div 
                      key={type} 
                      className="flex items-center gap-1 text-[#D2D7DB]"
                      style={{ 
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <span>{type}</span>
                      <button 
                        onClick={() => toggleType(type)}
                        className="p-0.5 hover:bg-white/10 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {tempOnlineStatus.map((status) => (
                    <div 
                      key={status} 
                      className="flex items-center gap-1 text-[#D2D7DB]"
                      style={{ 
                        fontSize: '13px',
                        fontWeight: 500
                      }}
                    >
                      <span>{status}</span>
                      <button 
                        onClick={() => toggleOnlineStatus(status)}
                        className="p-0.5 hover:bg-white/10 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="p-4 flex gap-3">
                <button
                  onClick={handleClear}
                  disabled={tempArtists.length === 0 && tempTypes.length === 0 && tempOnlineStatus.length === 0 && !tempSeason}
                  className={cn(
                    "flex-1 py-4 transition-colors",
                    (tempArtists.length === 0 && tempTypes.length === 0 && tempOnlineStatus.length === 0 && !tempSeason)
                      ? "bg-[#2A333A] text-[#48555D] cursor-not-allowed" 
                      : "bg-[#343F45] text-[#E8ECEF]"
                  )}
                  style={{ 
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 600
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  className="flex-[2] py-4 bg-[#6E2CFF] text-[#FBFBFB]"
                  style={{ 
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 600
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
