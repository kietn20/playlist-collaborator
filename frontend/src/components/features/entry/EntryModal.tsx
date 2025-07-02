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
import { Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast';

interface EntryModalProps {
    isOpen: boolean; 
    isLoading: boolean; 
    onJoinOrCreate: (username: string, roomId?: string) => Promise<void>;
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

    if (!isOpen) {
        return null; 
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { /* Managed by App.tsx, do nothing here */ }}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground border-red-200">
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
            {isOpen && <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />}
        </Dialog>
    );
};

export default EntryModal;