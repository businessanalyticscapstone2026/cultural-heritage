import {
  BookOpen,
  Building2,
  Camera,
  Castle,
  Church,
  Compass,
  Home,
  Landmark,
  Library,
  MapPin,
  Music,
  Scroll,
  Search,
  Sparkles,
  Theater,
  TreePine,
  Trees,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react"

export interface CategoryIconOption {
  value: string
  label: string
  icon: LucideIcon
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: "Church", label: "Religious", icon: Church },
  { value: "BookOpen", label: "Historical", icon: BookOpen },
  { value: "Home", label: "Heritage House", icon: Home },
  { value: "Building2", label: "Buildings", icon: Building2 },
  { value: "Castle", label: "Forts & Defenses", icon: Castle },
  { value: "Landmark", label: "Monuments & Landmarks", icon: Landmark },
  { value: "Library", label: "Museum", icon: Library },
  { value: "Scroll", label: "Documents & Artifacts", icon: Scroll },
  { value: "Search", label: "Archaeological", icon: Search },
  { value: "Compass", label: "Exploration", icon: Compass },
  { value: "Trees", label: "Natural (Forest)", icon: Trees },
  { value: "TreePine", label: "Natural (Pine)", icon: TreePine },
  { value: "Waves", label: "Coastal", icon: Waves },
  { value: "Music", label: "Cultural Events", icon: Music },
  { value: "Sparkles", label: "Festivals & Traditions", icon: Sparkles },
  { value: "Theater", label: "Performing Arts", icon: Theater },
  { value: "Camera", label: "Festivals & Media", icon: Camera },
  { value: "Utensils", label: "Culinary Heritage", icon: Utensils },
  { value: "MapPin", label: "Other Points of Interest", icon: MapPin },
]

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((option) => [option.value, option.icon]),
)

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return MapPin
  return CATEGORY_ICON_MAP[iconName] ?? MapPin
}
