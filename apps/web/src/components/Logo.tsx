// ===========================================
// LOGO COMPONENT - Sedona.AI
// ===========================================

import { type FC } from 'react'
import { cn } from '@sedona/ui'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-[200px] h-auto',
  md: 'w-[350px] h-auto',
  lg: 'w-[450px] h-auto',
}

export const Logo: FC<LogoProps> = ({ className, size = 'md' }) => {
  return (
    <img
      src="/logo.png"
      alt="Sedona.AI"
      className={cn(sizeClasses[size], className)}
    />
  )
}

// Icon-only version for sidebar - takes full available width
export const LogoIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <img
      src="/logo.png"
      alt="Sedona.AI"
      className={cn('w-full h-auto', className)}
    />
  )
}
