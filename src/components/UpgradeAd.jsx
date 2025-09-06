
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Star, X, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
    "Automated Payment Reminders",
    "Advanced Data Exports (PDF, CSV)",
    "Financial Insights & Trends",
    "Electricity Bill Management",
    "Full Data Backup",
    "Ad-free Experience",
];

// You can replace this URL with your own video ad link.
const VIDEO_AD_URL = "https://video-link-generator.replit.app/v/2qvx8pbscxug85183ehrl4";


const UpgradeAd = ({ isOpen, onOpenChange, onUpgrade }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
             if (videoRef.current) {
                videoRef.current.play().catch(error => {
                    console.warn("Video play was prevented by browser:", error);
                });
            }
        } else {
             if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);


    const togglePlay = () => {
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsPlaying(!videoRef.current.muted);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-md p-0 border-0 bg-transparent shadow-none" 
            >
                 <div 
                    className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 bg-card"
                 >
                    <div className="absolute inset-0 bg-black/50 z-10"></div>
                     <video 
                        ref={videoRef}
                        src={VIDEO_AD_URL}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover"
                        onPlay={() => setIsPlaying(!videoRef.current?.muted)}
                        onPause={() => setIsPlaying(false)}
                     >
                        Your browser does not support the video tag.
                     </video>

                    <div className="relative p-6 text-center text-white z-20">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Upgrade to Pro</DialogTitle>
                        </DialogHeader>

                         <div className="absolute top-3 left-3 z-30">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white bg-black/30 hover:bg-black/50 h-8 w-8"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                <span className="sr-only">Toggle Sound</span>
                            </Button>
                        </div>
                        
                        <DialogClose className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-30">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
                            <Star className="text-black h-10 w-10" />
                        </div>

                        <h2 className="text-2xl font-bold font-headline mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                            Unlock Your Property's Full Potential
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Upgrade to Pro to access powerful features that save you time and maximize profit.
                        </p>

                        <div className="space-y-2 text-left mb-6">
                            {PRO_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-sm">
                                    <Check className="h-4 w-4 text-green-400 shrink-0" />
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                             <Button size="lg" className="w-full text-md h-11 font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105" onClick={onUpgrade}>
                                Upgrade to Pro Now
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpgradeAd;
