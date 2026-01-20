import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../services/api";
import { getUniversityIcon, getPropertyIcon } from "../../utils/mapUtils";
import {
    HomeIcon,
    AcademicCapIcon,
    BuildingStorefrontIcon,
    ShoppingCartIcon,
    HeartIcon,
    BuildingLibraryIcon,
    TruckIcon,
    CakeIcon,
} from "@heroicons/react/24/outline";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});



function FitBounds({ properties, universities, selectedUniversity }) {
    const map = useMap();

    useEffect(() => {
        const points = [];

        properties.forEach(prop => {
            if (prop.latitude && prop.longitude) {
                points.push([prop.latitude, prop.longitude]);
            }
        });

        if (selectedUniversity) {
            const uni = universities.find(u => u.id === selectedUniversity);
            if (uni?.latitude && uni?.longitude) {
                points.push([parseFloat(uni.latitude), parseFloat(uni.longitude)]);
            }
        } else {
            universities.forEach(uni => {
                if (uni.latitude && uni.longitude) {
                    points.push([parseFloat(uni.latitude), parseFloat(uni.longitude)]);
                }
            });
        }

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [properties, universities, selectedUniversity, map]);

    return null;
}

function PropertyPopup({ property, onViewDetails }) {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/apartments/${property.id}`);
    };

    return (
        <div className="property-popup" style={{ minWidth: "200px" }}>
            {property.images?.[0] && (
                <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded-t-lg"
                />
            )}
            <div className="p-2">
                <h3 className="font-semibold text-sm text-gray-900 truncate">{property.title}</h3>
                <p className="text-lg font-bold text-emerald-600">
                    {property.pricePerMonth} {property.currency}/{t("month") || "mo"}
                </p>
                <div className="flex gap-2 text-xs text-gray-600 mt-1">
                    <span>{property.bedrooms} {t("beds") || "beds"}</span>
                    <span>•</span>
                    <span>{property.bathrooms} {t("baths") || "baths"}</span>
                    <span>•</span>
                    <span>{property.squareFeet} m²</span>
                </div>
                <button
                    onClick={handleClick}
                    className="mt-2 w-full py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    {t("viewDetails") || "View Details"}
                </button>
            </div>
        </div>
    );
}

// SVG paths for POI icons (from Heroicons)
const POI_SVG_PATHS = {
    supermarket: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>',
    restaurant: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    pharmacy: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>',
    bank: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>',
    bus_station: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 5h8m-4-9v2m0 12v2m-7-7h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2z"/>',
    cafe: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>',
};

// POI categories with icons and colors
const POI_CATEGORIES = {
    supermarket: { icon: ShoppingCartIcon, color: '#f59e0b', label: 'Supermarkets', svg: POI_SVG_PATHS.supermarket },
    restaurant: { icon: CakeIcon, color: '#ef4444', label: 'Restaurants', svg: POI_SVG_PATHS.restaurant },
    pharmacy: { icon: HeartIcon, color: '#10b981', label: 'Pharmacies', svg: POI_SVG_PATHS.pharmacy },
    bank: { icon: BuildingLibraryIcon, color: '#3b82f6', label: 'Banks', svg: POI_SVG_PATHS.bank },
    bus_station: { icon: TruckIcon, color: '#8b5cf6', label: 'Bus Stations', svg: POI_SVG_PATHS.bus_station },
    cafe: { icon: BuildingStorefrontIcon, color: '#ec4899', label: 'Cafes', svg: POI_SVG_PATHS.cafe },
};

// Create POI icon using SVG
const createPOIIcon = (category) => {
    const config = POI_CATEGORIES[category] || { color: '#6b7280', svg: POI_SVG_PATHS.supermarket };
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width:14px;height:14px;">${config.svg}</svg>`;
    return L.divIcon({
        className: 'poi-marker',
        html: `<div style="background: ${config.color}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${svgIcon}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13],
    });
};

export default function MapView({
    properties = [],
    universities = [],
    selectedUniversity = null,
    searchRadius = null, // in km
    centerLat = null,
    centerLng = null,
    height = "500px",
    showRadiusCircle = false,
    onPropertySelect = null,
    showPropertyCount = true,
    showNearbyPlaces = true,
}) {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(['supermarket', 'pharmacy', 'bus_station']);
    const [showPOIPanel, setShowPOIPanel] = useState(false);

    const defaultCenter = useMemo(() => {
        if (centerLat && centerLng) {
            return [centerLat, centerLng];
        }
        if (selectedUniversity) {
            const uni = universities.find(u => u.id === selectedUniversity);
            if (uni?.latitude && uni?.longitude) {
                return [parseFloat(uni.latitude), parseFloat(uni.longitude)];
            }
        }
        return [32.22769167661093, 35.22073268835524];
    }, [centerLat, centerLng, selectedUniversity, universities]);

    const validProperties = useMemo(() => {
        return properties.filter(p => p.latitude && p.longitude);
    }, [properties]);

    // Fetch nearby places using backend proxy
    const fetchNearbyPlaces = async (lat, lng, radius = 1000) => {
        if (!showNearbyPlaces) return;
        
        setLoadingPlaces(true);
        try {
            if (selectedCategories.length === 0) {
                setNearbyPlaces([]);
                return;
            }

            const result = await apiRequest('/api/geocode/nearby-places', {
                method: 'POST',
                body: JSON.stringify({
                    lat,
                    lng,
                    radius,
                    categories: selectedCategories,
                }),
            });
            
            if (result.data) {
                // Add labels to places that don't have names
                const places = result.data.map(place => ({
                    ...place,
                    name: place.name === place.category ? (POI_CATEGORIES[place.category]?.label || place.name) : place.name,
                }));
                setNearbyPlaces(places);
            } else {
                setNearbyPlaces([]);
            }
        } catch (error) {
            console.error('Failed to fetch nearby places:', error);
        } finally {
            setLoadingPlaces(false);
        }
    };

    // Fetch places when center changes or categories change
    useEffect(() => {
        if (showNearbyPlaces && defaultCenter[0] && defaultCenter[1]) {
            fetchNearbyPlaces(defaultCenter[0], defaultCenter[1], 1500);
        }
    }, [defaultCenter[0], defaultCenter[1], selectedCategories, showNearbyPlaces]);

    const toggleCategory = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className="map-view relative rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height, zIndex: 0 }}>
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds
                    properties={validProperties}
                    universities={universities}
                    selectedUniversity={selectedUniversity}
                />

                {showRadiusCircle && searchRadius && centerLat && centerLng && (
                    <Circle
                        center={[centerLat, centerLng]}
                        radius={searchRadius * 1000} // Convert km to meters
                        pathOptions={{
                            color: '#6366f1',
                            fillColor: '#6366f1',
                            fillOpacity: 0.1,
                            weight: 2,
                            dashArray: '5, 5'
                        }}
                    />
                )}

                {universities.map((uni) => {
                    if (!uni.latitude || !uni.longitude) return null;

                    if (selectedUniversity && uni.id !== selectedUniversity) return null;

                    return (
                        <Marker
                            key={`uni-${uni.id}`}
                            position={[parseFloat(uni.latitude), parseFloat(uni.longitude)]}
                            icon={getUniversityIcon()}
                        >
                            <Popup>
                                <div className="p-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AcademicCapIcon className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-semibold text-gray-900">{uni.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">{uni.city}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {validProperties.map((property) => (
                    <Marker
                        key={`prop-${property.id}`}
                        position={[property.latitude, property.longitude]}
                        icon={getPropertyIcon()}
                    >
                        <Popup>
                            <PropertyPopup property={property} />
                        </Popup>
                    </Marker>
                ))}

                {/* Nearby Places Markers */}
                {showNearbyPlaces && nearbyPlaces.map((place) => (
                    <Marker
                        key={`poi-${place.id}`}
                        position={[place.lat, place.lng]}
                        icon={createPOIIcon(place.category)}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <div 
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: POI_CATEGORIES[place.category]?.color || '#6b7280' }}
                                    >
                                        {(() => {
                                            const IconComponent = POI_CATEGORIES[place.category]?.icon || ShoppingCartIcon;
                                            return <IconComponent className="w-3.5 h-3.5" />;
                                        })()}
                                    </div>
                                    <span className="font-semibold text-sm text-gray-900">{place.name}</span>
                                </div>
                                <p className="text-xs text-gray-500 capitalize">{place.category.replace('_', ' ')}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                            <HomeIcon className="w-3 h-3" />
                        </div>
                        <span>{t("properties") || "Properties"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                            <AcademicCapIcon className="w-3 h-3" />
                        </div>
                        <span>{t("universities") || "Universities"}</span>
                    </div>
                    {showNearbyPlaces && nearbyPlaces.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                            <span className="text-gray-500">{nearbyPlaces.length} {t("nearbyPlaces") || "nearby places"}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* POI Filter Panel */}
            {showNearbyPlaces && (
                <div className="absolute top-20 left-3 z-[1000]">
                    <button
                        onClick={() => setShowPOIPanel(!showPOIPanel)}
                        className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <BuildingStorefrontIcon className="w-4 h-4" />
                        {t("nearbyPlaces") || "Nearby Places"}
                        {loadingPlaces && (
                            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                    </button>
                    
                    {showPOIPanel && (
                        <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 min-w-[200px]">
                            <p className="text-xs font-medium text-gray-500 mb-2">{t("showOnMap") || "Show on map"}:</p>
                            <div className="space-y-2">
                                {Object.entries(POI_CATEGORIES).map(([key, config]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(key)}
                                            onChange={() => toggleCategory(key)}
                                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div 
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="text-sm text-gray-700">{t(key) || config.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showPropertyCount && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-[1000]">
                    <span className="text-sm font-medium text-gray-900">
                        {validProperties.length} {t("propertiesOnMap") || "properties on map"}
                    </span>
                </div>
            )}
        </div>
    );
}
