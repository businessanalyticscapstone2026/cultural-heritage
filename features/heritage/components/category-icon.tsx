import { createElement } from "react"
import { getCategoryIcon } from "../constants/category-icons"

interface CategoryIconProps {
  name?: string | null
  className?: string
}

export default function CategoryIcon({ name, className }: CategoryIconProps) {
  return createElement(getCategoryIcon(name), { className })
}
