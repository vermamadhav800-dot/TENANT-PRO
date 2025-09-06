
"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRO_FEATURES = [
    "Automated Payment Reminders",
    "Advanced Data Exports (PDF, CSV)",
    "Financial Insights & Trends",
    "Electricity Bill Management",
    "Full Data Backup",
    "Ad-free Experience",
];

const UpgradeAd = ({ isOpen, onOpenChange, onUpgrade, onContinue }) => {
    const [countdown, setCountdown] = useState(10);
    const audioRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCountdown(10); 
            
            const playAudio = async () => {
                if (audioRef.current) {
                    try {
                        audioRef.current.currentTime = 0;
                        await audioRef.current.play();
                    } catch (error) {
                        console.error("Audio autoplay was prevented by the browser.", error);
                    }
                }
            };
            
            // A small delay can sometimes help browsers register the audio element before playing
            const playTimeout = setTimeout(playAudio, 100);

            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearTimeout(playTimeout);
                clearInterval(timer);
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            };
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-0 border-0 bg-transparent shadow-none" showCloseButton={false}>
                 <div className="relative rounded-2xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20 bg-card">
                    <div className="absolute inset-0 dark-bg-futuristic opacity-50"></div>
                    
                    <audio ref={audioRef} src="/advertisement-audio.mp3" preload="auto"></audio>
                    
                    <div className={cn(
                        "absolute top-4 right-4 z-10 transition-all duration-300"
                    )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "text-white/70 hover:text-white",
                            countdown > 0 && "opacity-60 cursor-not-allowed bg-black/30" 
                          )}
                          onClick={onContinue}
                          disabled={countdown > 0}
                        >
                          {countdown > 0 ? (
                            <span className="text-sm font-mono w-5 h-5 flex items-center justify-center">{countdown}</span>
                          ) : (
                            <X className="h-5 w-5" />
                          )}
                          <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    <div className="relative p-8 text-center text-white">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Upgrade to Pro</DialogTitle>
                        </DialogHeader>
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30">
                            <Star className="text-black h-12 w-12" />
                        </div>

                        <h2 className="text-3xl font-bold font-headline mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400">
                            Unlock Your Property's Full Potential
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Go beyond the basics. Upgrade to the Pro plan to access powerful features that save you time and maximize your profit.
                        </p>

                        <div className="space-y-3 text-left mb-8">
                            {PRO_FEATURES.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <Check className="h-5 w-5 text-green-400 shrink-0" />
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button size="lg" className="w-full text-lg h-12 font-bold text-black bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-yellow-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105" onClick={onUpgrade}>
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
