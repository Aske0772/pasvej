import type { ReactNode, SVGProps } from 'react'

// Minimal stroke icons (24×24), drawn in the same style as the idebanken meal app. Colour follows currentColor.
type P = SVGProps<SVGSVGElement> & { size?: number }

const Svg = ({ children, size = 22, ...rest }: P & { children: ReactNode }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}
  >
    {children}
  </svg>
)

export const Home = (p: P) => <Svg {...p}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" /></Svg>
export const Book = (p: P) => (
  <Svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></Svg>
)
export const Clock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
export const User = (p: P) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></Svg>
export const Calendar = (p: P) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>
)
export const X = (p: P) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
export const Check = (p: P) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
export const Chevron = (p: P) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>
export const Back = (p: P) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>
export const Plus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const Minus = (p: P) => <Svg {...p}><path d="M5 12h14" /></Svg>
export const Link = (p: P) => (
  <Svg {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>
)
export const Lock = (p: P) => (
  <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>
)
