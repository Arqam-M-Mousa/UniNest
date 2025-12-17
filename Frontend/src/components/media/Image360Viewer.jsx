import { useEffect, useRef, useState } from "react";

/**
 * 360-degree panoramic image viewer component using Pannellum
 * @param {string} imageUrl - URL of the 360-degree panoramic image
 * @param {number} width - Width of the viewer (default: 100%)
 * @param {number} height - Height of the viewer (default: 500px)
 * @param {boolean} autoRotate - Enable auto-rotation (default: false)
 */
const Image360Viewer = ({
    imageUrl,
    width = "100%",
    height = 500,
    autoRotate = false
}) => {
    const viewerRef = useRef(null);
    const pannellumInstance = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load Pannellum library dynamically
    useEffect(() => {
        // Check if already loaded
        if (window.pannellum) {
            setIsLoaded(true);
            return;
        }

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.async = true;
        script.onload = () => setIsLoaded(true);
        document.head.appendChild(script);

        return () => {
            // Cleanup
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        if (!viewerRef.current || !imageUrl || !isLoaded || !window.pannellum) return;

        // Initialize Pannellum viewer
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, {
            type: "equirectangular",
            panorama: imageUrl,
            autoLoad: true,
            autoRotate: autoRotate ? -2 : 0,
            showControls: true,
            showFullscreenCtrl: true,
            showZoomCtrl: true,
            mouseZoom: true,
            draggable: true,
            keyboardZoom: true,
            compass: false,
            hotSpotDebug: false,
        });

        // Cleanup on unmount
        return () => {
            if (pannellumInstance.current) {
                pannellumInstance.current.destroy();
            }
        };
    }, [imageUrl, autoRotate, isLoaded]);

    return (
        <div
            ref={viewerRef}
            style={{
                width: width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: '12px',
                overflow: 'hidden'
            }}
        />
    );
};

export default Image360Viewer;
