import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// New utility function to extract YouTube Video ID
export function getYoutubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  // Check if it's already just an ID (e.g., 11 chars, no slashes/dots)
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
      return urlOrId;
  }
  try {
      const url = new URL(urlOrId);
      if (url.hostname === "youtu.be") {
          return url.pathname.slice(1); 
      }
      if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
          if (url.pathname === "/watch") {
              return url.searchParams.get("v");
          }
          if (url.pathname.startsWith("/embed/")) {
              return url.pathname.split("/embed/")[1];
          }
          if (url.pathname.startsWith("/v/") || url.pathname.startsWith("/e/")) {
             return url.pathname.split("/")[2];
          }
      }
  } catch (error) {
    console.warn("Could not parse YouTube URL, treating input as potential ID:", urlOrId, error);
  }
  return null; 
}