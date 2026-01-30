// ===========================================
// FORMATTING UTILITIES
// ===========================================

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(
  value: number,
  options?: {
    locale?: string
    currency?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const {
    locale = 'fr-FR',
    currency = 'EUR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {}

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(
  value: number,
  options?: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const {
    locale = 'fr-FR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {}

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

/**
 * Format a number as percentage
 */
export function formatPercentage(
  value: number,
  options?: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const {
    locale = 'fr-FR',
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
  } = options || {}

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100)
}

/**
 * Format a duration in days/hours
 */
export function formatDuration(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24)
    return `${hours}h`
  }
  if (days === 1) {
    return '1 jour'
  }
  if (days < 30) {
    return `${Math.round(days)} jours`
  }
  if (days < 365) {
    const months = Math.round(days / 30)
    return months === 1 ? '1 mois' : `${months} mois`
  }
  const years = Math.round(days / 365)
  return years === 1 ? '1 an' : `${years} ans`
}

/**
 * Format a value based on metric format type
 */
export function formatMetricValue(
  value: number,
  format: 'number' | 'currency' | 'percentage' | 'duration'
): string {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percentage':
      return formatPercentage(value)
    case 'duration':
      return formatDuration(value)
    case 'number':
    default:
      return formatNumber(value)
  }
}

/**
 * Format a change value with sign and color indicator
 */
export function formatChange(
  change: number,
  format: 'number' | 'currency' | 'percentage' | 'duration' = 'number'
): {
  text: string
  color: 'green' | 'red' | 'gray'
  direction: 'up' | 'down' | 'stable'
} {
  const absChange = Math.abs(change)
  let text: string

  switch (format) {
    case 'currency':
      text = formatCurrency(absChange)
      break
    case 'percentage':
      text = formatPercentage(absChange)
      break
    default:
      text = formatNumber(absChange)
  }

  if (change > 0.01) {
    return { text: `+${text}`, color: 'green', direction: 'up' }
  } else if (change < -0.01) {
    return { text: `-${text}`, color: 'red', direction: 'down' }
  } else {
    return { text: '=', color: 'gray', direction: 'stable' }
  }
}

/**
 * Format a compact number (1.2K, 3.5M, etc.)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toFixed(0)
}
