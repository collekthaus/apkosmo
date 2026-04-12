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
  showBorder?: boolean;
  count?: number;
  serialTag?: string;
}

export const ObjektCard: React.FC<ObjektCardProps> = ({ 
  objekt, 
  className, 
  onClick,
  showDetails = true,
  showBorder = false,
  count,
  serialTag
}) => {
  const [isNew, setIsNew] = React.useState(false);

  React.useEffect(() => {
    if (!objekt.obtainedAt) {
      setIsNew(false);
      return;
    }

    const checkNew = () => {
      const obtainedDate = new Date(objekt.obtainedAt!);
      const now = new Date();
      const diffMinutes = (now.getTime() - obtainedDate.getTime()) / (1000 * 60);
      setIsNew(diffMinutes < 5);
    };

    checkNew();
    const interval = setInterval(checkNew, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [objekt.obtainedAt]);

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

      {/* New Tag */}
      {isNew && (
        <div 
          className="absolute z-30 flex items-center justify-center font-['Pretendard']"
          style={{
            top: '8px',
            left: '7px',
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
          New
        </div>
      )}

      {/* Count Tag - Bottom Left */}
      {count && count > 1 && (
        <div 
          className="absolute z-30 flex items-center justify-center font-['Pretendard']"
          style={{
            bottom: '7px',
            left: '7px',
            backgroundColor: '#090A0C',
            border: '1.4px solid #161B1F',
            borderRadius: '8px',
            padding: '4px 6px',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0px',
            lineHeight: 1
          }}
        >
          {count}
        </div>
      )}

      {/* Serial Tag - Bottom Left */}
      {serialTag && (
        <div 
          className="absolute z-30 flex items-center justify-center font-['Pretendard']"
          style={{
            bottom: '7px',
            left: '7px',
            backgroundColor: '#090A0C',
            border: '1.4px solid #161B1F',
            borderRadius: '8px',
            padding: '4px 6px',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0px',
            lineHeight: 1
          }}
        >
          {serialTag}
        </div>
      )}

      {/* Sidebar Border */}
      {showDetails && showBorder && (
        <>
          {/* Special Overlay */}
          {objekt.Class === 'Special' && (
            <img 
              src="https://resources.cosmo.fans/images/collection-band/2025/08/14/06/raw/86207a80d354439cada0ec6c45e076ee20250814061643330.png"
              alt="Special Overlay"
              className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )}
          <div 
            className="absolute flex flex-col items-center justify-between pointer-events-none z-20"
            style={{ 
              backgroundColor: objekt.Class === 'Special' ? 'transparent' : objekt.borderColor,
              width: `${values.borderWidth}%`,
              height: `${values.borderHeight}%`,
              right: `${values.borderX}%`,
              top: `${values.borderY}%`,
              transform: 'translateY(-50%)',
              borderRadius: `${values.borderRadius}px 0 0 ${values.borderRadius}px`,
              fontFamily: "'Inter', sans-serif",
              overflow: 'hidden'
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
        </>
      )}
    </motion.div>
  );
};
