import React from 'react';
import { motion } from 'framer-motion';
import { Objekt } from '../types';
import { cn } from '../lib/utils';

interface ObjektCardProps {
  objekt: Objekt;
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
}

export const ObjektCard: React.FC<ObjektCardProps> = ({ 
  objekt, 
  className, 
  onClick,
  showDetails = true 
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[12px] cursor-pointer group bg-[#171C20]",
        className
      )}
    >
      <img
        src={objekt.imageUrl}
        alt={`${objekt.artistName} ${objekt.typeId}`}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
      
      {/* Vertical Info on the right */}
      {showDetails && (
        <div className="absolute top-0 right-0 bottom-0 w-8 flex flex-col items-center py-2 bg-black/20 backdrop-blur-[2px]">
          <div className="flex-1 flex items-center justify-center">
            <span className="rotate-90 whitespace-nowrap text-[10px] font-bold tracking-tighter text-[#FBFBFB] origin-center">
              {objekt.artistName}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="rotate-90 whitespace-nowrap text-[10px] font-mono text-[#D0D7DD]/60 origin-center">
              {objekt.typeId}
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="rotate-90 whitespace-nowrap text-[8px] font-bold text-[#D0D7DD]/40 origin-center uppercase">
              COSMO
            </span>
          </div>
        </div>
      )}

      {/* Quantity Badge at bottom left */}
      {showDetails && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <div className="bg-[#171C20]/80 backdrop-blur-md rounded-full px-2 py-0.5 border border-[#232A30]">
            <span className="text-[10px] font-bold text-[#FBFBFB]">3</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
