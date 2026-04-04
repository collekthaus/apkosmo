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
  Pin
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
  ProfileIcon
} from './components/Icons';

import { DetailedObjektView } from './components/DetailedObjektView';

type Tab = 'home' | 'rekord' | 'collect' | 'room' | 'profile' | 'shop' | 'pack-detail';

const HERO_IMAGES = [
  {
    id: 1,
    url: "https://cdn.discordapp.com/attachments/481245079311482894/1453804945194356806/1000313779.jpg?ex=69ceaa5d&is=69cd58dd&hm=2e9b91260c69353215077b8d2b35dbd9155173e82381a7e21011d59a7414629d&",
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

  const unifiedInventory = inventory.reduce((acc, objekt) => {
    const existing = acc.find(o => o.id === objekt.id);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
    } else {
      acc.push({ ...objekt, count: 1 });
    }
    return acc;
  }, [] as (Objekt & { count?: number })[]);

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
      initialInventory = [OBJEKT_POOL[0], OBJEKT_POOL[2]];
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
    let currentTotal = stats.totalObjekts;
    for (let q = 0; q < quantity; q++) {
      for (let i = 0; i < pack.count; i++) {
        const possible = OBJEKT_POOL.filter(o => pack.possibleClasses.includes(o.Class as any));
        const random = possible[Math.floor(Math.random() * possible.length)];
        currentTotal++;
        newObjekts.push({
          ...random,
          serialNumber: currentTotal,
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
                src="https://cdn.discordapp.com/attachments/481245079311482894/1453804945194356806/1000313779.jpg?ex=69ceaa5d&is=69cd58dd&hm=2e9b91260c69353215077b8d2b35dbd9155173e82381a7e21011d59a7414629d&"
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
              {activeTab !== 'collect' && (
                <div className="flex items-center gap-[20px] bg-[#171C20] rounded-[10px] px-[6px] py-[4px] border-[1.4px] border-[#232A30]">
                  <ComoIcon className="w-[17px] h-[17px] text-[#395EC6]" />
                  <span className="text-[13px] font-medium text-[#FBFBFB]">{stats.como}</span>
                </div>
              )}
              {activeTab !== 'home' && <QRCodeIcon className="w-[18px] h-[18px] text-[#D0D7DD]" />}
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
                  <img src="https://cdn.discordapp.com/attachments/481245079311482894/1489375287434154174/IMG_20260402_182506.png?ex=69d03053&is=69ceded3&hm=79e294fb08463cb3bfec5db3419f1dc2a47b1d55f012370269fe5add4f863e2c&" alt="Announcement" className="w-[25px] h-[25px]" referrerPolicy="no-referrer" />
                  <p className="text-[13px] text-[#D0D7DF] font-medium">There's a new announcement</p>
                </div>
              </div>

              {/* Hero Banner Carousel */}
              <HeroCarousel />

              {/* Quick Menu */}
              <div className="px-4 flex gap-[18px] overflow-x-auto hide-scrollbar py-2 mt-[8px]">
                <QuickMenuIcon imageUrl="https://cdn.discordapp.com/attachments/481245079311482894/1488261922942881822/IMG_20260330_164122.png?ex=69cc236c&is=69cad1ec&hm=f35ef058a6f00c14e7773fe29d57b675a1cfdd20f5d8f768447408ba88cfc8b7&" label="Grid" />
                <QuickMenuIcon imageUrl="https://cdn.discordapp.com/attachments/481245079311482894/1488264823492968468/IMG_20260330_164821.png?ex=69cc2620&is=69cad4a0&hm=c748c8ae96cc73f524fcedc3d08de1845922c3573de275795c7550f1fa520ab6&" label="Spin" />
                <QuickMenuIcon imageUrl="https://cdn.discordapp.com/attachments/481245079311482894/1488264822574546995/IMG_20260330_164845.png?ex=69cc2620&is=69cad4a0&hm=c5cba628b139a6e4fe9ebe0eb99ce1db25ff4260cd64358e370934f457095490&" label="Proof Shot" />
                <QuickMenuIcon imageUrl="https://cdn.discordapp.com/attachments/481245079311482894/1488264823052435628/IMG_20260330_164830.png?ex=69cc2620&is=69cad4a0&hm=8cdf5fc5270c0b063244ae70a48d82a90205548fa1213208680865775873bf6c&" label="Lenticular" />
                <QuickMenuIcon imageUrl="https://cdn.discordapp.com/attachments/481245079311482894/1488264822251589885/IMG_20260330_164854.png?ex=69cc2620&is=69cad4a0&hm=f5f36123deecf7ac325e586042cf4432d56a71c465997960fffd0abb45749001&" label="Toploader" />
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

          {activeTab === 'collect' && (
            <motion.div
              key="collect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Filters */}
              <div className="px-4 py-4 flex items-center gap-[10px] overflow-x-auto hide-scrollbar">
                <button className="h-[30px] px-3 bg-[#171C20] rounded-[12px] border-[1.3px] border-[#232A30] text-[13px] font-medium text-[#ADB7C0] whitespace-nowrap">
                  Objekt number
                </button>
                
                <div className="w-[1.5px] h-[22px] bg-[#171C20] flex-shrink-0" />

                <FilterDropdown label="Artist" />
                <FilterDropdown label="Season" />
                <FilterDropdown label="Type" />
                <button className="h-[30px] px-3 bg-[#171C20] rounded-[12px] border-[1.3px] border-[#232A30] text-[13px] font-medium text-[#ADB7C0] whitespace-nowrap flex items-center gap-1">
                  On/Offline <ChevronDown size={14} />
                </button>
                <button className="h-[30px] px-3 bg-[#171C20] rounded-[12px] border-[1.3px] border-[#232A30] text-[13px] font-medium text-[#ADB7C0] whitespace-nowrap flex items-center gap-1">
                  Other <ChevronDown size={14} />
                </button>
              </div>

              {/* Count & Sort */}
              <div className="px-4 py-2 flex justify-between items-center text-[13px] font-medium text-[#D2D7DD]">
                <span>{inventory.length} types</span>
                <div className="flex items-center gap-1">
                  <span>Newest</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Grid */}
              <div className="px-4 grid grid-cols-3 gap-2 mt-2">
                {unifiedInventory.length === 0 ? (
                  <div className="col-span-3 flex flex-col items-center justify-center py-32">
                    <img 
                      src="https://cdn.discordapp.com/attachments/481245079311482894/1489672671519309874/assets_images_image_empty_objekt.png?ex=69d14549&is=69cff3c9&hm=814123dcba353030ac8b129ad588ca68a76d782dbb48763c6b29268d96ec95ac&" 
                      alt="Empty Collection" 
                      className="w-[90px] h-auto"
                      referrerPolicy="no-referrer"
                    />
                    <p className="mt-[20px] text-[12px] font-normal text-[#ADB7C0]">
                      You don't have any Objekts yet
                    </p>
                  </div>
                ) : (
                  unifiedInventory.map((objekt, idx) => (
                    <ObjektCard 
                      key={`${objekt.id}-${idx}`} 
                      objekt={objekt} 
                      count={objekt.count}
                      className="rounded-[7px]"
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
                <Pin size={20} className="text-[#FBFBFB]" />
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
                        serialTag={`#${String(objekt.serialNumber || 0).padStart(5, '0')}`}
                        showDetails={false}
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
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#171C20] border-t-[1.3px] border-[#2A3338] px-4 pt-3 pb-[10px]">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')}
              icon={<HomeIcon active={activeTab === 'home'} />}
              label="Home"
            />
            <NavButton 
              active={activeTab === 'rekord'} 
              onClick={() => setActiveTab('rekord')}
              icon={<RekordIcon active={activeTab === 'rekord'} />}
              label="Rekord"
            />
            <NavButton 
              active={activeTab === 'collect'} 
              onClick={() => setActiveTab('collect')}
              icon={<CollectIcon active={activeTab === 'collect'} />}
              label="Collect"
            />
            <NavButton 
              active={activeTab === 'room'} 
              onClick={() => setActiveTab('room')}
              icon={<RoomIcon active={activeTab === 'room'} />}
              label="Room"
            />
            <NavButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
              icon={<ProfileIcon active={activeTab === 'profile'} />}
              label="Profile"
            />
          </div>
        </nav>
      )}

      {/* Pack Opening Modal */}
      <AnimatePresence>
        {openingPack && (
          <PackOpening 
            pack={openingPack} 
            onClose={handlePackFinish} 
            totalObjekts={stats.totalObjekts}
          />
        )}
      </AnimatePresence>

      {/* Detailed Objekt View */}
      <AnimatePresence>
        {selectedObjektForDetail && (
          <DetailedObjektView 
            objekt={selectedObjektForDetail} 
            onClose={() => setSelectedObjektForDetail(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 flex-1",
        active ? "text-[#FBFBFD]" : "text-[#7C8992]"
      )}
    >
      {icon}
      <span className={cn(
        "text-[12px] tracking-tight",
        active ? "font-semibold" : "font-normal"
      )}>{label}</span>
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
          src="https://cdn.discordapp.com/attachments/481245079311482894/1489449764616671272/IMG_20260402_232118.png?ex=69d075b0&is=69cf2430&hm=a6f4cde9d758cfc765940fc8a6e76225154664f4ee8db9fcc9b3b313b168b605&" 
          alt="Icon" 
          className="absolute top-[12px] left-[12px] w-[28px] h-[28px] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function FilterDropdown({ label }: { label: string }) {
  return (
    <button className="h-[30px] px-3 bg-[#171C20] rounded-[12px] border-[1.3px] border-[#232A30] text-[13px] font-medium text-[#ADB7C0] whitespace-nowrap flex items-center gap-1">
      {label} <ChevronDown size={14} />
    </button>
  );
}
