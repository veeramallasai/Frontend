import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDeliveryEstimate } from '../services/deliveryService';

const DeliveryEstimator = ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  preparationMinutes,
  onEstimateChange,
}) => {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestPayload = useMemo(() => {
    if (
      typeof originLatitude !== 'number'
      || typeof originLongitude !== 'number'
      || typeof destinationLatitude !== 'number'
      || typeof destinationLongitude !== 'number'
    ) {
      return null;
    }

    return {
      originLatitude,
      originLongitude,
      destinationLatitude,
      destinationLongitude,
      preparationMinutes,
    };
  }, [originLatitude, originLongitude, destinationLatitude, destinationLongitude, preparationMinutes]);

  const runEstimate = useCallback(async () => {
    if (!requestPayload) {
      setEstimate(null);
      onEstimateChange?.(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await getDeliveryEstimate(requestPayload);
      setEstimate(response);
      onEstimateChange?.(response);
    } catch (estimateError) {
      setEstimate(null);
      onEstimateChange?.(null);
      setError(estimateError.message || 'Unable to estimate delivery time.');
    } finally {
      setLoading(false);
    }
  }, [requestPayload, onEstimateChange]);

  useEffect(() => {
    if (!requestPayload) {
      return;
    }

    runEstimate();
  }, [requestPayload, runEstimate]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-800">Delivery Details</h3>
        <button
          type="button"
          onClick={runEstimate}
          disabled={!requestPayload || loading}
          className="px-4 py-2 rounded-lg bg-[#0078ad] text-white text-xs font-bold disabled:opacity-50"
        >
          Check Delivery Time
        </button>
      </div>

      {!requestPayload && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-600">
          Select a delivery address on the map to estimate delivery time.
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating delivery estimate...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
          <button
            type="button"
            onClick={runEstimate}
            className="ml-2 underline font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {estimate && !loading && (
        <div className="space-y-2 text-sm font-semibold text-slate-700">
          <p>Distance: {estimate.distanceKm} km</p>
          <p>Travel Time: {estimate.travelMinutes} minutes</p>
          <p>Preparation Time: {estimate.preparationMinutes} minutes</p>
          <p>Estimated Delivery: {estimate.estimatedDeliveryText}</p>
          <p>Expected Arrival: {estimate.formattedArrivalTime}</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryEstimator;
