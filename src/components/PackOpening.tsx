import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pack, Objekt } from '../types';
import { OBJEKT_POOL } from '../constants';
import { ObjektCard } from './ObjektCard';
import confetti from 'canvas-confetti';

interface PackOpeningProps {
  pack: Pack;
  onClose: (newObjekts: Objekt[]) => void;
  totalObjekts: number;
}

export const PackOpening: React.FC<PackOpeningProps> = ({ pack, onClose, totalObjekts }) => {
  const [step, setStep] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const [revealedObjekts, setRevealedObjekts] = useState<Objekt[]>([]);

  const handleOpen = () => {
    setStep('opening');
    
    // Simulate gacha logic
    const newObjekts: Objekt[] = [];
    let currentTotal = totalObjekts;
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

    setTimeout(() => {
      setRevealedObjekts(newObjekts);
      setStep('revealed');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f27d26', '#ffffff', '#000000']
      });
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
    >
      <AnimatePresence mode="wait">
        {step === 'closed' && (
          <motion.div
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center space-y-8"
          >
            <div className="relative w-[236px] aspect-[2/3] mx-auto rounded-[12px] overflow-hidden shadow-2xl shadow-[#6E2CFF]/20 border border-[#232A30]">
              <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <h2 className="text-xl font-bold text-[#FBFBFB]">{pack.name}</h2>
                <p className="text-sm text-[#D0D7DD]/60">{pack.count} Objekts</p>
              </div>
            </div>
            <button
              onClick={handleOpen}
              className="px-12 py-4 bg-[#6E2CFF] text-white font-bold rounded-[12px] hover:opacity-90 transition-opacity"
            >
              OPEN PACK
            </button>
          </motion.div>
        )}

        {step === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-[172px] h-[268px] mx-auto bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center"
            >
              <div className="text-4xl">✨</div>
            </motion.div>
            <p className="mt-8 text-lg font-mono animate-pulse">REVEALING OBJEKTS...</p>
          </motion.div>
        )}

        {step === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl text-center space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {revealedObjekts.map((objekt, idx) => (
                <motion.div
                  key={`${objekt.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <ObjektCard objekt={objekt} />
                </motion.div>
              ))}
            </div>
            
            <button
              onClick={() => onClose(revealedObjekts)}
              className="px-12 py-4 border border-white/20 rounded-full hover:bg-white/10 transition-colors"
            >
              CONTINUE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
