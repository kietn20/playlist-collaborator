// File: src/components/features/room/PlayPauseButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  disabled?: boolean;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ isPlaying, onTogglePlay, disabled }) => {
  return (
    <Button onClick={onTogglePlay} disabled={disabled} size="lg" variant="ghost">
      {isPlaying ? <Pause size={32} /> : <Play size={32} />}
    </Button>
  );
};
export default PlayPauseButton;