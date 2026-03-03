import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand tokens mapped from src/lib/tokens.ts
        'brand-primary':       '#2563EB',
        'brand-primary-hover': '#1D4ED8',
        'brand-text-dark':     '#111827',
        'brand-text-muted':    '#4B5563',
        'brand-border':        '#E5E7EB',
        'brand-bg-page':       '#F9FAFB',
        'brand-bg-card':       '#FFFFFF',
        'brand-success':       '#16A34A',
        'brand-warning':       '#D97706',
        'brand-error':         '#DC2626',
        'brand-info':          '#0EA5E9',
        // shadcn/ui semantic tokens (CSS variable-based)
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg:    'var(--radius)',
        md:    'calc(var(--radius) - 2px)',
        sm:    'calc(var(--radius) - 4px)',
        input: '8px',
        card:  '8px',
        modal: '12px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.08)',
        appbar: '0 1px 4px rgba(0,0,0,0.10)',
      },
      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
