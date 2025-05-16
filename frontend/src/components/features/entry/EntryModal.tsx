// File: src/components/features/entry/EntryModal.tsx
// Purpose: Modal for user to enter username and join/create a room.
// Location: src/components/features/entry/

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react'; // For loading spinner
import toast from 'react-hot-toast';

interface EntryModalProps {
    // We will make this modal control its own open state
    // so App.tsx doesn't need to manage it directly for rendering.
    // It will be always rendered but controlled internally.
    isOpen: boolean; // Controlled from App.tsx
    isLoading: boolean; // Passed from App.tsx to show loading state
    onJoinOrCreate: (username: string, roomId?: string) => Promise<void>; // Made async
}

const EntryModal: React.FC<EntryModalProps> = ({ isOpen, isLoading, onJoinOrCreate }) => {
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [roomIdInput, setRoomIdInput] = useState<string>('');

    const handleSubmit = async () => {
        if (!usernameInput.trim()) {
            toast.error('Please enter a username.');
            return;
        }
        await onJoinOrCreate(usernameInput.trim(), roomIdInput.trim() || undefined); // Pass undefined if roomId is empty
    };

    // Since shadcn's Dialog doesn't prevent interaction with underlying elements
    // by default when controlled externally via `open` prop without a `DialogTrigger`,
    // we should also add an overlay if isOpen is true to block background interactions.
    // Alternatively, if EntryModal were only rendered when needed, Dialog's own modality
    // would suffice. Let's keep it controlled by App.tsx for now via isOpen.

    if (!isOpen) {
        return null; // Don't render anything if not open
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { /* Managed by App.tsx, do nothing here */ }}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-primary">Join or Create a Room</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Enter your username (required). To create a new room, leave the Room ID blank.
                        To join an existing room, enter its ID.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right text-primary">
                            Username
                        </Label>
                        <Input
                            id="username"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            className="col-span-3 bg-input border-border placeholder:text-muted-foreground/50"
                            placeholder="Your display name"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="roomId" className="text-right text-primary">
                            Room ID
                        </Label>
                        <Input
                            id="roomId"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            className="col-span-3 bg-input border-border placeholder:text-muted-foreground/50"
                            placeholder="(Optional) Enter ID to join"
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading || !usernameInput.trim()}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            roomIdInput.trim() ? 'Join Room' : 'Create Room'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
            {/* Optional: Full-screen overlay to enhance modal effect if Dialog is "always mounted" strategy */}
            {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />}
        </Dialog>
    );
};

export default EntryModal;