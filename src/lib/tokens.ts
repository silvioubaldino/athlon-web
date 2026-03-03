/**
 * Design tokens — single source of truth for all brand colors, radii, and shadows.
 * Tailwind classes reference these via tailwind.config.ts (brand-* prefix).
 */
export const tokens = {
  color: {
    primary:      '#2563EB',  // blue-600
    primaryHover: '#1D4ED8',  // blue-700
    textDark:     '#111827',  // gray-900
    textMuted:    '#4B5563',  // gray-600
    border:       '#E5E7EB',  // gray-200
    bgPage:       '#F9FAFB',  // gray-50
    bgCard:       '#FFFFFF',
    success:      '#16A34A',
    warning:      '#D97706',
    error:        '#DC2626',
    info:         '#0EA5E9',
  },
  radius: {
    input:  '8px',
    card:   '8px',
    modal:  '12px',
  },
  shadow: {
    card:   '0 1px 3px rgba(0,0,0,0.08)',
    appBar: '0 1px 4px rgba(0,0,0,0.10)',
  },
} as const

export type TokenColor  = keyof typeof tokens.color
export type TokenRadius = keyof typeof tokens.radius
export type TokenShadow = keyof typeof tokens.shadow
