import { motion, useMotionValue, useTransform } from 'motion/react';
import { useState, useRef, useEffect } from 'react';

interface JellyEventProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  duration: number;
  top: number;
  onClick: () => void;
  onDragStart?: () => void;
  onDragEnd?: (newTime: string, dayOffset: number) => void;
  onDragUpdate?: (dragInfo: { dayOffset: number; newTop: number; isDragging: boolean }) => void;
  isMonthView?: boolean;
  wobbleAll?: boolean;
  dayWidth?: number;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function JellyEvent({
  id,
  title,
  startTime,
  endTime,
  color,
  duration,
  top,
  onClick,
  onDragStart,
  onDragEnd,
  onDragUpdate,
  isMonthView = false,
  wobbleAll = false,
  dayWidth = 0,
}: JellyEventProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Track drag position and notify parent
  useEffect(() => {
    const unsubscribeX = x.on('change', (latestX) => {
      if (isDragging && onDragUpdate) {
        const latestY = y.get();
        const hoursMoved = Math.round(latestY / 60);
        // Account for gap between columns (8px gap-2)
        const columnWidth = dayWidth + 8;
        const dayOffset = dayWidth > 0 ? Math.round(latestX / columnWidth) : 0;
        const newTop = top + (hoursMoved * 60);
        
        onDragUpdate({ dayOffset, newTop, isDragging: true });
      }
    });
    const unsubscribeY = y.on('change', (latestY) => {
      if (isDragging && onDragUpdate) {
        const latestX = x.get();
        const hoursMoved = Math.round(latestY / 60);
        // Account for gap between columns (8px gap-2)
        const columnWidth = dayWidth + 8;
        const dayOffset = dayWidth > 0 ? Math.round(latestX / columnWidth) : 0;
        const newTop = top + (hoursMoved * 60);
        
        onDragUpdate({ dayOffset, newTop, isDragging: true });
      }
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, isDragging, onDragUpdate, dayWidth, top]);

  // Wobble animation variants
  const wobbleVariants = {
    idle: {
      scale: 1,
      borderRadius: isMonthView ? '50%' : '20px',
    },
    hover: {
      scale: isMonthView ? 1.2 : 1.02,
      borderRadius: isMonthView ? '50%' : ['20px', '25px', '18px', '23px', '20px'],
      transition: {
        borderRadius: {
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        scale: {
          duration: 0.3,
        },
      },
    },
    drag: {
      scale: isMonthView ? 1.3 : 1.05,
      borderRadius: isMonthView ? '50%' : ['18px', '28px', '15px', '26px', '18px'],
      transition: {
        borderRadius: {
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      },
    },
    wobble: {
      borderRadius: isMonthView ? '50%' : ['20px', '23px', '18px', '22px', '20px'],
      transition: {
        borderRadius: {
          duration: 0.5,
          repeat: 2,
          ease: 'easeInOut',
        },
      },
    },
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    if (onDragUpdate) {
      onDragUpdate({ dayOffset: 0, newTop: top, isDragging: false });
    }
    if (onDragEnd) {
      // Calculate new time based on drag position
      const hoursMoved = Math.round(info.offset.y / 60); // 60px per hour
      const [hours, minutes] = startTime.split(':').map(Number);
      const newHours = Math.max(0, Math.min(23, hours + hoursMoved));
      const newTime = `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // Calculate day offset based on horizontal movement
      // Account for gap between columns (8px gap-2)
      const columnWidth = dayWidth + 8;
      const dayOffset = dayWidth > 0 ? Math.round(info.offset.x / columnWidth) : 0;
      
      onDragEnd(newTime, dayOffset);
    }
  };

  if (isMonthView) {
    return (
      <motion.div
        variants={wobbleVariants}
        initial="idle"
        animate={isHovered || isDragging ? 'hover' : 'idle'}
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        className="absolute cursor-pointer"
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: hexToRgba(color, 0.3),
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 12px ${hexToRgba(color, 0.4)}, inset 0 1px 2px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(255,255,255,0.2)`,
          border: `1px solid ${hexToRgba(color, 0.3)}`,
        }}
      />
    );
  }

  return (
    <motion.div
        drag
        dragConstraints={{ 
          top: -top, 
          bottom: 1440 - top - duration, 
          left: -dayWidth * 3,  // Allow dragging 3 days left
          right: dayWidth * 3   // Allow dragging 3 days right
        }}
        dragElastic={0.1}
        dragMomentum={false}
        style={{ x, y }}
        onDragStart={() => {
          setIsDragging(true);
          onDragStart?.();
        }}
        onDragEnd={handleDragEnd}
        variants={wobbleVariants}
        initial="idle"
        animate={isDragging ? 'drag' : wobbleAll ? 'wobble' : isHovered ? 'hover' : 'idle'}
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={(e) => {
          if (!isDragging) {
            onClick();
          }
        }}
        className="absolute left-0 right-0 mx-2 cursor-pointer overflow-hidden"
        style={{
          top: `${top}px`,
          height: `${duration}px`,
          backgroundColor: hexToRgba(color, 0.18),
          backdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: `0 8px 32px ${hexToRgba(color, 0.3)}, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(255,255,255,0.2)`,
          border: `1px solid ${hexToRgba(color, 0.4)}`,
          opacity: isDragging ? 0.7 : 1,
          zIndex: isDragging ? 1000 : 'auto',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 p-2 h-full flex flex-col">
          <div className="truncate drop-shadow-sm" style={{ color: '#1f2937' }}>{title}</div>
          <div className="text-xs drop-shadow-sm" style={{ color: '#4b5563' }}>{startTime} - {endTime}</div>
        </div>
      </motion.div>
  );
}
