import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomer } from '../context/CustomerContext';
import '../styles/address.css';

const initialForm = {
  fullName: '',
  mobile: '',
  houseNo: '',
  building: '',
  street: '',
  landmark: '',
  area: '',
  city: '',
  state: '',
  pincode: '',
  addressType: 'HOME',
  isDefault: true,
};

const AddAddressDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAddress, setSelectedAddressId } = useCustomer();
  const selectedLocation = location.state?.selectedLocation;
  const returnTo = location.state?.returnTo || '/checkout';

  const [form, setForm] = useState({
    ...initialForm,
    area: selectedLocation?.area || '',
    city: selectedLocation?.city || '',
    state: selectedLocation?.state || '',
    pincode: selectedLocation?.pincode || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!selectedLocation) {
    navigate('/choose-address', { replace: true, state: { returnTo } });
    return null;
  }

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const requiredFields = ['fullName', 'mobile', 'houseNo', 'street', 'area', 'city', 'state', 'pincode'];
    const missing = requiredFields.find((field) => !String(form[field] || '').trim());

    if (missing) {
      toast.error('Please fill all required fields');
      return false;
    }

    if (!/^\d{10}$/.test(form.mobile.trim())) {
      toast.error('Enter a valid 10-digit mobile number');
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error('Enter a valid 6-digit PIN Code');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const addressPayload = {
      id: `addr-${Date.now()}`,
      title: form.addressType,
      name: form.fullName.trim(),
      contactName: form.fullName.trim(),
      line1: `${form.houseNo.trim()}${form.building.trim() ? `, ${form.building.trim()}` : ''}, ${form.street.trim()}`,
      houseNumber: form.houseNo.trim(),
      building: form.building.trim(),
      street: form.street.trim(),
      landmark: form.landmark.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      phone: form.mobile.trim(),
      isDefault: Boolean(form.isDefault),
      latitude: selectedLocation?.latitude,
      longitude: selectedLocation?.longitude,
    };

    setIsSaving(true);
    try {
      const savedAddress = await addAddress(addressPayload);
      if (savedAddress?.id) {
        setSelectedAddressId(savedAddress.id);
      }
      navigate(returnTo, {
        replace: true,
        state: {
          newlyAddedAddress: savedAddress || addressPayload,
        },
      });
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to save address';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="address-shell">
      <div className="address-header">
        <button type="button" className="address-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="address-header-title">Add Address Details</h1>
      </div>

      <div className="details-page">
        <div className="details-card">
          <div className="details-grid">
            <div className="full">
              <label className="details-label" htmlFor="fullName">Full Name*</label>
              <input id="fullName" className="details-input" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="mobile">Mobile Number*</label>
              <input
                id="mobile"
                className="details-input"
                value={form.mobile}
                onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>

            <div>
              <label className="details-label" htmlFor="houseNo">House / Flat Number*</label>
              <input id="houseNo" className="details-input" value={form.houseNo} onChange={(e) => setField('houseNo', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="building">Apartment / Building</label>
              <input id="building" className="details-input" value={form.building} onChange={(e) => setField('building', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="street">Street*</label>
              <input id="street" className="details-input" value={form.street} onChange={(e) => setField('street', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="landmark">Landmark</label>
              <input id="landmark" className="details-input" value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="area">Area*</label>
              <input id="area" className="details-input" value={form.area} onChange={(e) => setField('area', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="city">City*</label>
              <input id="city" className="details-input" value={form.city} onChange={(e) => setField('city', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="state">State*</label>
              <input id="state" className="details-input" value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </div>

            <div>
              <label className="details-label" htmlFor="pincode">PIN Code*</label>
              <input
                id="pincode"
                className="details-input"
                value={form.pincode}
                onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>

            <div className="full">
              <label className="details-label">Address Type</label>
              <div className="address-type-wrap">
                {['HOME', 'WORK', 'OTHER'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`address-type-btn ${form.addressType === type ? 'active' : ''}`}
                    onClick={() => setField('addressType', type)}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="full">
              <label className="default-check" htmlFor="isDefault">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setField('isDefault', e.target.checked)}
                />
                Set as default address
              </label>
            </div>

            <div className="full">
              <button type="button" className="address-primary-btn" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressDetails;
