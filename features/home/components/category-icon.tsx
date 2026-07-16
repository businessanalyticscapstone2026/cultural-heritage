import {
  BookOpen,
  Church,
  Home,
  Landmark,
  Library,
  MapPin,
  Music,
  Search,
  Trees,
  TreePine,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Church,
  BookOpen,
  Home,
  Trees,
  TreePine,
  Library,
  Landmark,
  Music,
  Search,
  MapPin,
}

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return MapPin
  return ICON_MAP[iconName] ?? MapPin
}
