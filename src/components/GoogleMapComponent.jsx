import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  GoogleMap,
  MarkerF,
  StandaloneSearchBox,
  useJsApiLoader,
} from '@react-google-maps/api';

// Google Maps default location requested for Farm to Home.
const DEFAULT_CENTER = {
  lat: 17.385044,
  lng: 78.486671,
};

// Map dimensions requested in requirements.
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '500px',
};

// Enable Places library for autocomplete/search support.
const MAP_LIBRARIES = ['places'];

function isConfiguredGoogleMapsKey(value) {
  const normalized = String(value || '').trim();

  if (!normalized) {
    return false;
  }

  // Treat placeholders as missing keys to avoid invalid script loads.
  if (normalized.includes('YOUR_GOOGLE_MAPS_API_KEY') || normalized.includes('PASTE_GOOGLE_MAPS_API_KEY')) {
    return false;
  }

  // Browser keys from Google Cloud generally start with AIza.
  return normalized.startsWith('AIza') && normalized.length > 20;
}

const GoogleMapComponent = () => {
  // Read API key from Vite environment variables.
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = isConfiguredGoogleMapsKey(apiKey);

  // Keep a stable reference to the search box instance.
  const searchBoxRef = useRef(null);

  // Keep a stable reference to the map instance for panning/zooming.
  const mapRef = useRef(null);

  // Track the map center state so the map can move after a search.
  const [center, setCenter] = useState(DEFAULT_CENTER);

  // Track marker position separately so the marker moves with search results.
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);

  // Load Google Maps script only when a key is available.
  const { isLoaded, loadError } = useJsApiLoader({
    // Match existing script id/options used elsewhere in the app to avoid loader conflicts.
    id: 'farm2home-google-maps-script',
    googleMapsApiKey: hasValidApiKey ? apiKey.trim() : '',
    libraries: MAP_LIBRARIES,
  });

  // Memoize map options to avoid unnecessary re-renders.
  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    }),
    []
  );

  // Store map instance after map has loaded.
  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Store search box instance after it has loaded.
  const handleSearchBoxLoad = useCallback((searchBox) => {
    searchBoxRef.current = searchBox;
  }, []);

  // Move map and marker to the selected place from autocomplete.
  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces?.();
    const firstPlace = places?.[0];
    const location = firstPlace?.geometry?.location;

    if (!location) {
      return;
    }

    const nextLocation = {
      lat: location.lat(),
      lng: location.lng(),
    };

    setCenter(nextLocation);
    setMarkerPosition(nextLocation);

    // Pan and zoom the map for better visibility of the searched place.
    if (mapRef.current) {
      mapRef.current.panTo(nextLocation);
      mapRef.current.setZoom(14);
    }
  }, []);

  // Show required message when key is missing.
  if (!hasValidApiKey) {
    return <div>Google Maps API Key Not Found</div>;
  }

  // Show required message when script fails to load.
  if (loadError) {
    return <div>Unable to load Google Maps</div>;
  }

  // Basic loading state while Google Maps script is downloading.
  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <div>
      {/* Places autocomplete search box for place lookup. */}
      <div style={{ marginBottom: '12px' }}>
        <StandaloneSearchBox
          onLoad={handleSearchBoxLoad}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Search for a place"
            style={{
              boxSizing: 'border-box',
              border: '1px solid #d1d5db',
              width: '100%',
              height: '42px',
              padding: '0 12px',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </StandaloneSearchBox>
      </div>

      {/* Main map container with requested dimensions and default zoom. */}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={14}
        onLoad={handleMapLoad}
        options={mapOptions}
      >
        {/* Marker pinned to the current center/selected location. */}
        <MarkerF position={markerPosition} />
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
