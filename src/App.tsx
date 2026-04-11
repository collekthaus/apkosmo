import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  CircleDashed, 
  LayoutGrid, 
  DoorOpen, 
  User, 
  ChevronDown, 
  Grid3X3, 
  RotateCcw,
  Search,
  Megaphone,
  Camera,
  Layers,
  Star,
  ChevronRight,
  ChevronLeft,
  Heart,
  Check,
  RotateCw,
  Settings,
  X
} from 'lucide-react';
import { Objekt, Pack, UserStats } from './types';
import { PACKS, OBJEKT_POOL } from './constants';
import { ObjektCard } from './components/ObjektCard';
import { PackOpening } from './components/PackOpening';
import { cn } from './lib/utils';
import { 
  LogoIcon, 
  ComoIcon, 
  QRCodeIcon,
  HomeIcon,
  RekordIcon,
  CollectIcon,
  RoomIcon,
  GridIcon,
  PlayIcon,
  ProfileIcon,
  PinIcon,
  ChevronRightIcon
} from './components/Icons';

import { DetailedObjektView } from './components/DetailedObjektView';
import { ArtistFilterModal } from './components/ArtistFilterModal';
import { GridDetailPage } from './components/GridDetailPage';

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

  Object.keys(grouped).forEach(name => {
    grouped[name].sort((a, b) => parseInt(b) - parseInt(a));
  });

  return grouped;
};

const AVAILABLE_SEASONS = getAvailableSeasons();
const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];

type Tab = 'home' | 'rekord' | 'collect' | 'room' | 'profile' | 'shop' | 'pack-detail' | 'grid' | 'play' | 'grid-detail';

const HERO_IMAGES = [
  {
    id: 1,
    url: "/images/Header.png",
    title: "find your cosmo",
    tags: ["unevermst", "yeswaare", "itsnotover"]
  },
  {
    id: 2,
    url: "https://picsum.photos/seed/cosmo2/1200/400",
    title: "collect your stars",
    tags: ["tripleS", "artms", "loona"]
  },
  {
    id: 3,
    url: "https://picsum.photos/seed/cosmo3/1200/400",
    title: "join the gravity",
    tags: ["wav", "our", "future"]
  },
  {
    id: 4,
    url: "https://picsum.photos/seed/cosmo4/1200/400",
    title: "new objekts available",
    tags: ["shop", "now", "limited"]
  },
  {
    id: 5,
    url: "https://picsum.photos/seed/cosmo5/1200/400",
    title: "exclusive events",
    tags: ["live", "replay", "soon"]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [previousTab, setPreviousTab] = useState<Tab>('home');
  const [inventory, setInventory] = useState<Objekt[]>([]);
  const [stats, setStats] = useState<UserStats>({
    como: 1000,
    totalObjekts: 0,
    uniqueObjekts: 0
  });
  const [openingPack, setOpeningPack] = useState<Pack | null>(null);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedUnifiedObjektId, setSelectedUnifiedObjektId] = useState<string | null>(null);
  const [selectedObjektForDetail, setSelectedObjektForDetail] = useState<Objekt | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedOnlineStatus, setSelectedOnlineStatus] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<'Newest' | 'Oldest' | 'Lowest No.' | 'Highest No.'>('Newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isArtistFilterOpen, setIsArtistFilterOpen] = useState(false);
  const [initialFilterTab, setInitialFilterTab] = useState<'Artist' | 'Season' | 'Type' | 'On/Offline' | 'Other'>('Artist');
  
  const [isGridSeasonFilterOpen, setIsGridSeasonFilterOpen] = useState(false);
  const [selectedGridSeason, setSelectedGridSeason] = useState("Spring26");
  const [tempGridSeason, setTempGridSeason] = useState<string | null>("Spring26");
  const [selectedGridSeasonName, setSelectedGridSeasonName] = useState<string | null>("Spring");
  const [selectedGridArtist, setSelectedGridArtist] = useState<string | null>(null);
  const [gridHistory, setGridHistory] = useState<Record<string, number>>({}); // "Artist-Season" -> count

  const toggleFilter = (filter: string) => {
    if (filter === 'Artist' || filter === 'Type' || filter === 'On/Offline' || filter === 'Season' || filter === 'Other') {
      setInitialFilterTab(filter as any);
      setIsArtistFilterOpen(true);
      return;
    }
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setSelectedArtists([]);
    setSelectedTypes([]);
    setSelectedOnlineStatus([]);
    setSelectedSeason(null);
  };

  const unifiedInventory = inventory.reduce((acc, objekt) => {
    // Filter by artist if selected
    if (selectedArtists.length > 0 && !selectedArtists.includes(objekt.artist)) {
      return acc;
    }

    // Filter by season if selected
    if (selectedSeason && objekt.Season !== selectedSeason) {
      return acc;
    }

    // Filter by class (Type) if selected
    if (selectedTypes.length > 0 && !selectedTypes.includes(objekt.Class)) {
      return acc;
    }

    // Filter by On/Offline if selected
    if (selectedOnlineStatus.length > 0) {
      const isZOnline = selectedOnlineStatus.includes('Z Online');
      const isAOffline = selectedOnlineStatus.includes('A Offline');
      
      const hasZ = objekt.Type.includes('Z');
      const hasA = objekt.Type.includes('A');

      if (isZOnline && isAOffline) {
        if (!hasZ && !hasA) return acc;
      } else if (isZOnline) {
        if (!hasZ) return acc;
      } else if (isAOffline) {
        if (!hasA) return acc;
      }
    }

    const existing = acc.find(o => o.id === objekt.id);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      // Keep the best (lowest) serial number
      if (objekt.serialNumber && (!existing.serialNumber || objekt.serialNumber < existing.serialNumber)) {
        existing.serialNumber = objekt.serialNumber;
      }
      // Keep the earliest obtainedAt for 'Oldest' sort
      if (objekt.obtainedAt && (!existing.obtainedAt || new Date(objekt.obtainedAt) < new Date(existing.obtainedAt))) {
        // We'll use a temporary property or just use obtainedAt for the earliest one
        // Actually, let's store both to be safe
        (existing as any).firstObtainedAt = (existing as any).firstObtainedAt || existing.obtainedAt;
        if (new Date(objekt.obtainedAt) < new Date((existing as any).firstObtainedAt)) {
          (existing as any).firstObtainedAt = objekt.obtainedAt;
        }
      }
      // Keep the latest obtainedAt for 'Newest' sort
      if (objekt.obtainedAt && (!existing.obtainedAt || new Date(objekt.obtainedAt) > new Date(existing.obtainedAt))) {
        (existing as any).lastObtainedAt = (existing as any).lastObtainedAt || existing.obtainedAt;
        if (new Date(objekt.obtainedAt) > new Date((existing as any).lastObtainedAt)) {
          (existing as any).lastObtainedAt = objekt.obtainedAt;
        }
      }
    } else {
      acc.push({ 
        ...objekt, 
        count: 1,
        // Initialize first/last obtainedAt
        firstObtainedAt: objekt.obtainedAt,
        lastObtainedAt: objekt.obtainedAt
      } as any);
    }
    return acc;
  }, [] as (Objekt & { count?: number; firstObtainedAt?: string; lastObtainedAt?: string })[]);

  // Sort unifiedInventory
  const sortedInventory = [...unifiedInventory].sort((a, b) => {
    let result = 0;
    switch (selectedSort) {
      case 'Newest':
        result = new Date(b.lastObtainedAt || b.obtainedAt || 0).getTime() - new Date(a.lastObtainedAt || a.obtainedAt || 0).getTime();
        // Tie-breaker: Lowest serial number
        if (result === 0) result = (a.serialNumber || 0) - (b.serialNumber || 0);
        // Secondary tie-breaker: ID
        if (result === 0) result = a.id.localeCompare(b.id);
        break;
      case 'Oldest':
        result = new Date(a.firstObtainedAt || a.obtainedAt || 0).getTime() - new Date(b.firstObtainedAt || b.obtainedAt || 0).getTime();
        // Tie-breaker: Lowest serial number
        if (result === 0) result = (a.serialNumber || 0) - (b.serialNumber || 0);
        // Secondary tie-breaker: ID
        if (result === 0) result = a.id.localeCompare(b.id);
        break;
      case 'Lowest No.':
        result = (a.serialNumber || Infinity) - (b.serialNumber || Infinity);
        // Tie-breaker: Newest obtained
        if (result === 0) result = new Date(b.lastObtainedAt || b.obtainedAt || 0).getTime() - new Date(a.lastObtainedAt || a.obtainedAt || 0).getTime();
        // Secondary tie-breaker: ID
        if (result === 0) result = a.id.localeCompare(b.id);
        break;
      case 'Highest No.':
        result = (b.serialNumber || 0) - (a.serialNumber || 0);
        // Tie-breaker: Newest obtained
        if (result === 0) result = new Date(b.lastObtainedAt || b.obtainedAt || 0).getTime() - new Date(a.lastObtainedAt || a.obtainedAt || 0).getTime();
        // Secondary tie-breaker: ID
        if (result === 0) result = a.id.localeCompare(b.id);
        break;
    }
    return result;
  });

  // Load from local storage
  useEffect(() => {
    const savedInventory = localStorage.getItem('cosmo_inventory');
    const savedStats = localStorage.getItem('cosmo_stats');
    
    let initialInventory: Objekt[] = [];
    if (savedInventory) {
      try {
        initialInventory = JSON.parse(savedInventory);
      } catch (e) {
        initialInventory = [];
      }
    }
    
    if (initialInventory.length === 0) {
      initialInventory = [];
    }
    
    setInventory(initialInventory);
    
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        setStats({
          como: 1000,
          totalObjekts: initialInventory.length,
          uniqueObjekts: new Set(initialInventory.map(o => o.id)).size
        });
      }
    } else {
      setStats({
        como: 1000,
        totalObjekts: initialInventory.length,
        uniqueObjekts: new Set(initialInventory.map(o => o.id)).size
      });
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cosmo_inventory', JSON.stringify(inventory));
    localStorage.setItem('cosmo_stats', JSON.stringify(stats));
  }, [inventory, stats]);

  const handleOpenPack = (pack: Pack) => {
    if (stats.como < pack.price) {
      alert("Not enough COMO!");
      return;
    }
    setOpeningPack(pack);
  };

  const generateObjektsFromPack = (pack: Pack, quantity: number): Objekt[] => {
    const newObjekts: Objekt[] = [];
    const currentCounts = inventory.reduce((acc, obj) => {
      acc[obj.id] = (acc[obj.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    for (let q = 0; q < quantity; q++) {
      for (let i = 0; i < pack.count; i++) {
        let possible = OBJEKT_POOL.filter(o => pack.possibleClasses.includes(o.Class as any));
        if (pack.artist) {
          possible = possible.filter(o => o.artist === pack.artist);
        }
        if (pack.season) {
          possible = possible.filter(o => o.Season === pack.season);
        }
        const random = possible[Math.floor(Math.random() * possible.length)];
        
        currentCounts[random.id] = (currentCounts[random.id] || 0) + 1;
        
        newObjekts.push({
          ...random,
          serialNumber: currentCounts[random.id],
          obtainedAt: new Date().toISOString()
        });
      }
    }
    return newObjekts;
  };

  const handlePurchase = () => {
    if (!selectedPack) return;
    
    const totalPrice = selectedPack.price * selectedQuantity;
    if (stats.como < totalPrice) {
      alert("Not enough COMO!");
      return;
    }

    const newObjekts = generateObjektsFromPack(selectedPack, selectedQuantity);
    const updatedInventory = [...newObjekts, ...inventory];
    setInventory(updatedInventory);
    
    const uniqueIds = new Set(updatedInventory.map(o => o.id));
    
    setStats(prev => ({
      ...prev,
      como: prev.como - totalPrice,
      totalObjekts: updatedInventory.length,
      uniqueObjekts: uniqueIds.size
    }));

    setActiveTab('collect');
    setSelectedPack(null);
    setSelectedQuantity(1);
  };

  const handlePackFinish = (newObjekts: Objekt[]) => {
    const updatedInventory = [...newObjekts, ...inventory];
    setInventory(updatedInventory);
    
    const uniqueIds = new Set(updatedInventory.map(o => o.id));
    
    setStats(prev => ({
      ...prev,
      como: prev.como - (openingPack?.price || 0),
      totalObjekts: updatedInventory.length,
      uniqueObjekts: uniqueIds.size
    }));
    
    setOpeningPack(null);
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#D0D7DD] pb-24">
      {/* Header */}
      {activeTab !== 'shop' && activeTab !== 'pack-detail' && (
        <header 
          className={`sticky top-0 z-40 bg-[#08090B] flex flex-col overflow-hidden ${activeTab === 'collect' ? 'pt-[13px] pb-0' : 'py-[13px] px-4'}`}
        >
          {activeTab === 'home' && (
            <>
              <img 
                src="/images/Header.png"
                alt="Header Background"
                className="absolute inset-0 w-full h-full object-cover object-[center_calc(50%-10px)]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </>
          )}
          
          <div className={`flex justify-between items-center w-full relative z-10 ${activeTab === 'collect' ? 'pl-4 pr-[24px]' : ''}`}>
            <div className="flex items-center gap-1">
              <LogoIcon className="h-[21px] w-auto text-[#FFFFFF]" />
              <ChevronDown size={16} className="text-[#D0D7DD]/60" />
            </div>
            <div className={`flex items-center ${activeTab === 'collect' ? 'gap-[28px]' : 'gap-3'}`}>
              <button 
                onClick={() => setActiveTab('shop')} 
                className="w-[55px] h-[30px] flex items-center justify-center text-[#04080B] font-semibold text-[13px] relative rounded-[10px] overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #8395dd, #d1c2e1, #cfbbec, #bbafed, #90a9eb)' }}
              >
                Shop
              </button>
              {activeTab !== 'collect' && activeTab !== 'play' && activeTab !== 'grid' && (
                <div className="flex items-center gap-[20px] bg-[#171C20] rounded-[10px] px-[6px] py-[4px] border-[1.4px] border-[#232A30]">
                  <ComoIcon className="w-[17px] h-[17px] text-[#395EC6]" />
                  <span className="text-[13px] font-medium text-[#FBFBFB]">{stats.como}</span>
                </div>
              )}
              {activeTab !== 'home' && activeTab !== 'play' && activeTab !== 'grid' && <QRCodeIcon className="w-[18px] h-[18px] text-[#D0D7DD]" />}
            </div>
          </div>

          {activeTab === 'collect' && (
            <div className="w-full mt-0">
              <div className="flex px-4 relative">
                <button className="flex-1 py-4 text-center text-[15px] font-semibold text-[#FBFBFB]">Objekt</button>
                <button className="flex-1 py-4 text-center text-[15px] font-semibold text-[#7C8992]">OMA</button>
                {/* Indicator */}
                <div className="absolute bottom-0 left-4 w-[calc(50%-16px)] h-[1.8px] bg-white z-10" />
              </div>
              <div className="h-[1px] bg-[#181C1F] w-full" />
            </div>
          )}
        </header>
      )}

      <main className={cn(activeTab !== 'shop' && activeTab !== 'pack-detail' && "pt-[15px]", activeTab === 'collect' && "pt-0")}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-[17px]"
            >
              {/* Announcement */}
              <div className="px-4">
                <div className="bg-[#171C20] rounded-[12px] px-4 py-[14px] flex items-center gap-3">
                  <img src="/images/Announcement.png" alt="Announcement" className="w-[25px] h-[25px]" referrerPolicy="no-referrer" />
                  <p className="text-[13px] text-[#D0D7DF] font-medium">There's a new announcement</p>
                </div>
              </div>

              {/* Hero Banner Carousel */}
              <HeroCarousel />

              {/* Quick Menu */}
              <div className="px-4 flex gap-[18px] overflow-x-auto hide-scrollbar py-2 mt-[8px]">
                <QuickMenuIcon imageUrl="/images/Grid.png" label="Grid" />
                <QuickMenuIcon imageUrl="/images/Spin.png" label="Spin" />
                <QuickMenuIcon imageUrl="/images/Proof.png" label="Proof Shot" />
                <QuickMenuIcon imageUrl="/images/Lenticular.png" label="Lenticular" />
                <QuickMenuIcon imageUrl="/images/Toploader.png" label="Toploader" />
              </div>

              {/* Room Section */}
              <div className="space-y-4 mt-[8px]">
                <div className="px-4 flex justify-between items-center">
                  <h3 className="text-[17px] font-semibold text-[#FBFBFB]">Room</h3>
                  <div className="flex items-center text-[#7C8992] text-[13px]">
                    <span className="font-medium">View more</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar px-4 pb-4">
                  <RoomCard 
                    title="Live Replay · 2026.03.23"
                    subtitle="오늘은 행복한(?) 월요일~"
                    image="https://picsum.photos/seed/room1/400/400"
                  />
                  <RoomCard 
                    title="Live Replay · 2026.03.20"
                    subtitle="Welcome to the Gate"
                    image="https://picsum.photos/seed/room2/400/400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rekord' && (
            <motion.div
              key="rekord"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-20 text-center text-[#D0D7DD]/40"
            >
              <CircleDashed size={48} className="mx-auto mb-4 opacity-20" />
              <p>Rekord content coming soon</p>
            </motion.div>
          )}

          {activeTab === 'grid-detail' && selectedGridArtist && (
            <GridDetailPage 
              inventory={inventory}
              setInventory={setInventory}
              stats={stats}
              setStats={setStats}
              selectedSeason={selectedGridSeason}
              selectedArtist={selectedGridArtist}
              setSelectedArtist={setSelectedGridArtist}
              gridHistory={gridHistory}
              setGridHistory={setGridHistory}
              onBack={() => setActiveTab('grid')}
              onShop={() => setActiveTab('shop')}
            />
          )}

          {(activeTab === 'collect' || activeTab === 'grid' || activeTab === 'play') && (
            <AnimatePresence mode="wait">
                {activeTab === 'collect' && (
                  <motion.div
                    key="collect"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Filters */}
                    <div className="px-4 py-4 flex items-center gap-[10px] overflow-x-auto hide-scrollbar">
                      {activeFilters.length > 0 && (
                        <button 
                          onClick={resetFilters}
                          className="flex-shrink-0 bg-[#171C20] rounded-[10px] border-[1.3px] border-[#232A30] flex items-center justify-center"
                          style={{ width: '30px', height: '30px' }}
                        >
                          <RotateCw size={16} className="text-[#ADB7C0]" />
                        </button>
                      )}

                      <button 
                        onClick={() => toggleFilter('Objekt number')}
                        className={cn(
                          "h-[30px] px-3 rounded-[12px] border-[1.3px] text-[13px] font-medium whitespace-nowrap",
                          activeFilters.includes('Objekt number')
                            ? "bg-[#FAFAFA] border-[#232A30] text-[#232A30]"
                            : "bg-[#171C20] border-[#232A30] text-[#ADB7C0]"
                        )}
                      >
                        Objekt number
                      </button>
                      
                      <div className="w-[1.5px] h-[22px] bg-[#171C20] flex-shrink-0" />

                      <FilterDropdown 
                        label={
                          selectedArtists.length === 0 
                            ? "Artist" 
                            : selectedArtists.length === 1 
                              ? selectedArtists[0] 
                              : `${selectedArtists[0]} +${selectedArtists.length - 1}`
                        } 
                        active={activeFilters.includes('Artist')} 
                        onClick={() => toggleFilter('Artist')} 
                        chevronClassName={activeFilters.includes('Artist') ? "text-[#ADB7C0]" : ""}
                      />
                      <FilterDropdown 
                        label={selectedSeason || "Season"} 
                        active={activeFilters.includes('Season')} 
                        onClick={() => toggleFilter('Season')} 
                        chevronClassName={activeFilters.includes('Season') ? "text-[#ADB7C0]" : ""}
                      />
                      <FilterDropdown 
                        label={
                          selectedTypes.length === 0 
                            ? "Type" 
                            : selectedTypes.length === 1 
                              ? selectedTypes[0] 
                              : `${selectedTypes[0]} +${selectedTypes.length - 1}`
                        } 
                        active={activeFilters.includes('Type')} 
                        onClick={() => toggleFilter('Type')} 
                        chevronClassName={activeFilters.includes('Type') ? "text-[#ADB7C0]" : ""}
                      />
                      
                       <FilterDropdown 
                        label={
                          selectedOnlineStatus.length === 0 
                            ? "On/Offline" 
                            : selectedOnlineStatus.length === 1 
                              ? selectedOnlineStatus[0] 
                              : `${selectedOnlineStatus[0]} +${selectedOnlineStatus.length - 1}`
                        } 
                        active={activeFilters.includes('On/Offline')} 
                        onClick={() => toggleFilter('On/Offline')} 
                        chevronClassName={activeFilters.includes('On/Offline') ? "text-[#ADB7C0]" : ""}
                      />
                      
                      <FilterDropdown 
                        label="Other" 
                        active={activeFilters.includes('Other')} 
                        onClick={() => toggleFilter('Other')} 
                        chevronClassName={activeFilters.includes('Other') ? "text-[#ADB7C0]" : ""}
                      />
                    </div>

                    {/* Count & Sort */}
                    <div className="px-4 py-2 flex justify-between items-center text-[13px] font-medium text-[#D2D7DD]">
                      <div className="flex items-center gap-2">
                        <span>{sortedInventory.length} types</span>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                          className="flex items-center gap-1"
                        >
                          <span>{selectedSort}</span>
                          <motion.div
                            animate={{ rotate: isSortDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={14} />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isSortDropdownOpen && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div 
                                className="fixed inset-0 z-[80]" 
                                onClick={() => setIsSortDropdownOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-[150px] bg-[#171C20] rounded-[12px] shadow-2xl z-[90] overflow-hidden py-2"
                              >
                                {(['Newest', 'Oldest', 'Lowest No.', 'Highest No.'] as const).map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => {
                                      setSelectedSort(option);
                                      setIsSortDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-[13.5px] text-center text-[13px] font-medium transition-colors",
                                      selectedSort === option ? "text-[#FBFBFD]" : "text-[#ACB9C1]"
                                    )}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="px-4 grid grid-cols-3 gap-2 mt-2">
                      {sortedInventory.length === 0 ? (
                        <div className="col-span-3 flex flex-col items-center justify-center py-32">
                          <img 
                            src="/images/EmptyObjekt.png" 
                            alt="Empty Collection" 
                            className="w-[90px] h-auto"
                            referrerPolicy="no-referrer"
                          />
                          <p className="mt-[20px] text-[12px] font-normal text-[#ADB7C0]">
                            You don't have any Objekts yet
                          </p>
                        </div>
                      ) : (
                        sortedInventory.map((objekt, idx) => (
                          <ObjektCard 
                            key={`${objekt.id}-${idx}`} 
                            objekt={objekt} 
                            count={objekt.count}
                            className="rounded-[7px]"
                            showBorder={activeFilters.includes('Objekt number')}
                            onClick={() => {
                              if (objekt.count && objekt.count > 1) {
                                setSelectedUnifiedObjektId(objekt.id);
                              } else {
                                setSelectedObjektForDetail(objekt);
                              }
                            }}
                          />
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'grid' && (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col min-h-screen px-4 pb-32"
                    style={{ paddingTop: '0px' }}
                  >
                    <div className="flex flex-col">
                      <p 
                        className="text-white"
                        style={{ 
                          fontWeight: 600,
                          fontSize: '14px',
                          marginBottom: '1px'
                        }}
                      >
                        Completed Grid
                      </p>
                      <h1 
                        className="text-[#B197FC]"
                        style={{ 
                          fontWeight: 600,
                          fontSize: '22px',
                          marginBottom: '17px'
                        }}
                      >
                        5 Grids
                      </h1>
                    </div>

                    <div className="h-[1px] w-full bg-[#171C20]" style={{ marginBottom: '17px' }} />

                    <button 
                      onClick={() => {
                        setTempGridSeason(selectedGridSeason);
                        const name = selectedGridSeason.match(/^([a-zA-Z]+)/)?.[1] || null;
                        setSelectedGridSeasonName(name);
                        setIsGridSeasonFilterOpen(true);
                      }}
                      className="flex items-center gap-1"
                      style={{ marginBottom: '12px' }}
                    >
                      <span className="font-semibold text-[#7C8992]" style={{ fontSize: '14.5px' }}>{selectedGridSeason}</span>
                      <ChevronDown size={14} className="text-[#7C8992]" />
                    </button>

                    <div className="grid grid-cols-2 gap-4" style={{ marginTop: '24px' }}>
                      {/* Grid Card 1 */}
                      <div 
                        onClick={() => {
                          setSelectedGridArtist('DoHun'); // Default to first artist or something
                          setActiveTab('grid-detail');
                        }}
                        className="bg-[#171C20] p-4 flex flex-col relative border-[1.3px] border-[#232A30] cursor-pointer"
                        style={{ 
                          height: '200px',
                          borderRadius: '12px'
                        }}
                      >
                        <div 
                          className="absolute"
                          style={{ 
                            top: '16px', 
                            right: '14px' 
                          }}
                        >
                          <ChevronRightIcon size={16} fill="#ADB7C0" />
                        </div>
                        <div 
                          className="flex flex-col"
                          style={{ 
                            transform: 'translateX(0px)',
                            gap: '7px'
                          }}
                        >
                          <img 
                            src="/images/Grid.png" 
                            alt="GRID" 
                            className="w-[40px] h-[40px] object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col" style={{ gap: '12px' }}>
                            <h3 
                              className="text-white leading-none"
                              style={{ 
                                fontWeight: 500,
                                fontSize: '14px'
                              }}
                            >
                              Grid
                            </h3>
                            <p 
                              className="text-[#ADB7C0] leading-none"
                              style={{ 
                                fontWeight: 400,
                                fontSize: '11px'
                              }}
                            >
                              101-108
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto" style={{ transform: 'translateY(1px)' }}>
                          <p 
                            className="text-[#B197FC]"
                            style={{ 
                              fontWeight: 400,
                              fontSize: '11px'
                            }}
                          >
                            0 Special Objekt Collected
                          </p>
                        </div>
                      </div>

                      {/* Grid Card 2 */}
                      <div 
                        className="bg-[#171C20] p-4 flex flex-col relative border-[1.3px] border-[#232A30]"
                        style={{ 
                          height: '200px',
                          borderRadius: '12px'
                        }}
                      >
                        <div 
                          className="absolute"
                          style={{ 
                            top: '16px', 
                            right: '14px' 
                          }}
                        >
                          <ChevronRightIcon size={16} fill="#ADB7C0" />
                        </div>
                        <div 
                          className="flex flex-col"
                          style={{ 
                            transform: 'translateX(0px)',
                            gap: '7px'
                          }}
                        >
                          <img 
                            src="/images/Grid.png" 
                            alt="UNIT" 
                            className="w-[40px] h-[40px] object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col" style={{ gap: '12px' }}>
                            <h3 
                              className="text-white leading-none"
                              style={{ 
                                fontWeight: 500,
                                fontSize: '14px'
                              }}
                            >
                              Unit Grid
                            </h3>
                            <p 
                              className="text-[#ADB7C0] leading-none"
                              style={{ 
                                fontWeight: 400,
                                fontSize: '11px'
                              }}
                            >
                              301-302
                            </p>
                          </div>
                        </div>
                        <div className="mt-auto" style={{ transform: 'translateY(1px)' }}>
                          <p 
                            className="text-[#B197FC]"
                            style={{ 
                              fontWeight: 400,
                              fontSize: '11px'
                            }}
                          >
                            0 Unit Objekt Collected
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Grid Season Filter Modal */}
                    <AnimatePresence>
                      {isGridSeasonFilterOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsGridSeasonFilterOpen(false)}
                            className="fixed inset-0 bg-black/60 z-[100]"
                          />
                          <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-[#232A30] rounded-t-[24px] z-[101] flex flex-col overflow-hidden"
                            style={{ height: '360px' }}
                          >
                            <div className="flex justify-center py-3">
                              <div className="w-12 h-1.5 bg-[#49565E] rounded-full" />
                            </div>
                            <div className="px-6 py-4 flex flex-col h-full">
                              <div className="flex justify-between items-center mb-8">
                                <h2 
                                  className="text-white"
                                  style={{ 
                                    fontSize: '18px',
                                    fontWeight: 600
                                  }}
                                >
                                  Season
                                </h2>
                              </div>
                              
                              <div className="flex flex-1 relative">
                                {/* Left Column: Season Names */}
                                <div className="flex-1 space-y-3" style={{ paddingLeft: '0px', paddingRight: '12px' }}>
                                  {SEASON_NAMES.map((name) => {
                                    const isAvailable = !!AVAILABLE_SEASONS[name];
                                    const isSelected = selectedGridSeasonName === name;
                                    
                                    return (
                                      <button
                                        key={name}
                                        disabled={!isAvailable}
                                        onClick={() => {
                                          setSelectedGridSeasonName(name);
                                          if (AVAILABLE_SEASONS[name]) {
                                            setTempGridSeason(`${name}${AVAILABLE_SEASONS[name][0]}`);
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
                                <div className="flex-1 space-y-3" style={{ paddingLeft: '12px', paddingRight: '0px' }}>
                                  {selectedGridSeasonName && AVAILABLE_SEASONS[selectedGridSeasonName]?.map((num) => {
                                    const fullSeason = `${selectedGridSeasonName}${num}`;
                                    const isSelected = tempGridSeason === fullSeason;
                                    
                                    return (
                                      <button
                                        key={num}
                                        onClick={() => setTempGridSeason(fullSeason)}
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

                              <div className="mt-auto pt-6 pb-8">
                                <button 
                                  onClick={() => {
                                    if (tempGridSeason) {
                                      setSelectedGridSeason(tempGridSeason);
                                    }
                                    setIsGridSeasonFilterOpen(false);
                                  }}
                                  className="w-full py-4 bg-[#6E2CFF] text-[#FBFBFB]"
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
                  </motion.div>
                )}

                {activeTab === 'play' && (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col min-h-screen px-4 pb-32 relative"
                    style={{ paddingTop: '0px' }}
                  >
                    <h1 
                      className="font-semibold text-white"
                      style={{ fontSize: '16px', marginBottom: '24px' }}
                    >
                      Enjoy Your Objekt
                    </h1>

                    <div className="grid grid-cols-2" style={{ columnGap: '7px', rowGap: '19px' }}>
                      {[
                        { id: 'proofshot', title: 'Proof Shot', desc: 'Take a photo with your favorite', seed: 'proofshot' },
                        { id: 'lenticular', title: 'Lenticular', desc: 'Combine into a New Set', seed: 'lenticular' },
                        { id: 'spin', title: 'Spin', desc: 'Random Draw', seed: 'spin' },
                        { id: 'deco', title: 'Toploader Deco', desc: 'Customize it to your style', seed: 'deco' }
                      ].map((card) => (
                        <div 
                          key={card.id}
                          className="relative aspect-[3/4] overflow-hidden border-[1.3px] border-[#232A30] mx-auto group"
                          style={{ 
                            borderRadius: '14px',
                            width: 'calc(100% - 9px)',
                            height: 'calc(100% + 4px)'
                          }}
                        >
                          <img 
                            src={`https://picsum.photos/seed/${card.seed}/400/600`} 
                            alt={card.title} 
                            className="absolute inset-0 w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pointer-events-none" 
                            style={{ 
                              height: '30%',
                              opacity: 0.9
                            }}
                          />
                          <div 
                            className="absolute inset-0 p-4 flex flex-col justify-end"
                            style={{ transform: 'translate(-2px, 0px)' }}
                          >
                            <div className="flex justify-between items-end">
                              <div style={{ gap: '6px', display: 'flex', flexDirection: 'column' }}>
                                <h3 
                                  className="font-semibold text-white leading-none"
                                  style={{ fontSize: '14.4px' }}
                                >
                                  {card.title}
                                </h3>
                                <p 
                                  className="text-[#ADB8BE] pr-4"
                                  style={{ 
                                    fontSize: '10.9px', 
                                    lineHeight: 1.55 
                                  }}
                                >
                                  {card.desc}
                                </p>
                              </div>
                              <ChevronRightIcon 
                                size={14} 
                                className="mb-1"
                                fill="#ADB8BE"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

          {/* Unified Detail View */}
          {selectedUnifiedObjektId && (
            <motion.div
              key="unified-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed inset-0 z-[60] bg-[#08090B] flex flex-col"
            >
              <div className="px-4 py-4 flex items-center justify-between">
                <button onClick={() => setSelectedUnifiedObjektId(null)}>
                  <ChevronLeft size={24} className="text-[#FBFBFB]" />
                </button>
                <h2 className="text-[15px] font-semibold text-[#FBFBFB]">
                  {inventory.find(o => o.id === selectedUnifiedObjektId)?.Type}
                </h2>
                <PinIcon size={20} className="text-[#FBFBFB]" />
              </div>
              
              <div className="px-4 pt-1 pb-4 overflow-y-auto flex-1 custom-scrollbar">
                <p className="text-[13px] font-medium text-[#D2D7DD] mb-4">
                  {inventory.filter(o => o.id === selectedUnifiedObjektId).length} items
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {inventory
                    .filter(o => o.id === selectedUnifiedObjektId)
                    .map((objekt, idx) => (
                      <ObjektCard 
                        key={`${objekt.id}-${idx}`} 
                        objekt={objekt} 
                        serialTag={`#${String(objekt.serialNumber || 1).padStart(5, '0')}`}
                        showDetails={false}
                        showBorder={activeFilters.includes('Objekt number')}
                        className="rounded-[7px]"
                        onClick={() => setSelectedObjektForDetail(objekt)}
                      />
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'room' && (
            <motion.div
              key="room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-6 space-y-6"
            >
              <h2 className="text-2xl font-semibold text-[#FBFBFB]">Room</h2>
              <div className="grid grid-cols-1 gap-6">
                <RoomCard 
                  title="Live Replay · 2026.03.23"
                  subtitle="오늘은 행복한(?) 월요일~"
                  image="https://picsum.photos/seed/room1/400/400"
                />
                <RoomCard 
                  title="Live Replay · 2026.03.20"
                  subtitle="Welcome to the Gate"
                  image="https://picsum.photos/seed/room2/400/400"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-20 text-center text-[#D0D7DD]/40"
            >
              <User size={48} className="mx-auto mb-4 opacity-20" />
              <p>Profile content coming soon</p>
            </motion.div>
          )}

          {/* Shop View */}
          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-[#08090B]"
            >
              {/* Shop Header */}
              <div className="sticky top-0 z-50 bg-[#08090B] px-4 py-4 flex items-center justify-between">
                <button onClick={() => setActiveTab('home')} className="p-1">
                  <ChevronLeft size={24} className="text-[#FBFBFB]" />
                </button>
                <h2 className="text-[15px] font-semibold text-[#FBFBFB] absolute left-1/2 -translate-x-1/2">Shop</h2>
                <div className="flex items-center gap-[20px] bg-[#171C20] rounded-[10px] px-[6px] py-[4px] border-[1.4px] border-[#232A30]">
                  <ComoIcon className="w-[17px] h-[17px] text-[#395EC6]" />
                  <span className="text-[13px] font-medium text-[#FBFBFB]">{stats.como}</span>
                </div>
              </div>

              {/* Shop Content */}
              <div className="px-4 pb-24">
                <div className="py-4">
                  <span className="text-[14px] font-medium text-[#FBFBFB]">{PACKS.length} items</span>
                </div>

                <div className="grid grid-cols-2 gap-x-[15px] gap-y-[25px]">
                  {PACKS.map(pack => {
                    const representativeObjekt = OBJEKT_POOL.find(o => 
                      o.Season === pack.season && pack.possibleClasses.includes(o.Class as any)
                    ) || OBJEKT_POOL[0];

                    return (
                      <div 
                        key={pack.id} 
                        className="flex flex-col gap-[10px] cursor-pointer"
                        onClick={() => {
                          setSelectedPack(pack);
                          setSelectedQuantity(1);
                          setActiveTab('pack-detail');
                        }}
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square bg-[#171C20] rounded-[15px] border-[1.4px] border-[#232A30] overflow-hidden flex items-center justify-center">
                          {/* White radial glow behind the objekt - 100% opacity, 20px blur, 40% size */}
                          <div className="absolute w-[40%] h-[40%] bg-white/100 blur-[20px] rounded-full pointer-events-none" />

                          <div className="relative w-full h-full flex items-center justify-center p-4">
                            {/* Objekt Card in the center */}
                            <div className="relative w-[55%] aspect-[1/1.5448] rounded-[4px] overflow-hidden shadow-2xl">
                              <img 
                                src={representativeObjekt.imageUrl} 
                                alt={representativeObjekt.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              
                              {/* Inner Glow and Shadow Overlays for the Objekt Card - 60%/75% opacity, 2px/3px blur, 1px/-2px size */}
                              <div 
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  boxShadow: `
                                    inset 1px 1px 2px rgba(255, 255, 255, 0.6),
                                    inset -2px -2px 3px rgba(0, 0, 0, 0.75)
                                  `
                                }}
                              />
                            </div>

                            {/* Pack Overlay - Bottom Left */}
                            <div className="absolute bottom-[15%] left-[18%] w-[25%] aspect-[2/3] z-10 drop-shadow-xl rotate-[-5deg]">
                              <img 
                                src={pack.imageUrl} 
                                alt="Pack" 
                                className="w-full h-full object-cover rounded-[2px]"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-[2px]">
                          <h3 className="text-[14px] font-semibold text-[#FBFBFB] leading-tight">{pack.name}</h3>
                          <p className="text-[12.5px] font-normal text-[#AEB7BE]">{pack.description}</p>
                          <div className="flex items-center gap-1 pt-[2px]">
                            <ComoIcon className="w-[13px] h-[13px] text-[#395EC6]" />
                            <span className="text-[13px] font-medium text-white">{pack.price}</span>
                          </div>
                          <div className="pt-[4px] text-[11px] font-medium flex items-center gap-1">
                            <span className="text-[#B49CFE]">{pack.class}</span>
                            <span className="text-[#7E8892]">· {pack.range} ({pack.typeCount} types)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Pack Detail View */}
          {activeTab === 'pack-detail' && selectedPack && (
            <motion.div
              key="pack-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-screen bg-[#08090B] pb-32"
            >
              {/* Top Container - 1.75:1 ratio */}
              <div className="relative w-full aspect-[1.75/1] bg-[#171C20] flex items-center justify-center overflow-hidden">
                {/* Back Button */}
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="absolute top-4 left-4 p-2 z-10"
                >
                  <ChevronLeft size={24} className="text-[#FBFBFB]" />
                </button>

                {/* Objekt Preview (copied from shop item) */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* White radial glow behind the objekt - 65% opacity, 20px blur, 32% size */}
                  <div 
                    className="absolute bg-white rounded-full pointer-events-none" 
                    style={{
                      width: '32%',
                      height: '32%',
                      opacity: 0.65,
                      filter: 'blur(20px)'
                    }}
                  />

                  <div className="relative w-full h-full flex items-center justify-center p-4">
                    {/* Objekt Card in the center */}
                    {(() => {
                      const representativeObjekt = OBJEKT_POOL.find(o => 
                        o.Season === selectedPack.season && selectedPack.possibleClasses.includes(o.Class as any)
                      ) || OBJEKT_POOL[0];
                      return (
                        <>
                          <div 
                            className="relative h-[80%] aspect-[1/1.5448] overflow-hidden shadow-2xl rounded-[8px]"
                          >
                            <img 
                              src={representativeObjekt.imageUrl} 
                              alt={representativeObjekt.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Inner Glow and Shadow Overlays for the Objekt Card */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                boxShadow: `
                                  inset 1px 1px 2px rgba(255, 255, 255, 0.6),
                                  inset -2px -2px 3px rgba(0, 0, 0, 0.75)
                                `
                              }}
                            />
                          </div>

                          {/* Pack Overlay - Bottom Left */}
                          <div className="absolute bottom-[10%] left-[28%] w-[18%] aspect-[2/3] z-10 drop-shadow-xl rotate-[-5deg]">
                            <img 
                              src={selectedPack.imageUrl} 
                              alt="Pack" 
                              className="w-full h-full object-cover rounded-[2px]"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Pack Info */}
              <div 
                className="space-y-0 px-4 pt-[18px]"
              >
                <div className="mb-[3px]">
                  <h2 className="text-[19px] font-semibold text-[#FBFBFB]">
                    {selectedPack.name}
                  </h2>
                </div>
                <div className="mb-[3px]">
                  <p className="text-[13px] font-medium text-[#AEB7BE]">
                    {selectedPack.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 pt-[3px]">
                  <span className="text-[13px] font-medium text-[#B49CFE]">
                    {selectedPack.class}
                  </span>
                  <span className="text-[13px] font-medium text-[#7E8892]">
                    · {selectedPack.range} ({selectedPack.typeCount} types)
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 px-4 pt-[24px]">
                <h3 className="text-[13px] font-bold text-[#FBFBFB]">
                  Option
                </h3>
                <div className="space-y-3">
                  {[1, 4, 8, 12].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setSelectedQuantity(qty)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-[12px] border-[1.4px] transition-all",
                        selectedQuantity === qty 
                          ? "bg-[#171C20] border-[#6E2CFF]" 
                          : "bg-transparent border-[#232A30]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-[1.4px] flex items-center justify-center transition-colors",
                          selectedQuantity === qty ? "bg-[#6E2CFF] border-[#6E2CFF]" : "border-[#232A30]"
                        )}>
                          {selectedQuantity === qty && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} className="text-white" strokeWidth={3} /></motion.div>}
                        </div>
                        <span className="text-[15px] font-medium text-[#FBFBFB]">{qty}x</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ComoIcon className="w-[16px] h-[16px] text-[#395EC6]" />
                        <span className="text-[15px] font-bold text-[#FBFBFB]">{(selectedPack.price * qty).toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchase Button */}
              <div className="fixed bottom-0 left-0 right-0 py-6 bg-[#08090B] px-4">
                <button
                  onClick={handlePurchase}
                  className="w-full bg-[#6E2CFF] text-white font-semibold rounded-[13px] h-[50px] text-[14.5px]"
                >
                  Purchase {selectedQuantity} item{selectedQuantity > 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      {activeTab !== 'shop' && activeTab !== 'pack-detail' && (
        <nav 
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 bg-[#171C20] border-t-[1.3px] border-[#2A333A] flex items-center",
            (activeTab === 'collect' || activeTab === 'grid' || activeTab === 'play') ? "pl-4 pr-0" : "px-4"
          )}
          style={{ height: '62px' }}
        >
          <div className={cn(
            "mx-auto flex justify-between items-center h-full",
            (activeTab === 'collect' || activeTab === 'grid' || activeTab === 'play') ? "w-full" : "max-w-md w-full"
          )}>
            {(activeTab === 'collect' || activeTab === 'grid' || activeTab === 'play') ? (
              <div className="flex w-full items-center h-full relative">
                {/* Previous Page Part */}
                <div className="w-[100px] pr-4 flex justify-center items-center h-full relative">
                  <div style={{ transform: 'translateX(-6px)' }}>
                    <NavButton 
                      active={false} 
                      onClick={() => setActiveTab(previousTab)}
                      icon={
                        previousTab === 'home' ? <HomeIcon active={false} /> :
                        previousTab === 'rekord' ? <RekordIcon active={false} /> :
                        previousTab === 'room' ? <RoomIcon active={false} /> :
                        previousTab === 'profile' ? <ProfileIcon active={false} /> :
                        <HomeIcon active={false} />
                      }
                      label={previousTab.charAt(0).toUpperCase() + previousTab.slice(1)}
                      textSize={12}
                      iconSize={previousTab === 'rekord' ? 19 + 3 : 19}
                      gap={2}
                    />
                  </div>
                  {/* Vertical Divider */}
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[1.3px] bg-[#2A333A]"
                    style={{ height: '40px' }}
                  />
                </div>
                
                {/* Collect Sub-menu Part */}
                <div className="flex-1 flex justify-center items-center h-full">
                  <div 
                    className="flex justify-around w-full"
                    style={{ marginLeft: '12px', marginRight: '12px' }}
                  >
                    <NavButton 
                      active={activeTab === 'collect'} 
                      onClick={() => setActiveTab('collect')}
                      layoutId="collect"
                      icon={<CollectIcon active={activeTab === 'collect'} />}
                      label="Collect"
                      textSize={12}
                      iconSize={19}
                      gap={2}
                    />
                    <NavButton 
                      active={activeTab === 'grid'} 
                      onClick={() => setActiveTab('grid')}
                      icon={<GridIcon active={activeTab === 'grid'} />}
                      label="Grid"
                      textSize={12}
                      iconSize={19}
                      gap={2}
                    />
                    <NavButton 
                      active={activeTab === 'play'} 
                      onClick={() => setActiveTab('play')}
                      icon={<PlayIcon active={activeTab === 'play'} />}
                      label="Play"
                      textSize={12}
                      iconSize={19}
                      gap={2}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="flex w-full justify-between items-center h-full"
                style={{ gap: '12px' }}
              >
                <NavButton 
                  active={activeTab === 'home'} 
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('home');
                  }}
                  icon={<HomeIcon active={activeTab === 'home'} />}
                  label="Home"
                  textSize={12}
                  iconSize={19}
                  gap={2}
                />
                <NavButton 
                  active={activeTab === 'rekord'} 
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('rekord');
                  }}
                  icon={<RekordIcon active={activeTab === 'rekord'} />}
                  label="Rekord"
                  textSize={12}
                  iconSize={19 + 3}
                  gap={2}
                />
                <NavButton 
                  active={activeTab === 'collect'} 
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('collect');
                  }}
                  layoutId="collect"
                  icon={<CollectIcon active={activeTab === 'collect'} />}
                  label="Collect"
                  textSize={12}
                  iconSize={19}
                  gap={2}
                />
                <NavButton 
                  active={activeTab === 'room'} 
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('room');
                  }}
                  icon={<RoomIcon active={activeTab === 'room'} />}
                  label="Room"
                  textSize={12}
                  iconSize={19}
                  gap={2}
                />
                <NavButton 
                  active={activeTab === 'profile'} 
                  onClick={() => {
                    setPreviousTab(activeTab);
                    setActiveTab('profile');
                  }}
                  icon={<ProfileIcon active={activeTab === 'profile'} />}
                  label="Profile"
                  textSize={12}
                  iconSize={19}
                  gap={2}
                />
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Pack Opening Modal */}
      <AnimatePresence>
        {openingPack && (
          <PackOpening 
            pack={openingPack} 
            onClose={handlePackFinish} 
            inventory={inventory}
          />
        )}
      </AnimatePresence>

      {/* Artist Filter Modal */}
      <ArtistFilterModal 
        isOpen={isArtistFilterOpen}
        onClose={() => setIsArtistFilterOpen(false)}
        selectedArtists={selectedArtists}
        selectedTypes={selectedTypes}
        selectedOnlineStatus={selectedOnlineStatus}
        selectedSeason={selectedSeason}
        initialTab={initialFilterTab}
        height={60}
        onApply={(artists, types, onlineStatus, season) => {
          setSelectedArtists(artists);
          setSelectedTypes(types);
          setSelectedOnlineStatus(onlineStatus);
          setSelectedSeason(season);
          if (artists.length > 0) {
            if (!activeFilters.includes('Artist')) {
              setActiveFilters(prev => [...prev, 'Artist']);
            }
          } else {
            setActiveFilters(prev => prev.filter(f => f !== 'Artist'));
          }
          if (types.length > 0) {
            if (!activeFilters.includes('Type')) {
              setActiveFilters(prev => [...prev, 'Type']);
            }
          } else {
            setActiveFilters(prev => prev.filter(f => f !== 'Type'));
          }
          if (onlineStatus.length > 0) {
            if (!activeFilters.includes('On/Offline')) {
              setActiveFilters(prev => [...prev, 'On/Offline']);
            }
          } else {
            setActiveFilters(prev => prev.filter(f => f !== 'On/Offline'));
          }
          if (season) {
            if (!activeFilters.includes('Season')) {
              setActiveFilters(prev => [...prev, 'Season']);
            }
          } else {
            setActiveFilters(prev => prev.filter(f => f !== 'Season'));
          }
        }}
      />


      {/* Detailed Objekt View */}
      <AnimatePresence>
        {selectedObjektForDetail && (
          <DetailedObjektView 
            objekt={selectedObjektForDetail} 
            onClose={() => setSelectedObjektForDetail(null)} 
            showBorder={activeFilters.includes('Objekt number')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function NavButton({ active, onClick, icon, label, layoutId, textSize, iconSize, gap }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, layoutId?: string, textSize?: number, iconSize?: number, gap?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center flex-1",
        active ? "text-[#FBFBFD]" : "text-[#7C8992]"
      )}
      style={{ gap: gap !== undefined ? `${gap}px` : '4px' }}
    >
      <div 
        className="relative flex items-center justify-center"
        style={{ height: iconSize ? iconSize + 4 : 24, width: iconSize ? iconSize + 4 : 24 }}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={layoutId ? layoutId : label}
            layoutId={layoutId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: iconSize } as any) : icon}
          </motion.div>
        </AnimatePresence>
      </div>
      <span 
        className={cn(
          "tracking-tight",
          active ? "font-semibold" : "font-normal"
        )}
        style={{ fontSize: textSize ? `${textSize}px` : '12px' }}
      >{label}</span>
    </button>
  );
}

function QuickMenuIcon({ imageUrl, label }: { imageUrl: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-[61px] h-[61px] rounded-full bg-[#232A30] flex items-center justify-center overflow-hidden">
        <img src={imageUrl} alt={label} className="w-[37px] h-[37px] object-cover" referrerPolicy="no-referrer" />
      </div>
      <span className="text-[13px] font-medium text-[#D0D7DD] whitespace-nowrap">{label}</span>
    </div>
  );
}

function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + HERO_IMAGES.length) % HERO_IMAGES.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <div className="px-4">
      <div className="relative aspect-[3.6/1] rounded-[12px] overflow-hidden border border-[#26292E] bg-[#171C20]">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) {
                paginate(1);
              } else if (swipe > 10000) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <div className="w-full h-full relative">
              <img 
                src={HERO_IMAGES[currentIndex].url} 
                alt={HERO_IMAGES[currentIndex].title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center z-10 select-none">
                <div className="text-center">
                  <h2 className="text-3xl font-black tracking-tighter italic text-[#FBFBFB] opacity-90">
                    {HERO_IMAGES[currentIndex].title}
                  </h2>
                  <div className="flex gap-4 mt-2 text-[8px] uppercase tracking-widest text-[#D0D7DD]/60">
                    {HERO_IMAGES[currentIndex].tags.map(tag => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots - Reference Image Style */}
        <div className="absolute bottom-[7px] right-[7px] bg-black/35 px-[4px] py-[3px] rounded-full flex items-center gap-[3.5px] z-20">
          {HERO_IMAGES.map((_, index) => (
            <motion.div
              key={index}
              initial={false}
              animate={{
                width: currentIndex === index ? 11 : 4.5,
                backgroundColor: currentIndex === index ? "#FFFFFF" : "#CED7DC"
              }}
              className="h-[4.5px] rounded-full cursor-pointer transition-colors duration-300"
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomCard({ title, subtitle, image }: { title: string, subtitle: string, image: string }) {
  const [name, date] = title.split(' · ');
  return (
    <div className="min-w-[250px] bg-[#171C20] rounded-[12px] overflow-hidden">
      <div className="p-4 space-y-1">
        <p className="text-[11px]">
          <span className="font-semibold text-[#B59DFF]">{name}</span>
          {name && date && <span className="mx-1 text-[#7C8992]">·</span>}
          <span className="font-normal text-[#7C8992]">{date}</span>
        </p>
        <p className="text-sm font-normal text-[#FBFBFB]">{subtitle}</p>
      </div>
      <div className="aspect-square relative">
        <img src={image} alt={subtitle} className="w-full h-full object-cover" />
        <img 
          src="/images/Membership.png" 
          alt="Icon" 
          className="absolute top-[12px] left-[12px] w-[28px] h-[28px] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function FilterDropdown({ label, active, onClick, chevronClassName }: { label: string; active?: boolean; onClick?: () => void; chevronClassName?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-[30px] px-3 rounded-[12px] border-[1.3px] text-[13px] font-medium whitespace-nowrap flex items-center gap-1",
        active
          ? "bg-[#FAFAFA] border-[#232A30] text-[#232A30]"
          : "bg-[#171C20] border-[#232A30] text-[#ADB7C0]"
      )}
    >
      {label} <ChevronDown size={14} className={chevronClassName} />
    </button>
  );
}
