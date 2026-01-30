import { type FC, useState } from 'react'
import { Button, Input } from '@sedona/ui'
import { Plus, Check } from 'lucide-react'
import type { Tag } from '../../types'
import { TagBadge } from './TagBadge'

interface TagPickerProps {
  tags: Tag[]
  selectedTags: string[]
  onTagSelect: (tagName: string) => void
  onTagDeselect: (tagName: string) => void
  onCreateTag?: (name: string) => Promise<void>
  isCreating?: boolean
}

export const TagPicker: FC<TagPickerProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  onTagDeselect,
  onCreateTag,
  isCreating,
}) => {
  const [search, setSearch] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  const canCreateNew =
    search.length > 0 &&
    !tags.some((tag) => tag.name.toLowerCase() === search.toLowerCase())

  const handleCreateTag = async () => {
    if (!onCreateTag || !search) return
    await onCreateTag(search)
    setSearch('')
    setIsAddingNew(false)
  }

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder="Rechercher ou creer un tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canCreateNew && onCreateTag) {
              e.preventDefault()
              handleCreateTag()
            }
          }}
        />
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName)
            return (
              <TagBadge
                key={tagName}
                tag={tag || tagName}
                onRemove={() => onTagDeselect(tagName)}
              />
            )
          })}
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-2">
        {filteredTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() =>
                isSelected ? onTagDeselect(tag.name) : onTagSelect(tag.name)
              }
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
              style={
                !isSelected
                  ? {
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }
                  : undefined
              }
            >
              {isSelected && <Check className="h-3 w-3" />}
              {tag.name}
            </button>
          )
        })}

        {/* Create New Tag */}
        {canCreateNew && onCreateTag && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateTag}
            disabled={isCreating}
          >
            <Plus className="h-3 w-3 mr-1" />
            Creer "{search}"
          </Button>
        )}
      </div>

      {/* Empty State */}
      {filteredTags.length === 0 && !canCreateNew && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Aucun tag trouve
        </p>
      )}
    </div>
  )
}
