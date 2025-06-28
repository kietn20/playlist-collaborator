// File: src/components/features/room/AddSongForm.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getYoutubeVideoId } from '@/lib/utils'; // Import the utility


interface AddSongFormProps {
    roomId: string;
    onAddSongFromForm: (youtubeVideoId: string, title?: string, artist?: string) => Promise<void>;
}

// Dummy onAddSong for now - replace in QueueSidebar when connecting to WebSocket
// const dummyOnAddSong = async (title: string, artist: string) => {
//     console.log(`Dummy add song: ${title} by ${artist}`);
//     await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network
//     // toast.success(`"${title}" added (locally)!`); // For local testing
// };

const AddSongForm: React.FC<AddSongFormProps> = ({ roomId, onAddSongFromForm }) => {
    const [youtubeInput, setYoutubeInput] = useState('');
    // const [title, setTitle] = useState('');
    // const [artist, setArtist] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const videoId = getYoutubeVideoId(youtubeInput.trim());
        if (!videoId) {
            toast.error('Please enter a valid YouTube Video URL or ID.');
            return;
        }

        // if (!title.trim() || !artist.trim()) {
        //     toast.error('Please enter both song title and artist.');
        //     return;
        // }
        
        
        if (!roomId) {
            toast.error('Not connected to a room.');
            return;
        }

        setIsAdding(true);
        try {
            // await onAddSongFromForm(title.trim(), artist.trim());

            await onAddSongFromForm(videoId);
            setYoutubeInput('');

            // setTitle('');
            // setArtist('');
        } catch (error) {
            console.error('Failed to add song:', error);
            toast.error((error as Error).message || 'Could not add song.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/30 rounded-md">
            <h3 className="text-md font-semibold text-primary">Suggest a Song</h3>


            <div>
                <Label htmlFor="youtubeUrl" className="text-sm text-primary/80">YouTube URL or Video ID</Label>
                <Input
                    id="youtubeUrl"
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="e.g., https://www.youtube.com/watch?v=..."
                    className="mt-1 bg-input border-border placeholder:text-muted-foreground/50"
                    disabled={isAdding}
                    required
                />
            </div>



            {/* <div>
                <Label htmlFor="songTitle" className="text-sm text-primary/80">Title</Label>
                <Input
                    id="songTitle"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Song Title"
                    className="mt-1 bg-input border-border placeholder:text-muted-foreground/50"
                    disabled={isAdding}
                    required
                />
            </div>
            <div>
                <Label htmlFor="songArtist" className="text-sm text-primary/80">Artist</Label>
                <Input
                    id="songArtist"
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Artist Name"
                    className="mt-1 bg-input border-border placeholder:text-muted-foreground/50"
                    disabled={isAdding}
                    required
                />
            </div> */}









            <Button
                type="submit"
                // disabled={isAdding || !title.trim() || !artist.trim()}
                disabled={isAdding || !youtubeInput.trim()}
                className="w-full bg-custom-secondary hover:bg-custom-secondary/90 text-secondary-foreground"
            >
                {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Song'}
            </Button>
        </form>
    );
};

export default AddSongForm;