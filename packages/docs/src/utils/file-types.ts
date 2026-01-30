// ===========================================
// FILE TYPE UTILITIES
// ===========================================

import type { FileType } from '../types'

// ===========================================
// MIME TYPE TO FILE TYPE MAPPING
// ===========================================

const mimeTypeMap: Record<string, FileType> = {
  // Documents
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.oasis.opendocument.text': 'document',
  'text/plain': 'document',
  'text/markdown': 'document',
  'application/rtf': 'document',

  // Spreadsheets
  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'text/csv': 'spreadsheet',

  // Presentations
  'application/vnd.ms-powerpoint': 'presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
  'application/vnd.oasis.opendocument.presentation': 'presentation',

  // PDF
  'application/pdf': 'pdf',

  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',

  // Video
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',

  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/webm': 'audio',
  'audio/aac': 'audio',
  'audio/flac': 'audio',

  // Archives
  'application/zip': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/gzip': 'archive',
  'application/x-tar': 'archive',
}

// ===========================================
// EXTENSION TO FILE TYPE MAPPING
// ===========================================

const extensionMap: Record<string, FileType> = {
  // Documents
  doc: 'document',
  docx: 'document',
  odt: 'document',
  txt: 'document',
  md: 'document',
  rtf: 'document',

  // Spreadsheets
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  ods: 'spreadsheet',
  csv: 'spreadsheet',

  // Presentations
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',

  // PDF
  pdf: 'pdf',

  // Images
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  tiff: 'image',
  tif: 'image',

  // Video
  mp4: 'video',
  webm: 'video',
  ogv: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',

  // Audio
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  aac: 'audio',
  flac: 'audio',
  m4a: 'audio',

  // Archives
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  gz: 'archive',
  tar: 'archive',
}

// ===========================================
// GET FILE TYPE
// ===========================================

export function getFileType(mimeType?: string | null, extension?: string | null): FileType {
  if (mimeType && mimeTypeMap[mimeType]) {
    return mimeTypeMap[mimeType]
  }

  if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '')
    if (extensionMap[ext]) {
      return extensionMap[ext]
    }
  }

  return 'other'
}

// ===========================================
// GET EXTENSION FROM FILENAME
// ===========================================

export function getExtension(filename: string): string | null {
  const parts = filename.split('.')
  if (parts.length < 2) return null
  const ext = parts[parts.length - 1]
  return ext ? ext.toLowerCase() : null
}

// ===========================================
// FILE TYPE LABELS
// ===========================================

export const fileTypeLabels: Record<FileType, string> = {
  document: 'Document',
  spreadsheet: 'Tableur',
  presentation: 'Presentation',
  pdf: 'PDF',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  archive: 'Archive',
  other: 'Autre',
}

// ===========================================
// FILE TYPE ICONS (Lucide icon names)
// ===========================================

export const fileTypeIcons: Record<FileType, string> = {
  document: 'FileText',
  spreadsheet: 'Sheet',
  presentation: 'Presentation',
  pdf: 'FileText',
  image: 'Image',
  video: 'Video',
  audio: 'Music',
  archive: 'Archive',
  other: 'File',
}

// ===========================================
// FILE TYPE COLORS
// ===========================================

export const fileTypeColors: Record<FileType, string> = {
  document: '#3b82f6', // blue
  spreadsheet: '#10b981', // green
  presentation: '#f59e0b', // amber
  pdf: '#ef4444', // red
  image: '#8b5cf6', // purple
  video: '#ec4899', // pink
  audio: '#06b6d4', // cyan
  archive: '#6b7280', // gray
  other: '#9ca3af', // light gray
}

// ===========================================
// IS PREVIEWABLE
// ===========================================

export function isPreviewable(fileType: FileType, mimeType?: string | null): boolean {
  const previewableTypes: FileType[] = ['image', 'pdf', 'video', 'audio']

  if (previewableTypes.includes(fileType)) {
    return true
  }

  // Some documents can be previewed
  if (fileType === 'document' && mimeType === 'text/plain') {
    return true
  }

  return false
}

// ===========================================
// GET PREVIEW TYPE
// ===========================================

export type PreviewType = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'code' | 'none'

export function getPreviewType(fileType: FileType, mimeType?: string | null, extension?: string | null): PreviewType {
  if (fileType === 'image') return 'image'
  if (fileType === 'pdf') return 'pdf'
  if (fileType === 'video') return 'video'
  if (fileType === 'audio') return 'audio'

  // Code files
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'scss', 'py', 'rb', 'go', 'rs', 'java', 'php', 'c', 'cpp', 'h', 'hpp', 'sh', 'bash', 'yml', 'yaml', 'xml', 'sql']
  if (extension && codeExtensions.includes(extension.toLowerCase())) {
    return 'code'
  }

  // Plain text
  if (mimeType?.startsWith('text/') || extension === 'txt' || extension === 'md') {
    return 'text'
  }

  return 'none'
}
