// File: src/components/features/room/HeaderControls.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, LogOut, Copy } from 'lucide-react'; // Icons
import toast from 'react-hot-toast';
import { Wifi, WifiOff } from 'lucide-react'; // Icons for connection status


interface HeaderControlsProps {
    roomId: string;
    roomName: string | null;
    onLeave: () => void;
    isWsConnected: boolean;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ roomId, roomName, onLeave, isWsConnected }) => {
    const handleShare = async () => {
        const roomUrl = `${window.location.origin}?roomId=${roomId}`; // Construct room URL
        try {
            await navigator.clipboard.writeText(roomId); // Copy Room ID
            // To copy URL: await navigator.clipboard.writeText(roomUrl);
            toast.success(`Room ID "${roomId}" copied to clipboard!`);
        } catch (err) {
            toast.error('Failed to copy Room ID.');
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <TooltipProvider delayDuration={200}>
            <header className="flex justify-between items-center p-2 rounded-md bg-card/50 backdrop-blur-sm mb-2">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="font-semibold text-primary">{roomName || `Room: ${roomId}`}</span>
                    </div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`p-1 rounded-full ${isWsConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {isWsConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border-border">
                            <p>WebSocket: {isWsConnected ? 'Connected' : 'Disconnected'}</p>
                        </TooltipContent>
                    </Tooltip>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLeave}
                        className="text-secondary hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Leave Room
                    </Button>
                </div>

                {/* Right Side */}
                <div>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleShare}
                                className="bg-custom-accent hover:bg-custom-accent/90 text-accent-foreground"
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Room
                                <Copy className="ml-2 h-3 w-3 opacity-70" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border-border">
                            <p>Copy Room ID to share</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </header>
        </TooltipProvider>
    );
};

export default HeaderControls;