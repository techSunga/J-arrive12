"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Loader2 } from "lucide-react"

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const BRAZZAVILLE_CENTER: [number, number] = [-4.2661, 15.2832]

// Custom Leaflet Icons via SVG
const createCustomIcon = (svgString: string, size: [number, number], anchor: [number, number]) => {
  return L.divIcon({
    html: svgString,
    className: "custom-div-icon",
    iconSize: size,
    iconAnchor: anchor,
    popupAnchor: [0, -anchor[1]],
  })
}

const originIcon = createCustomIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="14" fill="#2563eb" stroke="white" stroke-width="3"/>
    <circle cx="18" cy="18" r="5" fill="white"/>
  </svg>
`, [36, 36], [18, 18])

const destIcon = createCustomIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 32 20 32S40 35 40 20C40 8.95 31.05 0 20 0z" fill="#f97316"/>
    <circle cx="20" cy="20" r="9" fill="white"/>
    <path d="M20 15l1.5 4.5H26l-3.8 2.8 1.5 4.5L20 24l-3.7 2.8 1.5-4.5L14 19.5h4.5z" fill="#f97316"/>
  </svg>
`, [40, 52], [20, 52])

const truckIcon = createCustomIcon(`
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="22" fill="#0f172a" stroke="#2563eb" stroke-width="2.5"/>
    <text x="24" y="30" text-anchor="middle" font-size="22">🛵</text>
  </svg>
`, [48, 48], [24, 24])


// Helper component to auto-fit the map bounds
function BoundsUpdater({ originCoords, destCoords }: { originCoords: [number, number] | null, destCoords: [number, number] | null }) {
  const map = useMap()
  
  useEffect(() => {
    if (originCoords && destCoords) {
      const bounds = L.latLngBounds([originCoords, destCoords])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (originCoords) {
      map.setView(originCoords, 14)
    } else if (destCoords) {
      map.setView(destCoords, 14)
    }
  }, [originCoords, destCoords, map])

  return null
}

type TrackingMapProps = {
  originAddress?: string
  destAddress?: string
  originLat?: number | null
  originLng?: number | null
  destLat?: number | null
  destLng?: number | null
  status?: string
}

export function TrackingMap({
  originAddress,
  destAddress,
  originLat,
  originLng,
  destLat,
  destLng,
  status,
}: TrackingMapProps) {
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(
    originLat && originLng ? [originLat, originLng] : null
  )
  const [destCoords, setDestCoords] = useState<[number, number] | null>(
    destLat && destLng ? [destLat, destLng] : null
  )
  const [routePath, setRoutePath] = useState<[number, number][]>([])
  const [geocoding, setGeocoding] = useState(false)

  // 1. Geocode addresses if missing coordinates (using OpenStreetMap Nominatim - Free)
  useEffect(() => {
    if (originLat && originLng && destLat && destLng) return
    let isCancelled = false

    const geocode = async (address: string): Promise<[number, number] | null> => {
      try {
        const query = encodeURIComponent(`${address}, Brazzaville, Congo`)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`)
        const data = await res.json()
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        }
      } catch (err) {
        console.error("Geocoding failed for", address, err)
      }
      return null
    }

    async function fetchCoords() {
      setGeocoding(true)
      const [o, d] = await Promise.all([
        originAddress && (!originLat || !originLng) ? geocode(originAddress) : Promise.resolve(originCoords),
        destAddress && (!destLat || !destLng) ? geocode(destAddress) : Promise.resolve(destCoords)
      ])
      
      if (!isCancelled) {
        if (o) setOriginCoords(o)
        if (d) setDestCoords(d)
        setGeocoding(false)
      }
    }

    fetchCoords()
    return () => { isCancelled = true }
  }, [originAddress, destAddress, originLat, originLng, destLat, destLng])

  // 2. Fetch the driving route (using OSRM - Free)
  useEffect(() => {
    if (!originCoords || !destCoords) return
    let isCancelled = false

    const fetchRoute = async () => {
      try {
        // OSRM expects: longitude,latitude
        const originStr = `${originCoords[1]},${originCoords[0]}`
        const destStr = `${destCoords[1]},${destCoords[0]}`
        const res = await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${originStr};${destStr}?overview=full&geometries=geojson`)
        const data = await res.json()

        if (!isCancelled && data.routes && data.routes.length > 0) {
          // Convert GeoJSON [lng, lat] back to Leaflet [lat, lng]
          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
          setRoutePath(coords)
        }
      } catch (error) {
        console.error("Routing failed", error)
      }
    }

    fetchRoute()
    return () => { isCancelled = true }
  }, [originCoords, destCoords])

  // 3. Compute the active truck position
  const truckPosition = (() => {
    if (routePath.length === 0) return null
    const statusProgress: Record<string, number> = {
      pending:   0,
      accepted:  0.05,
      picked_up: 0.5,
      delivered: 1,
    }
    const prog = statusProgress[status || "pending"] ?? 0
    const idx = Math.floor(prog * (routePath.length - 1))
    return routePath[idx]
  })()

  if (geocoding) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-[32px] gap-3">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          Géolocalisation gratuite...
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-slate-100 z-0">
      <MapContainer 
        center={originCoords || BRAZZAVILLE_CENTER} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <BoundsUpdater originCoords={originCoords} destCoords={destCoords} />

        {/* The Route Polyline */}
        {routePath.length > 0 && (
          <Polyline positions={routePath} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} />
        )}

        {/* Origin Marker */}
        {originCoords && (
          <Marker position={originCoords} icon={originIcon}>
            <Popup>
              <div style={{ fontFamily: "system-ui", maxWidth: 180 }}>
                <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Départ</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{originAddress || "Départ"}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destCoords && (
          <Marker position={destCoords} icon={destIcon}>
            <Popup>
              <div style={{ fontFamily: "system-ui", maxWidth: 180 }}>
                <p style={{ fontSize: 10, color: "#6b7280", fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Destination</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{destAddress || "Destination"}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Moving Truck */}
        {truckPosition && status !== "pending" && (
          <Marker position={truckPosition} icon={truckIcon} zIndexOffset={100} />
        )}
      </MapContainer>
    </div>
  )
}
