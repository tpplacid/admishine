// Per-org brand palette presets.
// Each palette overrides the CSS custom properties used in @theme.

export interface Palette {
  key: string
  label: string
  /** Tailwind preview class for the swatch */
  swatch: string
  css: {
    '--color-brand-50': string
    '--color-brand-100': string
    '--color-brand-200': string
    '--color-brand-300': string
    '--color-brand-400': string
    '--color-brand-500': string
    '--color-brand-600': string
    '--color-brand-700': string
    '--color-brand-800': string
    '--color-brand-900': string
  }
}

export const PALETTES: Palette[] = [
  {
    key: 'teal',
    label: 'Teal (default)',
    swatch: '#3d9191',
    css: {
      '--color-brand-50':  '#e6f4f4',
      '--color-brand-100': '#b2d8d8',
      '--color-brand-200': '#88b8b8',
      '--color-brand-300': '#5c9c9c',
      '--color-brand-400': '#3d9191',
      '--color-brand-500': '#2a7070',
      '--color-brand-600': '#236868',
      '--color-brand-700': '#1e5c5c',
      '--color-brand-800': '#1a4a50',
      '--color-brand-900': '#123438',
    },
  },
  {
    key: 'blue',
    label: 'Ocean Blue',
    swatch: '#2563eb',
    css: {
      '--color-brand-50':  '#eff6ff',
      '--color-brand-100': '#dbeafe',
      '--color-brand-200': '#bfdbfe',
      '--color-brand-300': '#93c5fd',
      '--color-brand-400': '#2563eb',
      '--color-brand-500': '#1d4ed8',
      '--color-brand-600': '#1e40af',
      '--color-brand-700': '#1e3a8a',
      '--color-brand-800': '#1e3a7a',
      '--color-brand-900': '#172554',
    },
  },
  {
    key: 'green',
    label: 'Forest Green',
    swatch: '#16a34a',
    css: {
      '--color-brand-50':  '#f0fdf4',
      '--color-brand-100': '#dcfce7',
      '--color-brand-200': '#bbf7d0',
      '--color-brand-300': '#86efac',
      '--color-brand-400': '#16a34a',
      '--color-brand-500': '#15803d',
      '--color-brand-600': '#166534',
      '--color-brand-700': '#14532d',
      '--color-brand-800': '#14532d',
      '--color-brand-900': '#052e16',
    },
  },
  {
    key: 'indigo',
    label: 'Indigo',
    swatch: '#4f46e5',
    css: {
      '--color-brand-50':  '#eef2ff',
      '--color-brand-100': '#e0e7ff',
      '--color-brand-200': '#c7d2fe',
      '--color-brand-300': '#a5b4fc',
      '--color-brand-400': '#4f46e5',
      '--color-brand-500': '#4338ca',
      '--color-brand-600': '#3730a3',
      '--color-brand-700': '#312e81',
      '--color-brand-800': '#2e2b72',
      '--color-brand-900': '#1e1b4b',
    },
  },
  {
    key: 'rose',
    label: 'Rose',
    swatch: '#e11d48',
    css: {
      '--color-brand-50':  '#fff1f2',
      '--color-brand-100': '#ffe4e6',
      '--color-brand-200': '#fecdd3',
      '--color-brand-300': '#fda4af',
      '--color-brand-400': '#e11d48',
      '--color-brand-500': '#be123c',
      '--color-brand-600': '#9f1239',
      '--color-brand-700': '#881337',
      '--color-brand-800': '#7a1132',
      '--color-brand-900': '#4c0519',
    },
  },
  {
    key: 'amber',
    label: 'Amber',
    swatch: '#d97706',
    css: {
      '--color-brand-50':  '#fffbeb',
      '--color-brand-100': '#fef3c7',
      '--color-brand-200': '#fde68a',
      '--color-brand-300': '#fcd34d',
      '--color-brand-400': '#d97706',
      '--color-brand-500': '#b45309',
      '--color-brand-600': '#92400e',
      '--color-brand-700': '#78350f',
      '--color-brand-800': '#6b2e0c',
      '--color-brand-900': '#451a03',
    },
  },
  {
    key: 'purple',
    label: 'Purple',
    swatch: '#9333ea',
    css: {
      '--color-brand-50':  '#faf5ff',
      '--color-brand-100': '#f3e8ff',
      '--color-brand-200': '#e9d5ff',
      '--color-brand-300': '#d8b4fe',
      '--color-brand-400': '#9333ea',
      '--color-brand-500': '#7e22ce',
      '--color-brand-600': '#6b21a8',
      '--color-brand-700': '#581c87',
      '--color-brand-800': '#4a1878',
      '--color-brand-900': '#3b0764',
    },
  },
  {
    key: 'slate',
    label: 'Midnight Slate',
    swatch: '#475569',
    css: {
      '--color-brand-50':  '#f8fafc',
      '--color-brand-100': '#f1f5f9',
      '--color-brand-200': '#e2e8f0',
      '--color-brand-300': '#94a3b8',
      '--color-brand-400': '#475569',
      '--color-brand-500': '#334155',
      '--color-brand-600': '#1e293b',
      '--color-brand-700': '#0f172a',
      '--color-brand-800': '#0a1020',
      '--color-brand-900': '#060912',
    },
  },
]

export const DEFAULT_PALETTE = 'teal'

export function getPalette(key: string | null | undefined): Palette {
  return PALETTES.find(p => p.key === key) ?? PALETTES[0]
}

export function buildThemeCSS(palette: Palette): string {
  const vars = Object.entries(palette.css)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  return `:root {\n${vars}\n}`
}
