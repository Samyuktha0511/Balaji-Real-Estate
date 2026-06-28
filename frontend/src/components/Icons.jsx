import React from 'react'

const base = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
}

export const Pin = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

export const Phone = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

export const Whatsapp = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24zm-3.06 4.4c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41-.14-.01-.3-.01-.46-.01z" />
    </svg>
)

export const Mail = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
)

export const ArrowRight = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
)

export const ArrowLeft = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="m12 19-7-7 7-7M19 12H5" />
    </svg>
)

export const Search = ({ s = 16 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)

export const Check = ({ s = 14 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
)

export const ChevronUp = ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="m18 15-6-6-6 6" />
    </svg>
)

export const Doc = ({ s = 18 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
)

export const ShieldLeaf = ({ s = 26 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3c0 2-3 4-3 4s-3-2-3-4z" />
    </svg>
)

export const Handshake = ({ s = 26 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6a1 1 0 0 0 0-1.4L13 9" />
        <path d="M14 12 9 7l-5 5 2 2" />
        <path d="m18 16 3-3M3 13l3 3" />
    </svg>
)

export const MapPinned = ({ s = 26 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M18 8c0 4.5-6 10-6 10S6 12.5 6 8a6 6 0 0 1 12 0z" />
        <circle cx="12" cy="8" r="2" />
        <path d="M9 18.5 4 21v-3M15 18.5 20 21v-3" />
    </svg>
)

export const Leaf = ({ s = 22 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21 3s-2 9-9 12C7 17 4 13 4 13s3-2 7-2c-3-1-6 0-6 0s2-8 9-9c3.5-.5 7 1 7 1z" />
    </svg>
)

export const Sprout = ({ s = 26 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M7 20h10" />
        <path d="M12 20c0-6 0-8 0-10" />
        <path d="M12 10C12 7 9.5 4 5 4c0 4.5 3 7 7 7z" />
        <path d="M12 12c0-2.5 2.5-5 6-5 0 3.5-2.5 6-6 6z" />
    </svg>
)

export const Tag = ({ s = 26 }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" {...base}>
        <path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L3 13V3h10l7.59 7.59a2 2 0 0 1 0 2.82z" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
)
