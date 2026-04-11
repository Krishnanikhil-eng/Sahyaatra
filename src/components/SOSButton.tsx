import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Loader2, CheckCircle2, Phone, Copy, Share2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SOSButton() {
    // SOS State
    const [sosState, setSosState] = useState<'idle' | 'confirming' | 'counting' | 'fetching' | 'success' | 'error'>('idle');
    const [countdown, setCountdown] = useState(5);
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [sosError, setSosError] = useState<string | null>(null);
    const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

    const startSOS = () => {
        setIsSOSModalOpen(true);
        setSosState('confirming');
    };

    const confirmSOS = () => {
        setSosState('counting');
        setCountdown(5);
    };

    const cancelSOS = () => {
        setIsSOSModalOpen(false);
        setSosState('idle');
        setSosError(null);
    };

    useEffect(() => {
        let timer: any;
        if (sosState === 'counting' && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (sosState === 'counting' && countdown === 0) {
            triggerSOSDiscovery();
        }
        return () => clearTimeout(timer);
    }, [sosState, countdown]);

    const triggerSOSDiscovery = async () => {
        setSosState('fetching');
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
            setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            setSosState('success');
            // Auto dial 112 after a short delay
            setTimeout(() => triggerEmergencyCall(), 2000);
        } catch (error: any) {
            console.error("SOS Geolocation Error:", error);
            let msg = "Could not fetch location.";
            if (error?.code === 1) msg = "Location permission denied.";
            else if (error?.code === 3) msg = "Location timeout.";
            setSosError(msg);
            setSosState('error');
        }
    };

    const triggerEmergencyCall = () => {
        // Safety check for Local Development (Test Mode)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            alert("🚨 [TEST MODE] SOS Final Action Triggered: Calling 112...");
            return;
        }
        // Real Emergency Dial (Production Only)
        window.location.href = 'tel:112';
    };

    const generateMapsLink = (lat: number, lon: number) => `https://maps.google.com/?q=${lat},${lon}`;

    const copyLocationToClipboard = () => {
        if (!userLocation) return;
        const link = generateMapsLink(userLocation.lat, userLocation.lon);
        const msg = `🚨 SOS! I need help. My location: ${link}`;
        navigator.clipboard.writeText(msg);
        alert("Location message copied to clipboard!");
    };

    const shareToWhatsApp = () => {
        if (!userLocation) return;
        const link = generateMapsLink(userLocation.lat, userLocation.lon);
        const text = encodeURIComponent(`SOS Help Needed Location: ${link}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSOS}
                title="Emergency SOS"
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm ml-2"
            >
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </motion.button>

            {/* SOS Modal System */}
            {createPortal(
            <AnimatePresence>
                {isSOSModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={cancelSOS}
                            className="absolute inset-0 bg-red-950/80 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
                        >
                            <div className="p-8 text-center">
                                {/* Step 1: Confirming */}
                                {sosState === 'confirming' && (
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                            <AlertCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">SOS Confirmation</h2>
                                        <p className="text-gray-600">Are you sure you want to trigger SOS? This will fetch your live location and call 112.</p>
                                        <div className="flex flex-col space-y-3">
                                            <button 
                                                onClick={confirmSOS}
                                                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
                                            >
                                                Confirm SOS
                                            </button>
                                            <button 
                                                onClick={cancelSOS}
                                                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Counting */}
                                {sosState === 'counting' && (
                                    <div className="py-8 space-y-8">
                                        <div className="text-8xl font-black text-red-600 animate-pulse">
                                            {countdown}
                                        </div>
                                        <h2 className="text-2xl font-bold">Triggering SOS...</h2>
                                        <button 
                                            onClick={cancelSOS}
                                            className="px-10 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-colors"
                                        >
                                            CANCEL NOW
                                        </button>
                                    </div>
                                )}

                                {/* Step 3: Fetching */}
                                {sosState === 'fetching' && (
                                    <div className="py-12 space-y-6">
                                        <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
                                        <h2 className="text-2xl font-bold">Fetching Live Location...</h2>
                                        <p className="text-gray-500 italic">Finding your precise coordinates for emergency services.</p>
                                    </div>
                                )}

                                {/* Step 4: Success */}
                                {sosState === 'success' && userLocation && (
                                    <div className="space-y-6">
                                        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
                                        <h2 className="text-2xl font-bold text-gray-900">SOS Triggered!</h2>
                                        
                                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-left">
                                            <p className="text-red-800 font-bold mb-2">Emergency Status: Active</p>
                                            <p className="text-red-700 text-sm">Message: I need help!</p>
                                            <div className="mt-3 flex items-center text-sm font-medium text-blue-600">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <a href={generateMapsLink(userLocation.lat, userLocation.lon)} target="_blank" rel="noreferrer" className="underline break-all">
                                                    Live Location Map Link
                                                </a>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <button 
                                                onClick={triggerEmergencyCall}
                                                className="flex items-center justify-center bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700"
                                            >
                                                <Phone className="w-5 h-5 mr-2" /> Dial 112 Now
                                            </button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={copyLocationToClipboard}
                                                    className="flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" /> Copy link
                                                </button>
                                                <button 
                                                    onClick={shareToWhatsApp}
                                                    className="flex items-center justify-center bg-green-50 text-green-700 py-3 rounded-xl font-bold hover:bg-green-100 border border-green-200"
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" /> WhatsApp
                                                </button>
                                            </div>
                                            <button 
                                                onClick={cancelSOS}
                                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Error */}
                                {sosState === 'error' && (
                                    <div className="space-y-6">
                                        <AlertCircle className="w-20 h-20 text-amber-500 mx-auto" />
                                        <h2 className="text-2xl font-bold">Location Fetch Failed</h2>
                                        <p className="text-gray-600">{sosError || "An error occurred while fetching your location."}</p>
                                        <div className="bg-amber-50 p-4 rounded-xl text-amber-800 text-sm">
                                            <strong>Safety Tip:</strong> Do not wait. Call 112 manually immediatey.
                                        </div>
                                        <button 
                                            onClick={triggerEmergencyCall}
                                            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg"
                                        >
                                            Call 112 Manually
                                        </button>
                                        <button onClick={cancelSOS} className="block w-full text-gray-500 font-medium">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>,
            document.body
            )}
        </>
    );
}
