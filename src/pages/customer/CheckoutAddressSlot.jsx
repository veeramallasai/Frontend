import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import LocationModal from '../../components/common/LocationModal';

const CheckoutAddressSlot = () => {
  const {
    addresses = [],
    setSelectedAddressId,
    addAddress,
  } = useCustomer();

  const navigate = useNavigate();
  const location = useLocation();

  const handleSaveAddress = async (addressPayload) => {
    const addedAddress = await addAddress(addressPayload);
    if (addedAddress?.id) {
      setSelectedAddressId(addedAddress.id);
      navigate('/checkout', {
        state: {
          ...(location.state || {}),
        },
      });
    }
  };

  const handleClose = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans">
      <LocationModal
        isOpen={true}
        onClose={handleClose}
        onSaveAddress={handleSaveAddress}
        savedAddresses={addresses}
        initialStep="list"
      />
    </div>
  );
};

export default CheckoutAddressSlot;


