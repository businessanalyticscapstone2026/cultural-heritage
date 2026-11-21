import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";

export type AccessibilityLevel = "wheelchair" | "guided-tours" | "self-guided" | "hiking-required" | "boat-access";
export type SignificanceLevel = "world-heritage" | "national" | "regional" | "local";

export interface MapPin {
  id: string;
  name: string;
  province: string;
  municipality: string;
  coords: [number, number];
  image: string;
  era: string;
  category: string;
  description: string;
  accessibility: AccessibilityLevel[];
  historicalSignificance: SignificanceLevel;
  nearbyAttractions: string[];
}

export const mapPins: MapPin[] = [
  {
    id: "basilica-martin",
    name: "Basilica of St. Martin de Tours",
    province: "Batangas",
    municipality: "Balayan",
    coords: [13.9372, 120.7315],
    image: dest1,
    era: "1575",
    category: "Sacred",
    description:
      "One of the oldest churches in the Philippines, originally built by the Augustinians in 1575. The current structure dates from the 19th century and houses centuries-old religious artifacts.",
    accessibility: ["wheelchair", "guided-tours", "self-guided"],
    historicalSignificance: "national",
    nearbyAttractions: ["Balayan Town Plaza", "Galleria Taal", "Casa de Segunda"],
  },
  {
    id: "balayan-heritage-houses",
    name: "Balayan Heritage Houses",
    province: "Batangas",
    municipality: "Balayan",
    coords: [13.9385, 120.7330],
    image: dest2,
    era: "1800s",
    category: "Colonial",
    description:
      "A collection of well-preserved Spanish colonial-era ancestral houses along the town's heritage corridor, showcasing traditional bahay na bato architecture with capiz shell windows.",
    accessibility: ["self-guided", "guided-tours"],
    historicalSignificance: "regional",
    nearbyAttractions: ["Basilica of St. Martin de Tours", "Balayan Town Plaza"],
  },
  {
    id: "calatagan-ruins",
    name: "Calatagan Ruins",
    province: "Batangas",
    municipality: "Calatagan",
    coords: [13.8310, 120.6335],
    image: dest4,
    era: "1800s",
    category: "Colonial",
    description:
      "Ruins of a grand Spanish colonial estate overlooking Calatagan's coastline. The site features remnants of stone walls, a watchtower, and burial grounds dating to the pre-colonial period.",
    accessibility: ["self-guided", "hiking-required"],
    historicalSignificance: "regional",
    nearbyAttractions: ["Calatagan Beach", "Punta Fuego", "Liang Museum"],
  },
  {
    id: "calatagan-burial",
    name: "Calatagan Archaeological Site",
    province: "Batangas",
    municipality: "Calatagan",
    coords: [13.8280, 120.6290],
    image: dest3,
    era: "14th century",
    category: "UNESCO",
    description:
      "A significant pre-colonial burial ground excavated in the 1960s, yielding thousands of artifacts including gold ornaments, ceramics, and stone tools from the 14th century.",
    accessibility: ["self-guided"],
    historicalSignificance: "world-heritage",
    nearbyAttractions: ["Calatagan Ruins", "Punta Fuego"],
  },
  {
    id: "lian-church",
    name: "Lian Church (San Juan Bautista)",
    province: "Batangas",
    municipality: "Lian",
    coords: [13.8600, 120.7150],
    image: dest1,
    era: "1855",
    category: "Sacred",
    description:
      "A 19th-century coral stone church dedicated to St. John the Baptist, notable for its neoclassical facade and centuries-old baptistery. The church survived the Philippine Revolution.",
    accessibility: ["wheelchair", "guided-tours"],
    historicalSignificance: "regional",
    nearbyAttractions: ["Lian Town Plaza", "Malaruhatan Beach"],
  },
  {
    id: "nasugbu-church",
    name: "Our Lady of the Assumption Parish",
    province: "Batangas",
    municipality: "Nasugbu",
    coords: [14.0695, 120.6290],
    image: dest1,
    era: "1611",
    category: "Sacred",
    description:
      "Founded by the Augustinians in 1611, this historic church served as a fortress against Moro raids. Its thick stone walls and bell tower remain largely original.",
    accessibility: ["wheelchair", "guided-tours", "self-guided"],
    historicalSignificance: "national",
    nearbyAttractions: ["Fortune Island", "Nasugbu Beach", "Kay Gurang Cave"],
  },
  {
    id: "fortune-island",
    name: "Fortune Island Ruins",
    province: "Batangas",
    municipality: "Nasugbu",
    coords: [14.1167, 120.5833],
    image: dest4,
    era: "1980s",
    category: "Colonial",
    description:
      "An abandoned luxury resort on a private island featuring a replica of the Acropolis of Athens. The dramatic ruins have become an iconic landmark and popular hiking destination.",
    accessibility: ["boat-access", "hiking-required"],
    historicalSignificance: "local",
    nearbyAttractions: ["Nasugbu Beach", "Montemaria Shrine"],
  },
  {
    id: "tuy-church",
    name: "San Jose Parish Church",
    province: "Batangas",
    municipality: "Tuy",
    coords: [14.0170, 120.6820],
    image: dest1,
    era: "1875",
    category: "Sacred",
    description:
      "A sturdy Spanish colonial church built from volcanic stone, featuring a distinctive bell tower and an adjacent convento that now serves as the municipal hall.",
    accessibility: ["self-guided", "guided-tours"],
    historicalSignificance: "regional",
    nearbyAttractions: ["Tuy Town Plaza", "Gulod National Park"],
  },
  {
    id: "gulod-nature",
    name: "Gulod National Park",
    province: "Batangas",
    municipality: "Tuy",
    coords: [14.0350, 120.7100],
    image: dest3,
    era: "Natural Attraction",
    category: "UNESCO",
    description:
      "A protected forest reserve at the foot of Mt. Malarayat, home to endemic flora and fauna. The park contains a pre-colonial trail network used by indigenous Tagalogs.",
    accessibility: ["hiking-required", "guided-tours"],
    historicalSignificance: "regional",
    nearbyAttractions: ["San Jose Parish Church", "Mt. Malarayat"],
  },
  {
    id: "malaruhatan-fort",
    name: "Malaruhatan Watchtower Ruins",
    province: "Batangas",
    municipality: "Lian",
    coords: [13.8450, 120.6900],
    image: dest4,
    era: "1700s",
    category: "Colonial",
    description:
      "Remnants of a Spanish-era coastal defense watchtower used to warn against Moro pirate raids. The stone tower overlooks the Balayan Bay and is accessible via a short coastal trail.",
    accessibility: ["self-guided", "hiking-required"],
    historicalSignificance: "local",
    nearbyAttractions: ["Lian Church", "Malaruhatan Beach"],
  },
];
