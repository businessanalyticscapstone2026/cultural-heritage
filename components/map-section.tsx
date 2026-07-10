"use client";

import { Church, Landmark, Building2, MapPin } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/map";

const legend = [
  { label: "Churches", Icon: Church },
  { label: "Museums", Icon: Landmark },
  { label: "Ancestral Houses", Icon: Building2 },
  { label: "Monuments", Icon: MapPin },
];

const stats = [
  { value: "150+", label: "Heritage Sites" },
  { value: "8", label: "Municipalities" },
  { value: "12,000", label: "Visitors" },
  { value: "95%", label: "Positive Reviews" },
];

const heritageSites = [
  {
    name: "Taal Basilica",
    category: "Church",
    lng: 120.9225,
    lat: 13.8803,
  },
  {
    name: "Cape Santiago Lighthouse",
    category: "Monument",
    lng: 120.6255,
    lat: 13.9322,
  },
  {
    name: "Caleruega Church",
    category: "Church",
    lng: 120.6842,
    lat: 14.0738,
  },
  {
    name: "Immaculate Conception Parish",
    category: "Church",
    lng: 120.7314,
    lat: 13.9403,
  },
  {
    name: "St. John the Baptist Parish",
    category: "Church",
    lng: 120.6513,
    lat: 14.0422,
  },
  {
    name: "Mabini Ancestral House",
    category: "Ancestral Houses",
    lng: 120.9078,
    lat: 13.7522,
  },
  {
    name: "Basilica of the Immaculate Conception",
    category: "Churches",
    lng: 121.0118,
    lat: 13.8762,
  },
];

export default function MapSection() {
  return (
    <section className="bg-card py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <h2 className="font-heading text-2xl font-semibold text-heading">
          Interactive Heritage Map
        </h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr_260px]">
          <div className="rounded-xl border border-border bg-card p-5 shadow-md">
            <ul className="space-y-4">
              {legend.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <span className="text-sm text-body">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-80 overflow-hidden rounded-xl border border-border shadow-md lg:h-[300px]">
            <Map center={[120.78, 13.92]} zoom={10} className="h-full w-full">
              <MapControls position="top-right" />
              {heritageSites.map((site) => (
                <MapMarker
                  key={site.name}
                  longitude={site.lng}
                  latitude={site.lat}
                >
                  <MarkerContent>
                    <MapPin
                      className="h-7 w-7 -translate-x-1/2 -translate-y-full drop-shadow"
                      style={{ fill: "#2E5BFF", color: "#2E5BFF" }}
                    />
                  </MarkerContent>
                  <MarkerPopup closeButton>
                    <p className="text-sm font-semibold text-primary">
                      {site.name}
                    </p>
                    <p className="text-xs text-muted">{site.category}</p>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
          </div>

          <div className="grid grid-cols-2 content-start gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-card px-4 py-3 shadow-md text-center"
              >
                <p className="font-heading text-xl font-semibold text-primary">
                  {s.value}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
