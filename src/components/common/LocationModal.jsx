import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Search, MapPin, LocateFixed, Home, Briefcase, Building, ChevronRight, Check } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';
import GoogleMapComponent from './GoogleMapComponent';

const fallbackSavedAddresses = [
  {
    id: 'saved-1',
    title: 'HOME',
    name: 'Home',
    line1: '4/2, Near Ande Silks, Lakshmipuram, Ashok Nagar',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522007',
    phone: '9876543210',
  },
  {
    id: 'saved-2',
    title: 'WORK',
    name: 'Office',
    line1: 'IT Park, Phase 2, Ring Road',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522002',
    phone: '9876543210',
  },
];

const LocationModal = ({ isOpen, onClose, onSaveAddress, savedAddresses = [], initialStep = 'list' }) => {
  const [step, setStep] = useState('list');
  const [searchQuery, setSearchQuery] = useState('Ashok Nagar, Guntur');
  const [mapLocation, setMapLocation] = useState({
    lat: 16.3067,
    lng: 80.4365,
    area: 'Ashok Nagar',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    pincode: '522007',
    formattedAddress: '4/2, near Ande Silks, Lakshmipuram, Ashok Nagar, Guntur, Andhra Pradesh 522007, India',
  });
  const [saveAs, setSaveAs] = useState('HOME');
  const [addressDetails, setAddressDetails] = useState({
    houseNumber: '',
    building: '',
    landmark: '',
    contactName: 'Customer',
    phone: '',
  });

  const mapRef = useRef(null);

  const addressCards = useMemo(() => {
    return savedAddresses && savedAddresses.length > 0 ? savedAddresses : fallbackSavedAddresses;
  }, [savedAddresses]);

  const selectedAddress = useMemo(() => {
    const area = mapLocation.area || searchQuery.split(',')[0]?.trim() || 'Ashok Nagar';
    const baseLine = addressDetails.houseNumber
      ? `${addressDetails.houseNumber}${addressDetails.building ? `, ${addressDetails.building}` : ''}`
      : area;

    return {
      title: saveAs,
      name: addressDetails.contactName || 'Delivery Address',
      line1: `${baseLine}${addressDetails.landmark ? `, Near ${addressDetails.landmark}` : `, ${area}`}`,
      houseNumber: addressDetails.houseNumber,
      building: addressDetails.building,
      landmark: addressDetails.landmark,
      contactName: addressDetails.contactName,
      city: mapLocation.city || 'Guntur',
      state: mapLocation.state || 'Andhra Pradesh',
      pincode: mapLocation.pincode || '522007',
      latitude: mapLocation.lat,
      longitude: mapLocation.lng,
      phone: addressDetails.phone || '9876543210',
    };
  }, [addressDetails, mapLocation, saveAs, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [initialStep, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(initialStep);
    onClose();
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('map');
      return;
    }

    if (step === 'map' && addressCards.length > 0) {
      setStep('list');
      return;
    }

    handleClose();
  };

  const handleSavedAddressPick = async (address) => {
    if (onSaveAddress) {
      await onSaveAddress(address);
    }
    handleClose();
  };

  const handleSaveAddress = async () => {
    if (!addressDetails.houseNumber.trim()) {
      toast.error('Please enter house number / flat details');
      return;
    }

    if (!addressDetails.phone.trim() || addressDetails.phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (onSaveAddress) {
      await onSaveAddress(selectedAddress);
    }
    handleClose();
  };

  const handleLocationChange = (locationData) => {
    setMapLocation(locationData);
    if (locationData?.formattedAddress) {
      setSearchQuery(locationData.formattedAddress);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (mapRef.current && searchQuery.trim()) {
      mapRef.current.searchLocation(searchQuery);
    }
  };

  const handleLocateMe = () => {
    if (mapRef.current) {
      mapRef.current.locateUser();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[24px] w-full max-w-[430px] h-[92vh] max-h-[720px] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans">
        
        <div className="flex items-center gap-3 px-4 py-3 bg-white z-20 shrink-0 border-b border-slate-100">
          <button 
            type="button"
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h2 className="text-[16px] font-black text-slate-800 tracking-tight">
            {step === 'list' ? 'Select Delivery Address' : step === 'map' ? 'Choose your delivery address' : 'Confirm Address Details'}
          </h2>
        </div>

        {step === 'list' ? (
          <div className="flex-1 overflow-y-auto bg-[#f8f9fa] p-4 space-y-4">
            <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-100">
              <form onSubmit={handleSearchSubmit} className="bg-[#f4f5f6] rounded-xl flex items-center px-3.5 py-2.5 mb-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search for area, street, name..."
                  className="w-full bg-transparent border-none outline-none ml-2.5 text-xs font-semibold text-slate-700 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </form>

              <button 
                type="button"
                onClick={() => setStep('map')} 
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <LocateFixed className="w-5 h-5 text-[#0070a6] shrink-0" />
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">Use Current Location</h3>
                    <p className="text-[11px] font-medium text-slate-400">Using GPS location for delivery</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button 
                type="button"
                onClick={() => setStep('map')} 
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-lg text-left"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#0070a6] shrink-0" />
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800">Pin location on Map</h3>
                    <p className="text-[11px] font-medium text-slate-400">Set precise location on live map</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Saved Addresses</h3>
              <span className="text-[11px] font-bold text-slate-400">{addressCards.length} addresses</span>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-100 divide-y divide-slate-100">
              {addressCards.map((address, index) => (
                <div
                  key={address.id || index}
                  className="flex items-start justify-between p-3.5 cursor-pointer hover:bg-sky-50/60 transition-colors group"
                  onClick={() => handleSavedAddressPick(address)}
                >
                  <div className="flex gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl border border-sky-100 flex items-center justify-center shrink-0 bg-sky-50 text-[#0070a6] group-hover:bg-[#0070a6] group-hover:text-white transition-colors">
                      {String(address.title || '').toUpperCase() === 'WORK' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-xs font-black text-slate-800 truncate">{address.name || address.title || 'Saved Address'}</h3>
                        <span className="text-[9px] font-black bg-sky-100 text-[#0070a6] px-1.5 py-0.5 rounded uppercase">{address.title || 'HOME'}</span>
                      </div>
                      <p className="text-[11.5px] font-semibold text-slate-500 leading-relaxed truncate">
                        {address.line1}, {address.city}, {address.state} {address.pincode}
                      </p>
                      <p className="text-[10px] font-black text-slate-700 mt-0.5">Ph: {address.phone || '9876543210'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2 group-hover:text-[#0070a6] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        ) : step === 'map' ? (
          <div className="flex-1 relative bg-slate-100 overflow-hidden flex flex-col">
            <div className="absolute inset-0 z-0">
              <GoogleMapComponent 
                ref={mapRef} 
                onLocationChange={handleLocationChange} 
              />
            </div>
            <div className="absolute top-3 left-3 right-3 z-20">
              <form onSubmit={handleSearchSubmit} className="h-11 bg-white/95 backdrop-blur-xs rounded-full border border-slate-200 px-4 flex items-center gap-2.5 shadow-md">
                <Search className="w-4 h-4 text-slate-400 shrink-0 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for area, street, name..."
                  className="w-full bg-transparent border-none outline-none text-[13.5px] font-semibold text-slate-800 placeholder-slate-400"
                />
              </form>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10 pointer-events-none flex flex-col items-center">
              <div className="relative flex flex-col items-center">
                <svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                  <path d="M19 0C8.50659 0 0 8.50659 0 19C0 33.25 19 48 19 48C19 48 38 33.25 38 19C38 8.50659 29.4934 0 19 0Z" fill="#EA4335"/>
                  <circle cx="19" cy="18" r="8" fill="white"/>
                  <circle cx="19" cy="18" r="4" fill="#1A73E8"/>
                </svg>
                <div className="w-4 h-1.5 bg-black/25 rounded-full blur-[1px] -mt-1"></div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLocateMe}
              className="absolute bottom-[185px] right-4 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#0070a6] transition-all active:scale-95"
              title="Locate me"
            >
              <LocateFixed className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-[0_-6px_25px_rgba(0,0,0,0.15)] z-30 flex flex-col p-4 gap-3.5 border-t border-slate-100">
              <div className="bg-[#eefcf4] rounded-xl px-3.5 py-2.5 flex items-center border border-emerald-200/70">
                <p className="text-[12px] font-extrabold text-[#058240] tracking-tight">Place the pin at exact delivery location</p>
              </div>
              <div className="flex items-start gap-3 px-1">
                <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
                  <MapPin className="w-4 h-4 text-[#0070a6] fill-[#0070a6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-slate-800 leading-tight mb-1 truncate">
                    {mapLocation.area || 'Ashok Nagar'}
                  </h3>
                  <p className="text-[11.5px] font-semibold text-slate-500 leading-snug line-clamp-2">
                    {mapLocation.formattedAddress || searchQuery || '4/2, near Ande Silks, Lakshmipuram, Ashok Nagar, Guntur, Andhra Pradesh 522007, India'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                className="w-full bg-[#0070a6] hover:bg-[#005f8d] active:scale-[0.99] text-white py-3.5 rounded-full font-black text-[15px] shadow-md transition-all tracking-wide"
                onClick={() => setStep('details')}
              >
                Add More Details
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-start border border-slate-200">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[#0070a6] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-slate-800">{mapLocation.area || 'Ashok Nagar'}</h3>
                    <p className="text-[11px] font-medium text-slate-500 leading-tight line-clamp-2 mt-0.5">
                      {mapLocation.formattedAddress || searchQuery}
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setStep('map')} 
                  className="text-[11px] font-extrabold text-[#0070a6] hover:underline shrink-0 ml-2"
                >
                  Change Map
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">House / Flat No.*</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 102, Door No. 4-12"
                    value={addressDetails.houseNumber}
                    onChange={(event) => setAddressDetails((prev) => ({ ...prev, houseNumber: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070a6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Building / Apartment Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Sai Residency"
                    value={addressDetails.building}
                    onChange={(event) => setAddressDetails((prev) => ({ ...prev, building: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070a6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Nearby Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Beside Water Tank, Near Park"
                    value={addressDetails.landmark}
                    onChange={(event) => setAddressDetails((prev) => ({ ...prev, landmark: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070a6]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-black text-slate-800">Receiver Details</h4>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addressDetails.contactName}
                    onChange={(event) => setAddressDetails((prev) => ({ ...prev, contactName: event.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070a6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 mb-1">Mobile Phone Number*</label>
                  <div className="flex gap-2">
                    <span className="w-14 border border-slate-300 rounded-xl px-2 py-2.5 text-xs bg-slate-50 text-slate-600 font-extrabold text-center shrink-0">
                      +91
                    </span>
                    <input
                      type="text"
                      placeholder="10-digit mobile number"
                      value={addressDetails.phone}
                      onChange={(event) => setAddressDetails((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0070a6]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800 mb-2">Save Address As</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSaveAs('HOME')}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-extrabold text-xs transition-all ${
                      saveAs === 'HOME'
                        ? 'border-2 border-[#0070a6] text-[#0070a6] bg-sky-50'
                        : 'border border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" /> Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveAs('WORK')}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-extrabold text-xs transition-all ${
                      saveAs === 'WORK'
                        ? 'border-2 border-[#0070a6] text-[#0070a6] bg-sky-50'
                        : 'border border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Work
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveAs('OTHER')}
                    className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-extrabold text-xs transition-all ${
                      saveAs === 'OTHER'
                        ? 'border-2 border-[#0070a6] text-[#0070a6] bg-sky-50'
                        : 'border border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-slate-500" /> Other
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 shrink-0">
              <Button 
                variant="primary" 
                className="w-full bg-[#0070a6] hover:bg-[#005f8d] text-white py-3.5 rounded-xl font-extrabold text-xs sm:text-sm shadow-md transition-all"
                onClick={handleSaveAddress}
              >
                Save Address & Select
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
