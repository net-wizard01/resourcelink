'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components so Next.js doesn't break during server rendering
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function MapView({ listings, userLat, userLon }: { listings: any[], userLat: number, userLon: number }) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    // Fix Leaflet marker icons broken by Next.js
    import('leaflet').then((leaflet) => {
      const DefaultIcon = leaflet.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      leaflet.Marker.prototype.options.icon = DefaultIcon;
      setL(leaflet);
    });
  }, []);

  if (!L || !userLat || !userLon) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>;

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative">
      <MapContainer center={[userLat, userLon]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User's own marker */}
        <Marker position={[userLat, userLon]}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Neighbors' listings markers */}
        {listings.map((l, i) => (
          <Marker key={i} position={[Number(l.latitude), Number(l.longitude)]}>
            <Popup>
              <strong>{l.title}</strong><br/>
              {l.category} by {l.full_name}<br/>
              {Math.round(l.distance_meters)}m away
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
