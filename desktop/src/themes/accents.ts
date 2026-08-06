/**
 * Accent Colors — DevVerse Desktop
 *
 * Each accent color overrides --accent-primary and related variables.
 * The ThemeContext merges these on top of the base theme.
 */

import type { AccentColor } from '@/types/theme.types';

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'cyan',
    name: 'Cyan',
    primary: '#38bdf8',
    hover:   '#0ea5e9',
    subtle:  'rgba(56,189,248,0.10)',
    border:  'rgba(56,189,248,0.30)',
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#3b82f6',
    hover:   '#2563eb',
    subtle:  'rgba(59,130,246,0.10)',
    border:  'rgba(59,130,246,0.30)',
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#a855f7',
    hover:   '#9333ea',
    subtle:  'rgba(168,85,247,0.10)',
    border:  'rgba(168,85,247,0.30)',
  },
  {
    id: 'green',
    name: 'Green',
    primary: '#22c55e',
    hover:   '#16a34a',
    subtle:  'rgba(34,197,94,0.10)',
    border:  'rgba(34,197,94,0.30)',
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#f97316',
    hover:   '#ea580c',
    subtle:  'rgba(249,115,22,0.10)',
    border:  'rgba(249,115,22,0.30)',
  },
  {
    id: 'red',
    name: 'Red',
    primary: '#ef4444',
    hover:   '#dc2626',
    subtle:  'rgba(239,68,68,0.10)',
    border:  'rgba(239,68,68,0.30)',
  },
  {
    id: 'pink',
    name: 'Pink',
    primary: '#ec4899',
    hover:   '#db2777',
    subtle:  'rgba(236,72,153,0.10)',
    border:  'rgba(236,72,153,0.30)',
  },
  {
    id: 'teal',
    name: 'Teal',
    primary: '#14b8a6',
    hover:   '#0d9488',
    subtle:  'rgba(20,184,166,0.10)',
    border:  'rgba(20,184,166,0.30)',
  },
  {
    id: 'gold',
    name: 'Gold',
    primary: '#eab308',
    hover:   '#ca8a04',
    subtle:  'rgba(234,179,8,0.10)',
    border:  'rgba(234,179,8,0.30)',
  },
];

export const getAccentById = (id: string): AccentColor => {
  return ACCENT_COLORS.find((a) => a.id === id) ?? ACCENT_COLORS[0];
};
