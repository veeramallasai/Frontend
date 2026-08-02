import { decode } from '@googlemaps/polyline-codec';

export const decodePolylinePath = (encodedPolyline) => {
  if (!encodedPolyline || typeof encodedPolyline !== 'string') {
    return [];
  }

  try {
    return decode(encodedPolyline, 5).map(([lat, lng]) => ({ lat, lng }));
  } catch {
    return [];
  }
};
