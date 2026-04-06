import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Pin, Layers, Flashlight } from 'lucide-react';
import { Objekt } from '../types';
import { cn } from '../lib/utils';
import { LogoIcon } from './Icons';

interface DetailedObjektViewProps {
  objekt: Objekt;
  onClose: () => void;
  showBorder?: boolean;
}

export const DetailedObjektView: React.FC<DetailedObjektViewProps> = ({ objekt, onClose, showBorder = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(showBorder);
  const isDragging = useRef(false);

  // 3D Rotation State
  const x = useMotionValue(0);
  const rotateY = useSpring(x, { stiffness: 300, damping: 30 });
  
  // Map rotation to flip state
  useEffect(() => {
    const unsubscribe = rotateY.on('change', (latest) => {
      const normalized = ((latest % 360) + 360) % 360;
      if (normalized > 90 && normalized < 270) {
        setIsFlipped(true);
      } else {
        setIsFlipped(false);
      }
    });
    return () => unsubscribe();
  }, [rotateY]);

  const handleObjektClick = () => {
    if (isDragging.current) return;
    const current = rotateY.get();
    const target = isFlipped 
      ? Math.round(current / 180) * 180 + 180 
      : Math.round(current / 180) * 180 - 180;
    x.set(target);
  };

  const handleDragEnd = (_: any, info: any) => {
    setTimeout(() => { isDragging.current = false; }, 50);
    const current = rotateY.get();
    const velocity = info.velocity.x;
    
    // Snap to nearest 180
    let target = Math.round(current / 180) * 180;
    
    // If moving fast, go to next/prev
    if (Math.abs(velocity) > 500) {
      target = velocity > 0 ? Math.ceil(current / 180) * 180 : Math.floor(current / 180) * 180;
    }
    
    x.set(target);
  };

  const borderValues = {
    width: 10.95,
    height: 88.3,
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col select-none"
      style={{
        background: 'linear-gradient(180deg, #0B0C0E 0%, #555A60 100%)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between w-full"
        style={{ 
          paddingTop: '5px',
          paddingLeft: '12px',
          paddingRight: '12px',
          color: '#D0D7DD'
        }}
      >
        <button onClick={onClose} className="p-2 -ml-2">
          <ChevronLeft size={28} />
        </button>
        <button className="flex items-center gap-2">
          <Send size={19} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            Send
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col items-center justify-center"
        style={{ gap: '40px' }}
      >
        {/* Objekt Container */}
        <div 
          className="relative perspective-1000"
          style={{
            width: '305px',
            height: `${305 * 1.5448}px`,
          }}
        >
          <motion.div
            onPanStart={() => { isDragging.current = true; }}
            onPan={(_, info) => {
              x.set(x.get() + info.delta.x * 0.5);
            }}
            onPanEnd={handleDragEnd}
            onClick={handleObjektClick}
            style={{ 
              rotateY,
              transformStyle: 'preserve-3d',
              width: '100%',
              height: '100%',
            }}
            className="relative cursor-grab active:cursor-grabbing touch-none"
          >
            {/* Front Face */}
            <div 
              className="absolute inset-0 backface-hidden overflow-hidden pointer-events-none"
              style={{ 
                borderRadius: '16px',
                backgroundColor: '#171C20'
              }}
            >
              <img 
                src={objekt.imageUrl} 
                alt={objekt.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Front Border */}
              {isFlashActive && (
                <div 
                  className="absolute flex flex-col items-center justify-between pointer-events-none"
                  style={{ 
                    backgroundColor: objekt.borderColor,
                    width: `${borderValues.width}%`,
                    height: `${borderValues.height}%`,
                    right: `0%`,
                    top: `50%`,
                    transform: 'translateY(-50%)',
                    borderRadius: '10px 0 0 10px',
                  }}
                >
                  {/* Artist Name */}
                  <div 
                    className="absolute whitespace-nowrap font-bold"
                    style={{
                      top: '0.5%',
                      left: '8%',
                      transform: 'rotate(90deg) translateY(-50%)',
                      transformOrigin: 'left center',
                      textAlign: 'left',
                      fontSize: '17px',
                      color: objekt.textColor,
                      letterSpacing: '0px',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {objekt.artist}
                  </div>

                  {/* Logo */}
                  <div 
                    className="absolute flex items-center justify-center"
                    style={{
                      top: '91.5%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      width: '46px',
                      height: '46px',
                      color: objekt.textColor
                    }}
                  >
                    <LogoIcon className="w-full h-full" />
                  </div>

                  {/* Type & Serial Group */}
                  <div 
                    className="absolute flex items-center whitespace-nowrap"
                    style={{
                      top: '50%',
                      left: 'calc(50% - 1px)',
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      gap: '6px',
                      color: objekt.textColor,
                    }}
                  >
                    <span style={{ 
                      fontSize: '16px', 
                      letterSpacing: '0px',
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {objekt.Type}
                    </span>
                    <span style={{ 
                      fontSize: '16px', 
                      letterSpacing: '0px',
                      fontFamily: "'DotMatrix', sans-serif",
                      transform: 'translate(0px, 2px)'
                    }}>
                      #{String(objekt.serialNumber || 1).padStart(5, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Face */}
            <div 
              className="absolute inset-0 backface-hidden overflow-hidden pointer-events-none"
              style={{ 
                borderRadius: '16px',
                backgroundColor: '#171C20',
                transform: 'rotateY(180deg)'
              }}
            >
              <img 
                src={objekt.imageBackUrl || objekt.imageUrl} 
                alt={`${objekt.name} back`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Back Info */}
              <div 
                className="absolute flex items-center whitespace-nowrap"
                style={{
                  top: '50%',
                  left: '85%',
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                  gap: '6px',
                  color: objekt.textColor,
                }}
              >
                <span style={{ 
                  fontSize: '16px', 
                  letterSpacing: '0px',
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {objekt.Type}
                </span>
                <span style={{ 
                  fontSize: '16px', 
                  letterSpacing: '0px',
                  fontFamily: "'DotMatrix', sans-serif",
                  transform: 'translate(0px, 2px)'
                }}>
                  #{String(objekt.serialNumber || 1).padStart(5, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div 
          className="flex items-center"
          style={{ gap: '36px' }}
        >
          <ActionButton 
            icon={<Pin size={26} />} 
            size={46}
            borderSize={2.2}
          />
          <ActionButton 
            icon={<Layers size={26} />} 
            size={46}
            borderSize={2.2}
          />
          <ActionButton 
            icon={<Flashlight size={26} />} 
            size={46}
            borderSize={2.2}
            active={isFlashActive}
            onClick={() => setIsFlashActive(!isFlashActive)}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}} />
    </motion.div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  size: number;
  borderSize: number;
  active?: boolean;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, size, borderSize, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderSize}px`,
      }}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200",
        active 
          ? "bg-white border-white text-black" 
          : "bg-transparent border-white text-white"
      )}
    >
      {icon}
    </button>
  );
};
