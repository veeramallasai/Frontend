import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Autocomplete, GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { ArrowLeft, LocateFixed, MapPin, Search } from 'lucide-react';
import '../styles/address.css';

const libraries = ['places'];
const defaultCenter = { lat: 16.3067, lng: 80.4365 };

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const parseAddress = (result, lat, lng) => {
  const components = result?.address_components || [];
  const read = (type) => components.find((item) => item.types?.includes(type))?.long_name || '';

  return {
    latitude: lat,
    longitude: lng,
    area: read('sublocality') || read('neighborhood') || read('locality') || 'Selected area',
    city: read('locality') || read('administrative_area_level_2') || 'Guntur',
    state: read('administrative_area_level_1') || 'Andhra Pradesh',
    pincode: read('postal_code') || '',
    formattedAddress: result?.formatted_address || `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
  };
};

const ChooseAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchBoxRef = useRef(null);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const debounceRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [center, setCenter] = useState(defaultCenter);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    area: 'Fetching area...',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '',
    formattedAddress: 'Getting current location...',
  });
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'choose-address-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google?.maps) return;

    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    setReverseLoading(true);
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      setReverseLoading(false);

      if (status === 'OK' && results?.[0]) {
        const parsed = parseAddress(results[0], lat, lng);
        setSelectedLocation(parsed);
        setSearchValue(parsed.formattedAddress);
        setErrorMessage('');
        return;
      }

      setSelectedLocation((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        formattedAddress: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
      }));
      setErrorMessage('Unable to fetch full address for this location. You can still continue.');
    });
  }, []);

  const moveToLocation = useCallback((lat, lng) => {
    const nextCenter = { lat, lng };
    setCenter(nextCenter);
    mapRef.current?.panTo(nextCenter);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported in this browser.');
      setLoadingLocation(false);
      reverseGeocode(defaultCenter.lat, defaultCenter.lng);
      return;
    }

    setLoadingLocation(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLoadingLocation(false);
        moveToLocation(lat, lng);
      },
      (error) => {
        setLoadingLocation(false);

        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission denied. Using default location.');
        } else if (error.code === error.TIMEOUT) {
          setErrorMessage('Location request timed out. Using default location.');
        } else {
          setErrorMessage('Unable to access your location. Using default location.');
        }

        reverseGeocode(defaultCenter.lat, defaultCenter.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [moveToLocation, reverseGeocode]);

  useEffect(() => {
    if (isLoaded) {
      requestCurrentLocation();
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isLoaded, requestCurrentLocation]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapIdle = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const mapCenter = mapRef.current.getCenter();
    if (!mapCenter) return;

    const lat = mapCenter.lat();
    const lng = mapCenter.lng();

    setCenter({ lat, lng });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 350);
  };

  const handleSearchLoad = (autocomplete) => {
    searchBoxRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    const place = searchBoxRef.current?.getPlace?.();
    const locationData = place?.geometry?.location;

    if (!locationData) {
      setErrorMessage('No location found for this search.');
      return;
    }

    moveToLocation(locationData.lat(), locationData.lng());
  };

  const handleAddMoreDetails = () => {
    navigate('/add-address-details', {
      state: {
        selectedLocation,
        returnTo: location.state?.returnTo || '/checkout',
      },
    });
  };

  return (
    <div className="address-shell">
      <div className="address-header">
        <button
          type="button"
          className="address-back-btn"
          onClick={() => navigate(location.state?.returnTo || '/checkout')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="address-header-title">Choose your delivery address</h1>
      </div>

      <div className="choose-address-map-wrap">
        {loadError && <div className="address-error">Google Maps failed to load. Please check API key.</div>}
        {loadingLocation && <div className="address-loading">Getting your current location...</div>}
        {errorMessage && <div className="address-error">{errorMessage}</div>}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={16}
            onLoad={handleMapLoad}
            onIdle={handleMapIdle}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
              gestureHandling: 'greedy',
            }}
            className="choose-address-map"
          />
        )}

        <div className="choose-search-wrap">
          {isLoaded ? (
            <Autocomplete onLoad={handleSearchLoad} onPlaceChanged={handlePlaceChanged}>
              <div className="choose-search">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search for area, street, name..."
                />
              </div>
            </Autocomplete>
          ) : (
            <div className="choose-search">
              <Search size={18} color="#94a3b8" />
              <input type="text" disabled placeholder="Search for area, street, name..." />
            </div>
          )}
        </div>

        <button type="button" className="choose-gps-btn" onClick={requestCurrentLocation}>
          <LocateFixed size={18} />
        </button>

        <div className="choose-center-pin">
          <MapPin size={40} />
        </div>

        <div className="choose-bottom-card">
          <p className="choose-bottom-tip">Place the pin at exact delivery location</p>
          <p className="choose-address-area">{selectedLocation.area || 'Selected area'}</p>
          <p className="choose-address-full">{reverseLoading ? 'Updating address...' : selectedLocation.formattedAddress}</p>
          <button
            type="button"
            className="address-primary-btn"
            onClick={handleAddMoreDetails}
            disabled={reverseLoading}
          >
            Add More Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseAddress;
