import React from 'react';
import { motion } from 'motion/react';
import { Objekt } from '../types';
import { cn } from '../lib/utils';
import { LogoIcon } from './Icons';

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
  const values = {
    borderWidth: 10.95,
    borderHeight: 88.3,
    borderX: 0,
    borderY: 50,
    borderRadius: 4,
    artistSize: 6,
    artistX: 8,
    artistY: 0.5,
    typeSize: 6.4,
    typeX: 48,
    typeY: 50,
    logoSize: 17,
    logoX: 50,
    logoY: 90.5,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-[8px] cursor-pointer group bg-[#171C20]",
        "aspect-[1/1.5448]",
        className
      )}
    >
      <img
        src={objekt.imageUrl}
        alt={objekt.name}
        className="h-full w-full object-cover"
        referrerPolicy="no-referrer"
      />
      
      {/* Sidebar Border */}
      {showDetails && (
        <div 
          className="absolute flex flex-col items-center justify-between pointer-events-none"
          style={{ 
            backgroundColor: objekt.borderColor,
            width: `${values.borderWidth}%`,
            height: `${values.borderHeight}%`,
            right: `${values.borderX}%`,
            top: `${values.borderY}%`,
            transform: 'translateY(-50%)',
            borderRadius: `${values.borderRadius}px 0 0 ${values.borderRadius}px`,
            fontFamily: "'Inter', sans-serif"
          }}
        >
          {/* Artist Name */}
          <div 
            className="absolute whitespace-nowrap"
            style={{
              top: `${values.artistY}%`,
              left: `${values.artistX}%`,
              transform: 'rotate(90deg) translateY(-50%)',
              transformOrigin: 'left center',
              textAlign: 'left',
              fontSize: `${values.artistSize}px`,
              color: objekt.textColor,
              fontWeight: 700
            }}
          >
            {objekt.artist}
          </div>

          {/* Logo */}
          <div 
            className="absolute flex items-center justify-center"
            style={{
              top: `${values.logoY}%`,
              left: `${values.logoX}%`,
              transform: 'translate(-50%, -50%) rotate(90deg)',
              width: `${values.logoSize}px`,
              height: `${values.logoSize}px`,
              color: objekt.textColor
            }}
          >
            <LogoIcon className="w-full h-full" />
          </div>

          {/* Type Number */}
          <div 
            className="absolute flex items-center justify-center whitespace-nowrap"
            style={{
              top: `${values.typeY}%`,
              left: `${values.typeX}%`,
              transform: 'translate(-50%, -50%) rotate(90deg)',
              fontSize: `${values.typeSize}px`,
              color: objekt.textColor,
              fontWeight: 700
            }}
          >
            {objekt.Type}
          </div>
        </div>
      )}
    </motion.div>
  );
};
