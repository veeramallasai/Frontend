const normalizeStatus = (value) => (value || '').toString().trim().toLowerCase();

export const shouldExcludeCustomerFromList = (customer) => {
  const status = normalizeStatus(customer?.status);
  return status === 'blocked' || status === 'suspended';
};

export const shouldExcludeFarmerFromList = (farmer) => {
  const accountStatus = normalizeStatus(farmer?.accountStatus);
  const verificationStatus = normalizeStatus(farmer?.verificationStatus);

  return (
    accountStatus === 'blocked' ||
    verificationStatus === 'blocked' ||
    verificationStatus === 'suspended' ||
    verificationStatus === 'rejected'
  );
};