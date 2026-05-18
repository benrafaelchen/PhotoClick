/**
 * Google Maps is not used for address/location fields in PhotoClick.
 * This module is intentionally empty to avoid loading the Maps script.
 */

export function resetGoogleMapsLoad() {}

const loadGoogleMaps = () => Promise.reject(new Error("Google Maps is disabled"));

export default loadGoogleMaps;
