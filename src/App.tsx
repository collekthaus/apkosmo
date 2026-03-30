import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Heart
} from 'lucide-react';
import { Objekt, Pack, UserStats } from './types';
import { PACKS, OBJEKT_POOL } from './constants';
import { ObjektCard } from './components/ObjektCard';
import { PackOpening } from './components/PackOpening';
import { cn } from './lib/utils';

type Tab = 'home' | 'rekord' | 'collect' | 'room' | 'profile' | 'shop';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [inventory, setInventory] = useState<Objekt[]>([]);
  const [stats, setStats] = useState<UserStats>({
    como: 1000,
    totalObjekts: 0,
    uniqueObjekts: 0
  });
  const [openingPack, setOpeningPack] = useState<Pack | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedInventory = localStorage.getItem('cosmo_inventory');
    const savedStats = localStorage.getItem('cosmo_stats');
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedStats) setStats(JSON.parse(savedStats));
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

  const handlePackFinish = (newObjekts: Objekt[]) => {
    const updatedInventory = [...inventory, ...newObjekts];
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
      <header className="sticky top-0 z-40 bg-[#08090B] px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-black tracking-tighter lowercase text-[#FBFBFB]">cosmo</h1>
          <ChevronDown size={16} className="text-[#D0D7DD]/60" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('shop')} className="px-4 py-1.5 bg-[#6E2CFF] text-white font-bold rounded-[12px] text-sm relative">
            Shop
            <div className="absolute -top-1 -right-1 bg-[#6E2CFF] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#08090B]">N</div>
          </button>
          <div className="flex items-center gap-2 bg-[#171C20] rounded-[12px] px-3 py-1.5 border border-[#232A30]">
            <div className="w-4 h-4 rounded-full bg-[#6E2CFF]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#6E2CFF]" />
            </div>
            <span className="text-sm font-bold text-[#FBFBFB]">{stats.como}</span>
          </div>
          <Grid3X3 size={20} className="text-[#D0D7DD]/80" />
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Announcement */}
              <div className="px-4">
                <div className="bg-[#171C20] rounded-[12px] p-4 flex items-center gap-3 border border-[#232A30]">
                  <Megaphone size={18} className="text-[#6E2CFF]" />
                  <p className="text-sm text-[#D0D7DD]/80">There's a new announcement</p>
                </div>
              </div>

              {/* Hero Banner */}
              <div className="px-4">
                <div className="relative aspect-[21/9] rounded-[12px] overflow-hidden bg-gradient-to-r from-[#6E2CFF]/20 via-[#08090B] to-[#6E2CFF]/10 border border-[#232A30] flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter italic text-[#FBFBFB] opacity-90">find your cosmo</h2>
                    <div className="flex gap-4 mt-2 text-[8px] uppercase tracking-widest text-[#D0D7DD]/40">
                      <span>unevermst</span>
                      <span>yeswaare</span>
                      <span>itsnotover</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Menu */}
              <div className="px-4 flex justify-between overflow-x-auto hide-scrollbar py-2">
                <QuickMenuIcon icon={<Grid3X3 size={24} />} label="Grid" color="bg-[#6E2CFF]/10" />
                <QuickMenuIcon icon={<RotateCcw size={24} />} label="Spin" color="bg-[#6E2CFF]/10" />
                <QuickMenuIcon icon={<Camera size={24} />} label="Proof Shot" color="bg-[#6E2CFF]/10" />
                <QuickMenuIcon icon={<Layers size={24} />} label="Lenticular" color="bg-[#6E2CFF]/10" />
                <QuickMenuIcon icon={<Star size={24} />} label="Toploader" color="bg-[#6E2CFF]/10" />
              </div>

              {/* Room Section */}
              <div className="space-y-4">
                <div className="px-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#FBFBFB]">Room</h3>
                  <div className="flex items-center text-[#D0D7DD]/40 text-xs">
                    <span>View more</span>
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

          {activeTab === 'collect' && (
            <motion.div
              key="collect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Tabs */}
              <div className="flex border-b border-[#232A30] px-4">
                <button className="flex-1 py-3 text-center font-bold tab-active">Objekt</button>
                <button className="flex-1 py-3 text-center font-bold tab-inactive">OMA</button>
              </div>

              {/* Filters */}
              <div className="px-4 py-4 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <button className="p-2 bg-[#171C20] rounded-[12px] border border-[#232A30]">
                  <RotateCcw size={18} />
                </button>
                <div className="flex-1 min-w-[140px] bg-[#171C20] rounded-[12px] border border-[#232A30] px-3 py-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#D0D7DD]/80">Objekt number</span>
                </div>
                <FilterDropdown label="Artist" />
                <FilterDropdown label="Season" />
              </div>

              {/* Count & Sort */}
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-xs font-bold text-[#D0D7DD]/60">{inventory.length} types</span>
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span>Newest</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Grid */}
              <div className="px-4 grid grid-cols-3 gap-2">
                {inventory.length === 0 ? (
                  <div className="col-span-3 py-20 text-center text-[#D0D7DD]/40 text-sm">
                    No Objekts collected yet.
                  </div>
                ) : (
                  inventory.map((objekt, idx) => (
                    <ObjektCard key={`${objekt.id}-${idx}`} objekt={objekt} />
                  ))
                )}
              </div>
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
                <h2 className="text-lg font-bold text-[#FBFBFB]">Shop</h2>
                <div className="flex items-center gap-2 bg-[#171C20] rounded-full px-3 py-1.5 border border-[#232A30]">
                  <div className="w-4 h-4 rounded-full bg-[#6E2CFF]/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#6E2CFF]" />
                  </div>
                  <span className="text-sm font-bold text-[#FBFBFB]">{stats.como}</span>
                </div>
              </div>

              {/* Shop Content */}
              <div className="px-4 pb-24">
                <div className="py-4">
                  <span className="text-lg font-bold text-[#FBFBFB]">{PACKS.length}개</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                  {PACKS.map(pack => (
                    <div key={pack.id} className="flex flex-col gap-3">
                      {/* Image Container */}
                      <div className="relative aspect-square bg-[#171C20] rounded-[12px] border border-[#232A30] overflow-hidden flex items-center justify-center">
                        {/* Collage Simulation */}
                        <div className="relative w-full h-full p-4">
                          <img 
                            src={pack.imageUrl} 
                            alt={pack.name} 
                            className="w-full h-full object-cover opacity-80" 
                          />
                          {/* Sale Badge */}
                          <div className="absolute top-2 right-2 z-10">
                            <div className="relative">
                              <div className="w-16 h-16 bg-[#6E2CFF] flex items-center justify-center rotate-12" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
                                <div className="text-center -rotate-12">
                                  <div className="text-[8px] font-black leading-none">SALE</div>
                                  <div className="text-xs font-black leading-none">1+3</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#FBFBFB] leading-tight">{pack.name}</h3>
                        <p className="text-xs font-bold text-[#D0D7DD]/60">{pack.description}</p>
                        <p className="text-sm font-bold text-[#FBFBFB] pt-1">COMO {pack.price}</p>
                        <p className="text-[10px] font-bold text-[#6E2CFF] pt-1">
                          Basic · 101Z - 104Z ({pack.count} types)
                        </p>
                        
                        {/* Membership Badge */}
                        <div className="pt-2">
                          <div className="inline-flex items-center gap-1 bg-[#6E2CFF]/20 text-[#6E2CFF] px-2 py-1 rounded-full border border-[#6E2CFF]/30">
                            <Heart size={10} fill="currentColor" />
                            <span className="text-[9px] font-bold">50% Off Membership</span>
                          </div>
                        </div>
                      </div>

                      {/* Buy Button (Optional, but good for UX) */}
                      <button 
                        onClick={() => handleOpenPack(pack)}
                        className="mt-2 w-full py-2 bg-[#6E2CFF] text-white text-xs font-bold rounded-[12px] active:scale-95 transition-transform"
                      >
                        BUY PACK
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#171C20] border-t border-[#2A3338] px-4 py-3">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
            icon={<Home size={22} />}
            label="Home"
          />
          <NavButton 
            active={activeTab === 'rekord'} 
            onClick={() => setActiveTab('rekord')}
            icon={<CircleDashed size={22} />}
            label="Rekord"
          />
          <NavButton 
            active={activeTab === 'collect'} 
            onClick={() => setActiveTab('collect')}
            icon={<LayoutGrid size={22} />}
            label="Collect"
          />
          <NavButton 
            active={activeTab === 'room'} 
            onClick={() => setActiveTab('room')}
            icon={<DoorOpen size={22} />}
            label="Room"
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<User size={22} />}
            label="Profile"
          />
        </div>
      </nav>

      {/* Pack Opening Modal */}
      <AnimatePresence>
        {openingPack && (
          <PackOpening 
            pack={openingPack} 
            onClose={handlePackFinish} 
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
        active ? "text-[#6E2CFF]" : "text-[#D0D7DD]/40"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}

function QuickMenuIcon({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[70px]">
      <div className={cn("w-14 h-14 rounded-[12px] flex items-center justify-center", color)}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-[#D0D7DD]/60">{label}</span>
    </div>
  );
}

function RoomCard({ title, subtitle, image }: { title: string, subtitle: string, image: string }) {
  return (
    <div className="min-w-[280px] bg-[#171C20] rounded-[12px] overflow-hidden border border-[#232A30]">
      <div className="p-4 space-y-1">
        <p className="text-[10px] font-bold text-[#6E2CFF]">{title}</p>
        <p className="text-sm font-bold text-[#FBFBFB]">{subtitle}</p>
      </div>
      <div className="aspect-square relative">
        <img src={image} alt={subtitle} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#6E2CFF]/20 backdrop-blur-md flex items-center justify-center">
          <Star size={16} className="text-[#6E2CFF]" />
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ label }: { label: string }) {
  return (
    <div className="bg-[#171C20] rounded-[12px] border border-[#232A30] px-3 py-2 flex items-center gap-2 whitespace-nowrap">
      <span className="text-xs font-bold text-[#D0D7DD]/80">{label}</span>
      <ChevronDown size={14} className="text-[#D0D7DD]/40" />
    </div>
  );
}
