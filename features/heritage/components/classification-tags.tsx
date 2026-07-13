import type { HeritageSiteTag, HeritageCategory } from "../types"

interface ClassificationTagsProps {
  category: HeritageCategory | null
  tags: HeritageSiteTag[]
}

export default function ClassificationTags({ category, tags }: ClassificationTagsProps) {
  if (!category && tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {category && (
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: category.color ? `${category.color}15` : undefined,
            color: category.color ?? undefined,
          }}
        >
          {category.name}
        </span>
      )}

      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary"
        >
          {tag.tag}
        </span>
      ))}
    </div>
  )
}
