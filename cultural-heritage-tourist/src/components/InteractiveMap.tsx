import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { provinces, philippinesCenter, philippinesZoom, type Province } from "@/data/provinces";
import { mapPins, type MapPin } from "@/data/map-pins";
import { provinceGeoJSON } from "@/data/province-boundaries";
import { MapPreviewPanel } from "./MapPreviewPanel";
import { AdvancedFilters, type FilterState } from "./AdvancedFilters";

function createPinIcon(loading: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:32px;height:42px;">
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:${loading ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)"};
          border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:grid;place-items:center;
          position:relative;z-index:2;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
          </svg>
        </div>
        <div style="
          width:0;height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:10px solid oklch(0.55 0.16 250);
          margin-top:-4px;position:relative;z-index:1;
        "></div>
      </div>
    `,
  });
}

function createActivePinIcon() {
  return L.divIcon({
    className: "",
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -54],
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:40px;height:52px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));">
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:oklch(0.55 0.16 250);
          border:4px solid #fff;
          box-shadow:0 0 0 2px oklch(0.55 0.16 250), 0 4px 16px rgba(0,0,0,0.3);
          display:grid;place-items:center;
          position:relative;z-index:2;
          animation:pinPulse 1.5s ease-in-out infinite;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5" fill="#fff" stroke="none"/>
          </svg>
        </div>
        <div style="
          width:0;height:0;
          border-left:10px solid transparent;
          border-right:10px solid transparent;
          border-top:12px solid oklch(0.55 0.16 250);
          margin-top:-6px;position:relative;z-index:1;
        "></div>
        <style>@keyframes pinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}</style>
      </div>
    `,
  });
}

const defaultIcon = createPinIcon(false);
const activeIcon = createActivePinIcon();

interface MapEventsProps {
  onMapClick: () => void;
}

function MapEvents({ onMapClick }: MapEventsProps) {
  useMapEvents({ click: () => onMapClick() });
  return null;
}

interface ZoomControllerProps {
  province: Province | null;
}

function ZoomController({ province }: ZoomControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (province) {
      map.flyToBounds(province.bounds, { duration: 1.2, padding: [40, 40] });
    } else {
      map.flyTo(philippinesCenter, philippinesZoom, { duration: 1.2 });
    }
  }, [province, map]);
  return null;
}

interface ProvinceLayerProps {
  onProvinceClick: (province: Province) => void;
  activeProvince: string | null;
}

function ProvinceLayer({ onProvinceClick, activeProvince }: ProvinceLayerProps) {
  const map = useMap();

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    layer.on({
      click: () => {
        const prov = provinces.find((p) => p.id === feature.properties?.id);
        if (prov) onProvinceClick(prov);
      },
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({ fillOpacity: 0.25, weight: 2.5 });
        map.getContainer().style.cursor = "pointer";
      },
      mouseout: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          fillOpacity: feature.properties?.id === activeProvince ? 0.2 : 0.08,
          weight: feature.properties?.id === activeProvince ? 2.5 : 1.5,
        });
        map.getContainer().style.cursor = "";
      },
    });
  };

  const style = (feature?: GeoJSON.Feature) => {
    const isActive = feature?.properties?.id === activeProvince;
    return {
      fillColor: isActive ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)",
      fillOpacity: isActive ? 0.2 : 0.08,
      color: isActive ? "oklch(0.55 0.16 250)" : "oklch(0.55 0.16 250)",
      weight: isActive ? 2.5 : 1.5,
      opacity: isActive ? 0.8 : 0.5,
    } as L.PathOptions;
  };

  return (
    <GeoJSON
      key={activeProvince}
      data={provinceGeoJSON as unknown as GeoJSON.GeoJsonObject}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

export function InteractiveMap() {
  const [activePin, setActivePin] = useState<MapPin | null>(null);
  const [activeProvince, setActiveProvince] = useState<Province | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    municipality: "all",
    accessibility: [],
    historicalSignificance: [],
    nearbyAttractions: "",
  });
  const mapRef = useRef<L.Map | null>(null);

  const municipalities = useMemo(
    () => [...new Set(mapPins.map((p) => p.municipality))].sort(),
    [],
  );

  const attractionNames = useMemo(
    () => [...new Set(mapPins.flatMap((p) => p.nearbyAttractions))].sort(),
    [],
  );

  const handlePinClick = (pin: MapPin) => {
    setActivePin(pin);
    setPanelOpen(true);
  };

  const handleProvinceClick = (province: Province) => {
    if (activeProvince?.id === province.id) {
      setActiveProvince(null);
    } else {
      setActiveProvince(province);
    }
    setActivePin(null);
    setPanelOpen(false);
  };

  const handleMapClick = () => {
    setActivePin(null);
    setPanelOpen(false);
  };

  const handleClosePanel = () => {
    setPanelOpen(false);
    setActivePin(null);
  };

  const handleResetView = () => {
    setActiveProvince(null);
    setActivePin(null);
    setPanelOpen(false);
  };

  const visiblePins = useMemo(() => {
    let pins = activeProvince
      ? mapPins.filter((p) => p.municipality === activeProvince.name)
      : mapPins;

    if (filters.municipality !== "all") {
      pins = pins.filter((p) => p.municipality === filters.municipality);
    }

    if (filters.accessibility.length > 0) {
      pins = pins.filter((p) =>
        filters.accessibility.every((a) => p.accessibility.includes(a)),
      );
    }

    if (filters.historicalSignificance.length > 0) {
      pins = pins.filter((p) =>
        filters.historicalSignificance.includes(p.historicalSignificance),
      );
    }

    if (filters.nearbyAttractions) {
      const query = filters.nearbyAttractions.toLowerCase();
      pins = pins.filter((p) =>
        p.nearbyAttractions.some((a) => a.toLowerCase().includes(query)),
      );
    }

    return pins;
  }, [activeProvince, filters]);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-ink/10 shadow-[0_20px_60px_-20px_rgba(30,40,80,0.25)] md:h-[600px]">
      <style>{`
        .leaflet-container {
          background: #f5f0e8 !important;
          font-family: var(--font-sans) !important;
        }
        .leaflet-control-zoom {
          border: 1px solid oklch(0.87 0.025 80) !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
        }
        .leaflet-control-zoom a {
          background: oklch(0.984 0.012 85 / 0.95) !important;
          color: oklch(0.22 0.055 250) !important;
          border-color: oklch(0.87 0.025 80) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: oklch(0.966 0.02 82) !important;
        }
        .leaflet-control-zoom-in {
          border-bottom: 1px solid oklch(0.87 0.025 80) !important;
        }
        .leaflet-control-attribution {
          background: oklch(1 0 0 / 0.85) !important;
          color: oklch(0.45 0.03 250 / 0.6) !important;
          font-size: 10px !important;
          border-radius: 8px 0 0 0 !important;
          padding: 2px 8px !important;
        }
        .leaflet-control-attribution a {
          color: oklch(0.55 0.16 250) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          border: 1px solid oklch(0.87 0.025 80) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 180px !important;
        }
        .leaflet-popup-tip {
          box-shadow: none !important;
        }
        .leaflet-interactive:focus {
          outline: none !important;
        }
      `}</style>

      <MapContainer
        center={philippinesCenter}
        zoom={philippinesZoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ProvinceLayer
          onProvinceClick={handleProvinceClick}
          activeProvince={activeProvince?.id ?? null}
        />
        <ZoomController province={activeProvince} />
        <MapEvents onMapClick={handleMapClick} />
        {visiblePins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.coords}
            icon={activePin?.id === pin.id ? activeIcon : defaultIcon}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e.originalEvent);
                handlePinClick(pin);
              },
            }}
          />
        ))}
      </MapContainer>

      {/* Municipality nav - compact top-left */}
      <div className="absolute left-3 top-3 z-[1000]">
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-cream/95 shadow-lg backdrop-blur-md">
          <div className="border-b border-ink/10 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-soft">Municipalities</span>
          </div>
          <div className="flex flex-wrap gap-1 p-2">
            <button
              onClick={handleResetView}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                !activeProvince
                  ? "bg-ink text-primary-foreground"
                  : "text-ink-soft hover:bg-ink/10"
              }`}
            >
              All
            </button>
            {provinces.map((prov) => (
              <button
                key={prov.id}
                onClick={() => handleProvinceClick(prov)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                  activeProvince?.id === prov.id
                    ? "bg-ink text-primary-foreground"
                    : "text-ink-soft hover:bg-ink/10"
                }`}
              >
                {prov.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced filters */}
      <AdvancedFilters
        municipalities={municipalities}
        attractionNames={attractionNames}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={visiblePins.length}
        totalCount={mapPins.length}
      />

      {/* Stats bar */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="flex items-center gap-4 rounded-xl border border-ink/10 bg-cream/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              {visiblePins.length} {visiblePins.length === 1 ? "site" : "sites"}
            </span>
          </div>
          {activeProvince && (
            <>
              <span className="h-3 w-px bg-ink/20" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                {activeProvince.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preview panel */}
      <MapPreviewPanel pin={activePin} isOpen={panelOpen} onClose={handleClosePanel} />
    </div>
  );
}
