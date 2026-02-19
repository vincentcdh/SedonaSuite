// ===========================================
// FILE UPLOAD COMPONENT
// ===========================================

import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  FileSpreadsheet,
  Presentation,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button, Progress, cn } from '@sedona/ui'
import { formatFileSize, getFileType, getExtension } from '../utils'
import type { DocsSettings } from '../types'

// ===========================================
// TYPES
// ===========================================

interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  extension: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface FileUploadProps {
  organizationId: string
  folderId?: string | null
  settings?: DocsSettings | null
  maxFiles?: number
  onUploadComplete?: (files: UploadFile[]) => void
  onUploadError?: (error: Error) => void
  className?: string
}

// ===========================================
// FILE ICONS
// ===========================================

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
    case 'document':
      return FileText
    case 'image':
      return Image
    case 'video':
      return Video
    case 'audio':
      return Music
    case 'archive':
      return Archive
    case 'spreadsheet':
      return FileSpreadsheet
    case 'presentation':
      return Presentation
    default:
      return File
  }
}

// ===========================================
// COMPONENT
// ===========================================

export function FileUpload({
  organizationId,
  folderId,
  settings,
  maxFiles = 10,
  onUploadComplete,
  onUploadError,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Default limits
  const maxFileSize = settings?.maxFileSizeBytes || 50 * 1024 * 1024 // 50MB default
  const allowedExtensions = settings?.allowedExtensions || []
  const blockedExtensions = settings?.blockedExtensions || ['exe', 'bat', 'cmd', 'sh', 'ps1', 'vbs', 'jar', 'msi', 'dll', 'scr', 'com']

  // Validate file
  const validateFile = (file: File): string | null => {
    const extension = (getExtension(file.name) ?? '').toLowerCase()

    // Check blocked extensions
    if (blockedExtensions.includes(extension)) {
      return `Le type de fichier .${extension} n'est pas autorise`
    }

    // Check allowed extensions (if specified)
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
      return `Le type de fichier .${extension} n'est pas autorise`
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `Le fichier depasse la taille maximale de ${formatFileSize(maxFileSize)}`
    }

    return null
  }

  // Add files to list
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const filesToAdd: UploadFile[] = []

    for (const file of fileArray) {
      if (files.length + filesToAdd.length >= maxFiles) {
        break
      }

      const error = validateFile(file)
      const extension = getExtension(file.name)
      const fileType = getFileType(extension)

      filesToAdd.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: fileType,
        extension: extension ?? '',
        status: error ? 'error' : 'pending',
        progress: 0,
        error: error || undefined,
      })
    }

    setFiles((prev) => [...prev, ...filesToAdd])
  }, [files.length, maxFiles, maxFileSize, allowedExtensions, blockedExtensions])

  // Remove file from list
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      // Reset input
      e.target.value = ''
    }
  }

  // Open file picker
  const openFilePicker = () => {
    inputRef.current?.click()
  }

  // Upload files
  const uploadFiles = async () => {
    const filesToUpload = files.filter((f) => f.status === 'pending')
    if (filesToUpload.length === 0) return

    setIsUploading(true)

    for (const uploadFile of filesToUpload) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
          )
        )

        // Create form data
        const formData = new FormData()
        formData.append('file', uploadFile.file)
        formData.append('organizationId', organizationId)
        if (folderId) {
          formData.append('folderId', folderId)
        }

        // TODO: Replace with actual API call
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress } : f
            )
          )
        }

        // Update status to success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'success' as const, progress: 100 } : f
          )
        )
      } catch (error) {
        // Update status to error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error' as const, error: 'Echec de l\'upload' }
              : f
          )
        )
        onUploadError?.(error as Error)
      }
    }

    setIsUploading(false)
    onUploadComplete?.(files.filter((f) => f.status === 'success'))
  }

  // Clear all files
  const clearFiles = () => {
    setFiles([])
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 transition-colors text-center',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          isUploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />

        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">
          Glissez vos fichiers ici
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          ou{' '}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={openFilePicker}
          >
            parcourez votre ordinateur
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Taille max: {formatFileSize(maxFileSize)} - {maxFiles} fichiers max
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {files.length} fichier{files.length > 1 ? 's' : ''} selectionne{files.length > 1 ? 's' : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFiles}>
              Tout supprimer
            </Button>
          </div>

          <div className="border rounded-lg divide-y max-h-64 overflow-auto">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type)

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="p-2 rounded-lg bg-muted">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.error && (
                        <span className="text-destructive">{file.error}</span>
                      )}
                    </div>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {file.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {file.status === 'success' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && pendingCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {successCount > 0 && <span className="text-green-600">{successCount} termine </span>}
            {errorCount > 0 && <span className="text-destructive">{errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
          </div>
          <Button onClick={uploadFiles} disabled={isUploading || pendingCount === 0}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importer {pendingCount} fichier{pendingCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
