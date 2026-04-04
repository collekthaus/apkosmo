import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { ChevronLeft, Send, Pin, Layers, Flashlight, Settings2, Plus, Minus } from 'lucide-react';
import { Objekt } from '../types';
import { cn } from '../lib/utils';
import { LogoIcon } from './Icons';

interface DetailedObjektViewProps {
  objekt: Objekt;
  onClose: () => void;
}

interface DebugValues {
  headerTopPadding: number;
  headerHorizontalPadding: number;
  objektCornerRadius: number;
  objektSize: number;
  buttonsSize: number;
  buttonIconsSize: number;
  inactiveButtonBorderSize: number;
  gapBetweenButtons: number;
  sendButtonTextSize: number;
  sendButtonTextWeight: number;
  borderCornerRadius: number;
  artistNameX: number;
  artistNameY: number;
  artistNameSize: number;
  artistNameKerning: number;
  typeTextSize: number;
  typeTextKerning: number;
  serialTextSize: number;
  serialTextKerning: number;
  gapTypeSerial: number;
  groupY: number;
  groupX: number;
  logoY: number;
  logoX: number;
  logoSize: number;
  backGroupY: number;
  backGroupX: number;
}

export const DetailedObjektView: React.FC<DetailedObjektViewProps> = ({ objekt, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugValues, setDebugValues] = useState<DebugValues>({
    headerTopPadding: 20,
    headerHorizontalPadding: 20,
    objektCornerRadius: 16,
    objektSize: 320,
    buttonsSize: 52,
    buttonIconsSize: 24,
    inactiveButtonBorderSize: 2,
    gapBetweenButtons: 20,
    sendButtonTextSize: 15,
    sendButtonTextWeight: 600,
    borderCornerRadius: 8,
    artistNameX: 8,
    artistNameY: 0.5,
    artistNameSize: 14,
    artistNameKerning: 0,
    typeTextSize: 15,
    typeTextKerning: 0,
    serialTextSize: 15,
    serialTextKerning: 0,
    gapTypeSerial: 4,
    groupY: 50,
    groupX: 48,
    logoY: 90.5,
    logoX: 50,
    logoSize: 40,
    backGroupY: 50,
    backGroupX: 50,
  });

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
    const current = rotateY.get();
    const target = isFlipped ? Math.round(current / 180) * 180 : Math.round(current / 180) * 180 + 180;
    x.set(target);
  };

  const handleDragEnd = (_: any, info: any) => {
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

  const updateDebug = (key: keyof DebugValues, delta: number) => {
    setDebugValues(prev => ({ ...prev, [key]: Number((prev[key] + delta).toFixed(3)) }));
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
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background: 'linear-gradient(0deg, #0B0C0E 0%, #555A60 100%)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between w-full"
        style={{ 
          paddingTop: `${debugValues.headerTopPadding}px`,
          paddingLeft: `${debugValues.headerHorizontalPadding}px`,
          paddingRight: `${debugValues.headerHorizontalPadding}px`,
          color: '#D0D7DD'
        }}
      >
        <button onClick={onClose} className="p-2 -ml-2">
          <ChevronLeft size={28} />
        </button>
        <button className="flex items-center gap-2">
          <Send size={20} />
          <span style={{ fontSize: `${debugValues.sendButtonTextSize}px`, fontWeight: debugValues.sendButtonTextWeight }}>
            Send
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        {/* Objekt Container */}
        <div 
          className="relative perspective-1000"
          style={{
            width: `${debugValues.objektSize}px`,
            height: `${debugValues.objektSize * 1.5448}px`,
          }}
        >
          <motion.div
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
            className="relative cursor-grab active:cursor-grabbing"
          >
            {/* Front Face */}
            <div 
              className="absolute inset-0 backface-hidden overflow-hidden"
              style={{ 
                borderRadius: `${debugValues.objektCornerRadius}px`,
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
              {!isFlashActive && (
                <div 
                  className="absolute flex flex-col items-center justify-between pointer-events-none"
                  style={{ 
                    backgroundColor: objekt.borderColor,
                    width: `${borderValues.width}%`,
                    height: `${borderValues.height}%`,
                    right: `0%`,
                    top: `50%`,
                    transform: 'translateY(-50%)',
                    borderRadius: `${debugValues.borderCornerRadius}px 0 0 ${debugValues.borderCornerRadius}px`,
                  }}
                >
                  {/* Artist Name */}
                  <div 
                    className="absolute whitespace-nowrap font-bold"
                    style={{
                      top: `${debugValues.artistNameY}%`,
                      left: `${debugValues.artistNameX}%`,
                      transform: 'rotate(90deg) translateY(-50%)',
                      transformOrigin: 'left center',
                      textAlign: 'left',
                      fontSize: `${debugValues.artistNameSize}px`,
                      color: objekt.textColor,
                      letterSpacing: `${debugValues.artistNameKerning}px`,
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {objekt.artist}
                  </div>

                  {/* Logo */}
                  <div 
                    className="absolute flex items-center justify-center"
                    style={{
                      top: `${debugValues.logoY}%`,
                      left: `${debugValues.logoX}%`,
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      width: `${debugValues.logoSize}px`,
                      height: `${debugValues.logoSize}px`,
                      color: objekt.textColor
                    }}
                  >
                    <LogoIcon className="w-full h-full" />
                  </div>

                  {/* Type & Serial Group */}
                  <div 
                    className="absolute flex items-center whitespace-nowrap"
                    style={{
                      top: `${debugValues.groupY}%`,
                      left: `${debugValues.groupX}%`,
                      transform: 'translate(-50%, -50%) rotate(90deg)',
                      gap: `${debugValues.gapTypeSerial}px`,
                      color: objekt.textColor,
                    }}
                  >
                    <span style={{ 
                      fontSize: `${debugValues.typeTextSize}px`, 
                      letterSpacing: `${debugValues.typeTextKerning}px`,
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {objekt.Type}
                    </span>
                    <span style={{ 
                      fontSize: `${debugValues.serialTextSize}px`, 
                      letterSpacing: `${debugValues.serialTextKerning}px`,
                      fontFamily: "'DotMatrix', sans-serif"
                    }}>
                      #{String(objekt.serialNumber || 0).padStart(5, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Back Face */}
            <div 
              className="absolute inset-0 backface-hidden overflow-hidden"
              style={{ 
                borderRadius: `${debugValues.objektCornerRadius}px`,
                backgroundColor: '#171C20',
                transform: 'rotateY(180deg)'
              }}
            >
              <img 
                src={objekt.imageBackUrl || objekt.imageUrl} 
                alt={`${objekt.name} back`}
                className="w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              
              {/* Back Info */}
              <div 
                className="absolute flex items-center whitespace-nowrap"
                style={{
                  top: `${debugValues.backGroupY}%`,
                  left: `${debugValues.backGroupX}%`,
                  transform: 'translate(-50%, -50%) rotate(90deg)',
                  gap: `${debugValues.gapTypeSerial}px`,
                  color: '#FFFFFF',
                }}
              >
                <span style={{ 
                  fontSize: `${debugValues.typeTextSize}px`, 
                  letterSpacing: `${debugValues.typeTextKerning}px`,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {objekt.Type}
                </span>
                <span style={{ 
                  fontSize: `${debugValues.serialTextSize}px`, 
                  letterSpacing: `${debugValues.serialTextKerning}px`,
                  fontFamily: "'DotMatrix', sans-serif"
                }}>
                  #{String(objekt.serialNumber || 0).padStart(5, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div 
          className="flex items-center"
          style={{ gap: `${debugValues.gapBetweenButtons}px` }}
        >
          <ActionButton 
            icon={<Pin size={debugValues.buttonIconsSize} />} 
            size={debugValues.buttonsSize}
            borderSize={debugValues.inactiveButtonBorderSize}
          />
          <ActionButton 
            icon={<Layers size={debugValues.buttonIconsSize} />} 
            size={debugValues.buttonsSize}
            borderSize={debugValues.inactiveButtonBorderSize}
          />
          <ActionButton 
            icon={<Flashlight size={debugValues.buttonIconsSize} />} 
            size={debugValues.buttonsSize}
            borderSize={debugValues.inactiveButtonBorderSize}
            active={isFlashActive}
            onClick={() => setIsFlashActive(!isFlashActive)}
          />
        </div>
      </div>

      {/* Debug Menu */}
      <div className="fixed bottom-8 right-8 z-[110]">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl"
        >
          <Settings2 size={24} />
        </button>

        <AnimatePresence>
          {showDebug && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute bottom-16 right-0 w-72 max-h-[70vh] overflow-y-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 custom-scrollbar shadow-2xl"
            >
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Debug Menu</h3>
                
                {Object.entries(debugValues).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/70 font-medium truncate pr-2">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-[10px] font-mono text-white bg-white/10 px-1.5 py-0.5 rounded">{value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => updateDebug(key as keyof DebugValues, -1)}
                        className="flex-1 h-7 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <button 
                        onClick={() => updateDebug(key as keyof DebugValues, 1)}
                        className="flex-1 h-7 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
