import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../../context/LanguageContext";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { getUniversityIcon, createDraggablePropertyIcon } from "../../utils/mapUtils";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, onLocationChange }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            const newPos = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            onLocationChange(newPos[0], newPos[1]);
            reverseGeocode(newPos[0], newPos[1], onLocationChange);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position ? (
        <Marker position={position} icon={createDraggablePropertyIcon()} draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const pos = marker.getLatLng();
                    const newPos = [pos.lat, pos.lng];
                    setPosition(newPos);
                    onLocationChange(newPos[0], newPos[1]);
                    reverseGeocode(newPos[0], newPos[1], onLocationChange);
                },
            }}
        >
            <Popup>
                <div className="text-sm">
                    <strong>Selected Location</strong>
                    <br />
                    Lat: {position[0].toFixed(6)}
                    <br />
                    Lng: {position[1].toFixed(6)}
                </div>
            </Popup>
        </Marker>
    ) : null;
}

async function reverseGeocode(lat, lng, callback) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "en",
                },
            }
        );
        const data = await response.json();

        if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
            callback(lat, lng, city);
        }
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
    }
}

function SearchControl({ onSearchResult }) {
    const { t, language } = useLanguage();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
                {
                    headers: {
                        "Accept-Language": language,
                    },
                }
            );
            const data = await response.json();
            setResults(data);
            setShowResults(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (result) => {
        onSearchResult(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
        setShowResults(false);
        setQuery(result.display_name.split(",")[0]);
    };

    return (
        <div className="relative mb-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder={t("searchLocation") || "Search for an address..."}
                        className="w-full px-4 py-2.5 pl-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-2.5 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
                >
                    {loading ? "..." : t("search") || "Search"}
                </button>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(result)}
                            className="w-full px-4 py-3 text-left hover:bg-[var(--color-surface-hover)] border-b border-[var(--color-border)] last:border-b-0 flex items-start gap-2"
                        >
                            <MapPinIcon className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[var(--color-text)]">{result.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LocationPicker({
    latitude,
    longitude,
    onLocationChange,
    universities = [],
    universityLatitude,
    universityLongitude,
    height = "400px"
}) {
    const { t } = useLanguage();

    const defaultCenter = useMemo(() => {
        if (latitude && longitude) {
            return [latitude, longitude];
        }
        if (universityLatitude && universityLongitude) {
            return [universityLatitude, universityLongitude];
        }
        return [32.22769167661093, 35.22073268835524]; // Default: An Najah National University
    }, [latitude, longitude, universityLatitude, universityLongitude]);

    const [position, setPosition] = useState(
        latitude && longitude ? [latitude, longitude] : null
    );

    const handleSearchResult = (lat, lng, displayName) => {
        const newPos = [lat, lng];
        setPosition(newPos);
        const city = displayName.split(",")[0];
        onLocationChange(lat, lng, city);
    };

    const handleLocationChange = (lat, lng, city = "") => {
        onLocationChange(lat, lng, city);
    };

    return (
        <div className="location-picker">
            <SearchControl onSearchResult={handleSearchResult} />

            <div className="rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height, position: 'relative', zIndex: 0 }}>
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationChange={handleLocationChange}
                    />

                    {universities.map((uni) => {
                        if (!uni.latitude || !uni.longitude) return null;
                        return (
                            <Marker
                                key={`uni-${uni.id}`}
                                position={[parseFloat(uni.latitude), parseFloat(uni.longitude)]}
                                icon={getUniversityIcon()}
                            >
                                <Popup>{uni.name}</Popup>
                            </Marker>
                        );
                    })}

                    {universityLatitude && universityLongitude && universities.length === 0 && (
                        <Marker
                            position={[universityLatitude, universityLongitude]}
                            icon={getUniversityIcon()}
                        >
                            <Popup>{t("university") || "University"}</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {position && (
                <div className="mt-3 p-3 bg-[var(--color-surface-alt)] rounded-lg border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                        <MapPinIcon className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="font-medium">{t("selectedLocation") || "Selected Location"}:</span>
                        <span className="text-[var(--color-text-muted)]">
                            {position[0].toFixed(4)}, {position[1].toFixed(4)}
                        </span>
                    </div>
                </div>
            )}

            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {t("locationPickerHint") || "Click on the map or search for an address to set the property location"}
            </p>
        </div>
    );
}
