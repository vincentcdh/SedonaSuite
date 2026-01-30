import { type FC } from 'react'
import { Badge } from '@sedona/ui'
import { X } from 'lucide-react'
import type { Tag } from '../../types'

interface TagBadgeProps {
  tag: Tag | string
  onRemove?: () => void
  onClick?: () => void
  className?: string
}

export const TagBadge: FC<TagBadgeProps> = ({ tag, onRemove, onClick, className }) => {
  const tagName = typeof tag === 'string' ? tag : tag.name
  const tagColor = typeof tag === 'string' ? '#0c82d6' : tag.color

  return (
    <Badge
      variant="secondary"
      className={`cursor-default ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className || ''}`}
      style={{
        backgroundColor: `${tagColor}20`,
        color: tagColor,
        borderColor: `${tagColor}40`,
      }}
      onClick={onClick}
    >
      {tagName}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
