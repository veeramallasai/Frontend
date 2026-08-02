import React, { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const GUNTUR_DEFAULT = {
  lat: 16.3067,
  lng: 80.4365,
  area: 'Ashok Nagar',
  city: 'Guntur',
  state: 'Andhra Pradesh',
  pincode: '522007',
  formattedAddress: '4/2, near Ande Silks, Lakshmipuram, Ashok Nagar, Guntur, Andhra Pradesh 522007, India',
};

const LIBRARIES = ['places'];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  keyboardShortcuts: false,
};

function isConfiguredApiKey(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return false;
  if (normalized.includes('YOUR_GOOGLE_MAPS_API_KEY') || normalized.includes('PASTE_GOOGLE_MAPS_API_KEY')) {
    return false;
  }
  return normalized.startsWith('AIza') && normalized.length > 20;
}

function parseAddressComponents(result) {
  const components = result?.address_components || [];
  const readComponent = (type) => {
    const part = components.find((item) => item.types?.includes(type));
    return part?.long_name || '';
  };

  const area = readComponent('sublocality_level_1') || 
               readComponent('sublocality') || 
               readComponent('neighborhood') || 
               readComponent('locality') || 
               'Ashok Nagar';

  const city = readComponent('locality') || 
               readComponent('administrative_area_level_2') || 
               'Guntur';

  const state = readComponent('administrative_area_level_1') || 'Andhra Pradesh';
  const pincode = readComponent('postal_code') || '522007';

  return {
    area,
    city,
    state,
    pincode,
    formattedAddress: result?.formatted_address || `${area}, ${city}, ${state} ${pincode}, India`,
  };
}

const GoogleMapComponent = forwardRef(({ onLocationChange, onLocatingStateChange }, ref) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = isConfiguredApiKey(apiKey);

  const [center, setCenter] = useState({ lat: GUNTUR_DEFAULT.lat, lng: GUNTUR_DEFAULT.lng });
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef(null);
  const lastCenterRef = useRef({ lat: GUNTUR_DEFAULT.lat, lng: GUNTUR_DEFAULT.lng });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'farm2home-google-maps-script',
    googleMapsApiKey: hasValidApiKey ? apiKey.trim() : '',
    libraries: LIBRARIES,
  });

  const notifyLocating = useCallback((state) => {
    setIsLocating(state);
    if (onLocatingStateChange) onLocatingStateChange(state);
  }, [onLocatingStateChange]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (window.google?.maps?.Geocoder) {
      notifyLocating(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        notifyLocating(false);
        if (status === 'OK' && results?.[0]) {
          const parsed = parseAddressComponents(results[0]);
          const locationData = { lat, lng, ...parsed };
          if (onLocationChange) onLocationChange(locationData);
        } else {
          // Fallback location formatting
          const fallbackData = {
            ...GUNTUR_DEFAULT,
            lat,
            lng,
            formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}, Guntur, Andhra Pradesh`,
          };
          if (onLocationChange) onLocationChange(fallbackData);
        }
      });
    } else {
      // Free Nominatim OSM fallback for development without Google API key
      notifyLocating(true);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          notifyLocating(false);
          if (data && data.address) {
            const addr = data.address;
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || addr.city || 'Ashok Nagar';
            const city = addr.city || addr.town || addr.county || 'Guntur';
            const state = addr.state || 'Andhra Pradesh';
            const pincode = addr.postcode || '522007';
            const formattedAddress = data.display_name || `${area}, ${city}, ${state} ${pincode}, India`;
            if (onLocationChange) {
              onLocationChange({ lat, lng, area, city, state, pincode, formattedAddress });
            }
          } else {
            if (onLocationChange) onLocationChange({ ...GUNTUR_DEFAULT, lat, lng });
          }
        })
        .catch(() => {
          notifyLocating(false);
          if (onLocationChange) onLocationChange({ ...GUNTUR_DEFAULT, lat, lng });
        });
    }
  }, [onLocationChange, notifyLocating]);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setCenter({ lat: GUNTUR_DEFAULT.lat, lng: GUNTUR_DEFAULT.lng });
      reverseGeocode(GUNTUR_DEFAULT.lat, GUNTUR_DEFAULT.lng);
      return;
    }

    notifyLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLoc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCenter(nextLoc);
        if (mapRef.current) {
          mapRef.current.panTo(nextLoc);
          mapRef.current.setZoom(16);
        }
        reverseGeocode(nextLoc.lat, nextLoc.lng);
      },
      () => {
        notifyLocating(false);
        setCenter({ lat: GUNTUR_DEFAULT.lat, lng: GUNTUR_DEFAULT.lng });
        reverseGeocode(GUNTUR_DEFAULT.lat, GUNTUR_DEFAULT.lng);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [reverseGeocode, notifyLocating]);

  const searchLocation = useCallback((query) => {
    if (!query || !query.trim()) return;
    const term = query.trim();

    if (window.google?.maps?.Geocoder) {
      notifyLocating(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: term }, (results, status) => {
        notifyLocating(false);
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          const nextLoc = { lat: loc.lat(), lng: loc.lng() };
          setCenter(nextLoc);
          if (mapRef.current) {
            mapRef.current.panTo(nextLoc);
            mapRef.current.setZoom(16);
          }
          const parsed = parseAddressComponents(results[0]);
          if (onLocationChange) onLocationChange({ ...nextLoc, ...parsed });
        }
      });
    } else {
      notifyLocating(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          notifyLocating(false);
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const nextLoc = { lat, lng };
            setCenter(nextLoc);
            if (onLocationChange) {
              onLocationChange({
                lat,
                lng,
                area: term.split(',')[0] || 'Ashok Nagar',
                city: 'Guntur',
                state: 'Andhra Pradesh',
                pincode: '522007',
                formattedAddress: data[0].display_name,
              });
            }
          }
        })
        .catch(() => notifyLocating(false));
    }
  }, [onLocationChange, notifyLocating]);

  useImperativeHandle(ref, () => ({
    locateUser,
    searchLocation,
  }));

  const handleIdle = useCallback(() => {
    if (!mapRef.current) return;
    const currentCenter = mapRef.current.getCenter();
    if (!currentCenter) return;
    const lat = currentCenter.lat();
    const lng = currentCenter.lng();

    if (Math.abs(lastCenterRef.current.lat - lat) > 0.0001 || Math.abs(lastCenterRef.current.lng - lng) > 0.0001) {
      lastCenterRef.current = { lat, lng };
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Initial geocode
    reverseGeocode(GUNTUR_DEFAULT.lat, GUNTUR_DEFAULT.lng);
  }, [reverseGeocode]);

  if (hasValidApiKey && isLoaded && !loadError) {
    return (
      <div className="relative w-full h-full">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={16}
          options={MAP_OPTIONS}
          onLoad={handleMapLoad}
          onIdle={handleIdle}
        />
        {isLocating && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-white/90 shadow-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070a6]" />
              Fetching address...
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback map view if no Google Maps API Key is active
  const embedUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}&z=16&output=embed`;

  return (
    <div className="relative w-full h-full bg-slate-100">
      <iframe
        title="Delivery Location Map"
        src={embedUrl}
        className="w-full h-full border-0"
        loading="lazy"
      />
      {isLocating && (
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 shadow-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070a6]" />
            Updating location...
          </div>
        </div>
      )}
    </div>
  );
});

GoogleMapComponent.displayName = 'GoogleMapComponent';

export default GoogleMapComponent;

