"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, X } from 'lucide-react';

export default function UpgradeAd({ isOpen, onOpenChange, onUpgrade }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (isOpen && videoElement) {
            // Set a timeout to ensure the element is fully in the DOM and ready
            setTimeout(() => {
                videoElement.play().catch(error => {
                    console.error("Video autoplay failed. User interaction might be required.", error);
                    // As a fallback, we can try to load it again.
                    videoElement.load();
                });
            }, 100); // A small delay can sometimes help
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-0 max-w-lg overflow-hidden" showCloseButton={false}>
                <div className="relative aspect-video w-full">
                    {/* Video Player */}
                    <video
                        ref={videoRef}
                        src="https://video-link-generator.replit.app/v/2qvx8pbscxug85183ehrl4"
                        className="absolute top-0 left-0 w-full h-full object-cover z-0"
                        autoPlay
                        muted
                        loop
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    
                    {/* Close Button */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full z-30"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-5 w-5"/>
                    </Button>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-6 text-white z-20 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                        <h2 className="text-2xl font-bold">Unlock Pro Features</h2>
                        <p className="text-base text-white/90">
                           Upgrade now to unlock powerful features like advanced reports, automated reminders, and more!
                        </p>
                        <Button onClick={onUpgrade} className="mt-4 w-full text-lg py-6 btn-gradient-glow">
                            <Star className="mr-2 h-5 w-5" /> Upgrade to Pro
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
