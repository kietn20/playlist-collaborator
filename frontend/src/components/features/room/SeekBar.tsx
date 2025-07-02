import React from 'react';
import { Slider } from '@/components/ui/slider'; // From shadcn/ui

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
  disabled?: boolean;
}

const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const SeekBar: React.FC<SeekBarProps> = ({ currentTime, duration, onSeek, disabled }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
      <Slider
        value={[currentTime]}
        max={duration || 100} 
        step={1}
        onValueChange={(value) => onSeek(value[0])}
        disabled={disabled || !duration}
        className="w-full"
      />
      <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
    </div>
  );
};
export default SeekBar;