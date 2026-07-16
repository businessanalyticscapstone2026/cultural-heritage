export interface Province {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
}

export const provinces: Province[] = [
  {
    id: "balayan",
    name: "Balayan",
    center: [13.9377, 120.732],
    zoom: 13,
    bounds: [[13.88, 120.65], [13.98, 120.82]],
  },
  {
    id: "calatagan",
    name: "Calatagan",
    center: [13.8322, 120.6328],
    zoom: 13,
    bounds: [[13.78, 120.58], [13.9, 120.72]],
  },
  {
    id: "lian",
    name: "Lian",
    center: [13.8619, 120.7178],
    zoom: 13,
    bounds: [[13.82, 120.65], [13.92, 120.78]],
  },
  {
    id: "nasugbu",
    name: "Nasugbu",
    center: [14.0689, 120.6308],
    zoom: 12,
    bounds: [[14.0, 120.55], [14.12, 120.72]],
  },
  {
    id: "tuy",
    name: "Tuy",
    center: [14.0167, 120.6833],
    zoom: 13,
    bounds: [[13.98, 120.62], [14.08, 120.78]],
  },
];

export const philippinesCenter: [number, number] = [13.95, 120.68];
export const philippinesZoom = 11;
