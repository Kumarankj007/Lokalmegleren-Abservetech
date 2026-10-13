'use client';

import React, { useEffect, useState } from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import GetPropertyDetail from '../api/get/propertyDetail';
import { MapSkeleton } from './skeletons';

interface PropertyDetail {
  eiendom: {
    adresse: string;
    postnummer: string;
    poststed: string;
  };
}

export default function Googlemap() {
  const propertyDetail = GetPropertyDetail(
    (s: any) => s.propertyDetail,
  ) as PropertyDetail | undefined;
  const propertyDetailLoad = GetPropertyDetail(
    (s: any) => s.propertyDetailLoad,
  ) as boolean;
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

  const eiendom = propertyDetail?.eiendom;
  // Geocode keyed on the address itself, so unrelated store updates don't
  // trigger another Nominatim round trip.
  const addressKey = eiendom?.adresse
    ? `${eiendom.adresse}|${eiendom.postnummer}|${eiendom.poststed}`
    : "";

  useEffect(() => {
    let cancelled = false;

    async function fetchCoordinates() {
      // Ensure we actually have address info before calling the API
      if (!addressKey) return;

      const [adresse, postnummer, poststed] = addressKey.split("|");

      const addresses = adresse.includes(' og ')
        ? adresse.split(' og ').map((part) => part.trim())
        : [adresse];

      const query = `${addresses[0]}, ${postnummer} ${poststed}, Norway`;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        );
        const data: Array<{ lat: string; lon: string }> = await response.json();

        if (data.length > 0 && !cancelled) {
          setCenter({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    }

    fetchCoordinates();
    return () => {
      cancelled = true;
    };
  }, [addressKey]);

  return !propertyDetailLoad && center ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '750px' }}
      center={center}
      zoom={17}
    >
      <MarkerF position={center} title="Property" />
    </GoogleMap>
  ) : (
    <MapSkeleton />
  );
}
