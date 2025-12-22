import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getUniversityIcon, getPropertyIcon } from "../../utils/mapUtils";
import {
    HomeIcon,
    AcademicCapIcon,
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
}) {
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const mapRef = useRef(null);

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
            </MapContainer>

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
                </div>
            </div>

            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 z-[1000]">
                <span className="text-sm font-medium text-gray-900">
                    {validProperties.length} {t("propertiesOnMap") || "properties on map"}
                </span>
            </div>
        </div>
    );
}
