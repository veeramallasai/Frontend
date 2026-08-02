import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Loader2, LocateFixed, Search } from 'lucide-react';
import {
  GoogleMap,
  MarkerF,
  Polyline,
  StandaloneSearchBox,
  useJsApiLoader,
} from '@react-google-maps/api';
import { decodePolylinePath } from '../utils/polylineUtils';

const MAP_LIBRARIES = ['places'];

const MAP_STYLE = {
  width: '100%',
  height: '320px',
};

const DeliveryAddressMap = ({
  originLatitude,
  originLongitude,
  originAddress,
  routePolyline,
  onAddressSelected,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);

  const [destination, setDestination] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState('');

  const hasApiKey = useMemo(() => {
    const value = String(apiKey || '').trim();
    return value.length > 0 && !value.includes('PASTE_MY_BROWSER_API_KEY_HERE');
  }, [apiKey]);

  const origin = useMemo(() => {
    if (typeof originLatitude !== 'number' || typeof originLongitude !== 'number') {
      return null;
    }
    return { lat: originLatitude, lng: originLongitude };
  }, [originLatitude, originLongitude]);

  const mapCenter = destination || origin || { lat: 17.385044, lng: 78.486671 };

  const routePath = useMemo(() => decodePolylinePath(routePolyline), [routePolyline]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'farm2home-google-maps-script',
    googleMapsApiKey: hasApiKey ? apiKey : '',
    libraries: MAP_LIBRARIES,
  });

  const fitMapBounds = useCallback((nextDestination) => {
    if (!mapRef.current || !window.google?.maps || !origin || !nextDestination) {
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(origin);
    bounds.extend(nextDestination);
    mapRef.current.fitBounds(bounds, 80);
  }, [origin]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google?.maps) {
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        setMapError('Unable to resolve address for the selected location.');
        return;
      }

      const formattedAddress = results[0].formatted_address;
      setSelectedAddress(formattedAddress);
      setMapError('');
      onAddressSelected?.({
        deliveryAddress: formattedAddress,
        deliveryLatitude: lat,
        deliveryLongitude: lng,
      });
    });
  }, [onAddressSelected]);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleSearchBoxLoad = useCallback((ref) => {
    searchBoxRef.current = ref;
  }, []);

  const updateDestination = useCallback((lat, lng) => {
    const nextDestination = { lat, lng };
    setDestination(nextDestination);
    fitMapBounds(nextDestination);
    reverseGeocode(lat, lng);
  }, [fitMapBounds, reverseGeocode]);

  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces?.();
    const location = places?.[0]?.geometry?.location;

    if (!location) {
      setMapError('No location found for this search.');
      return;
    }

    updateDestination(location.lat(), location.lng());
  }, [updateDestination]);

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return;
    }

    updateDestination(lat, lng);
  }, [updateDestination]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported in this browser.');
      return;
    }

    setIsLocating(true);
    setMapError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        updateDestination(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setMapError('Location permission was denied. Please enable location and retry.');
          return;
        }
        setMapError('Unable to access current location right now.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [updateDestination]);

  if (!hasApiKey) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Google Maps API Key Not Found</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">Unable to load Google Maps</div>;
  }

  if (!isLoaded) {
    return (
      <div className="h-[320px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 text-sm font-semibold">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <StandaloneSearchBox onLoad={handleSearchBoxLoad} onPlacesChanged={handlePlacesChanged}>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search delivery address"
                className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none"
              />
            </div>
          </StandaloneSearchBox>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:text-[#0078ad] disabled:opacity-60"
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          Use Current Location
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200">
        <GoogleMap
          mapContainerStyle={MAP_STYLE}
          center={mapCenter}
          zoom={14}
          onLoad={handleMapLoad}
          onClick={handleMapClick}
          options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
        >
          {origin && <MarkerF position={origin} title={originAddress || 'Store location'} />}
          {destination && <MarkerF position={destination} title="Delivery location" />}
          {routePath.length > 0 && (
            <Polyline
              path={routePath}
              options={{ strokeColor: '#0078ad', strokeOpacity: 0.9, strokeWeight: 5 }}
            />
          )}
        </GoogleMap>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600 space-y-1">
        <p><span className="font-bold text-slate-700">Store:</span> {originAddress || 'Default test store location in Hyderabad'}</p>
        <p><span className="font-bold text-slate-700">Customer Address:</span> {selectedAddress || 'Select from map, search, or current location.'}</p>
        {destination && (
          <p><span className="font-bold text-slate-700">Coordinates:</span> {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}</p>
        )}
      </div>

      {mapError && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">{mapError}</div>}
    </div>
  );
};

export default DeliveryAddressMap;
