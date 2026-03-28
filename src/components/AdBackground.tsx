/**
 * AdBackground
 *
 * Renders a full-viewport brand ad behind the app content.
 * - Picks a random ad from the list on page load (no auto-rotation)
 * - Designed to be swapped for a backend fetch later (see TODO)
 * - Dark overlay keeps app content readable over any image
 */

import { useState, useEffect } from 'react'

export interface Ad {
  id: string
  brand: string
  imageUrl: string
  mobileImageUrl?: string 
  desktopImageUrl?: string 
  tagline?: string
  linkUrl?: string
  overlayOpacity?: number   // 0–1, defaults to 0.82
}

// ── Static ad list — replace this with an API call later ──────────────────
// TODO: fetch from GET /api/ads/ and pass as prop or load in a hook
const STATIC_ADS: Ad[] = [
  {
    id: 'mtn-1',
    brand: 'MTN Nigeria',
    tagline: 'Everywhere You Go',
    imageUrl: '/images/mtnng.png', // fallback
    mobileImageUrl: '/images/mtnng-mobile.jpg',
    desktopImageUrl: '/images/mtnng.png',
    linkUrl: 'https://mtn.ng',
    overlayOpacity: 0.82,
  },
  {
    id: 'gt-1',
    brand: 'GTBank',
    tagline: 'Designed Around You',
    imageUrl: '/images/mtnng.png', // fallback
    mobileImageUrl: '/images/mtnng-mobile.jpg',
    desktopImageUrl: '/images/mtnng.png',
    linkUrl: 'https://gtbank.com',
    overlayOpacity: 0.84,
  },
  {
    id: 'dangote-1',
    brand: 'Dangote',
    tagline: 'Building Africa',
    imageUrl: '/images/mtnng.png', // fallback
    mobileImageUrl: '/images/mtnng-mobile.jpg',
    desktopImageUrl: '/images/mtnng.png',
    linkUrl: 'https://dangote.com',
    overlayOpacity: 0.80,
  },
  {
    id: 'airtel-1',
    brand: 'Airtel Nigeria',
    tagline: 'The Smartphone Network',
    imageUrl: '/images/mtnng.png', // fallback
    mobileImageUrl: '/images/mtnng-mobile.jpg',
    desktopImageUrl: '/images/mtnng.png',
    linkUrl: 'https://airtel.com.ng',
    overlayOpacity: 0.83,
  },
  {
    id: 'access-1',
    brand: 'Access Bank',
    tagline: 'More Than Banking',
    imageUrl: '/images/mtnng.png', // fallback
    mobileImageUrl: '/images/mtnng-mobile.jpg',
    desktopImageUrl: '/images/mtnng.png',
    linkUrl: 'https://accessbankplc.com',
    overlayOpacity: 0.85,
  },
]

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface AdBackgroundProps {
  ads?: Ad[]   // inject from backend later; falls back to STATIC_ADS
}

export function AdBackground({ ads }: AdBackgroundProps) {
  const adList = ads && ads.length > 0 ? ads : STATIC_ADS
  const [ad] = useState<Ad>(() => pickRandom(adList))
  const [loaded, setLoaded] = useState(false)

  // Preload the image so we fade in cleanly
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches

    const src =
        (isDesktop && ad.desktopImageUrl) ||
        (!isDesktop && ad.mobileImageUrl) ||
        ad.imageUrl

    const img = new Image()
    img.src = src
    img.onload = () => setLoaded(true)
    }, [ad])

  const opacity = ad.overlayOpacity ?? 0.82

  return (
    <>
      {/* ── Full-viewport ad image ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          overflow: 'hidden',
        }}
      >
        {/* <img
          src={ad.mobileImageUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
            display: 'block',
          }}
        /> */}
        <picture>
            {/* Desktop first */}
            {ad.desktopImageUrl && (
                <source
                media="(min-width: 768px)"
                srcSet={ad.desktopImageUrl}
                />
            )}

            {/* Mobile */}
            {ad.mobileImageUrl && (
                <source
                media="(max-width: 767px)"
                srcSet={ad.mobileImageUrl}
                />
            )}

            {/* Fallback */}
            <img
                src={ad.imageUrl}
                alt=""
                onLoad={() => setLoaded(true)}
                style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.6s ease',
                display: 'block',
                }}
            />
        </picture>
      </div>

      {/* ── Dark overlay — keeps content readable ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
        //   background: `rgba(9, 13, 12, ${opacity})`,
        //   // Subtle vignette — darker edges, slightly lighter center
        //   backgroundImage: `
        //     radial-gradient(ellipse at center, rgba(9,13,12,${opacity - 0.08}) 0%, rgba(9,13,12,${opacity}) 100%)
        //   `,
          background: 'radial-gradient(rgba(9, 13, 12, 0.50) 0%, rgba(9, 13, 12, 0.35) 100%) rgba(9, 13, 12, 0.35)'
        }}
      />

      {/* ── Ad badge — bottom left, above nav ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 80,   // sits just above the bottom nav
          left: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.6s ease 0.3s',
          pointerEvents: ad.linkUrl ? 'auto' : 'none',
        }}
      >
        {/* Sponsored label */}
        <span style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'var(--font-body)',
        }}>
          Sponsored
        </span>

        {/* Brand name + tagline */}
        {ad.linkUrl ? (
          <a
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <AdBadgeContent ad={ad} />
          </a>
        ) : (
          <AdBadgeContent ad={ad} />
        )}
      </div>
    </>
  )
}

function AdBadgeContent({ ad }: { ad: Ad }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-md)',
      maxWidth: '180px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-display)',
        lineHeight: 1.2,
      }}>
        {ad.brand}
      </span>
      {ad.tagline && (
        <span style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.3,
        }}>
          {ad.tagline}
        </span>
      )}
    </div>
  )
}