import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface LocationData {
  lat: number;
  lng: number;
}

export const useLocation = (watch: boolean = false) => {
  const [coords, setCoords] = useState<LocationData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [granted, setGranted] = useState<boolean>(false);

  useEffect(() => {
    let watchId: number | null = null;

    const getLocation = async () => {
      setLoading(true);
      try {
        let hasPermission = false;

        if (Platform.OS === 'android') {
          const status = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          hasPermission = status === RESULTS.GRANTED;
        } else if (Platform.OS === 'ios') {
          const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          hasPermission = status === RESULTS.GRANTED;
        }

        setGranted(hasPermission);

        if (!hasPermission) {
          setError('Location permission denied. Please enable it in settings.');
          setLoading(false);
          return;
        }

        if (watch) {
          watchId = Geolocation.watchPosition(
            (pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setError('');
              setLoading(false);
            },
            (err) => {
              setError(err.message || 'Failed to get location');
              setLoading(false);
            },
            { enableHighAccuracy: true, distanceFilter: 50, interval: 30000, fastestInterval: 10000 }
          );
        } else {
          Geolocation.getCurrentPosition(
            (pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setError('');
              setLoading(false);
            },
            (err) => {
              setError(err.message || 'Failed to get location');
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching location.');
        setLoading(false);
      }
    };

    getLocation();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [watch]);

  return { coords, error, loading, granted };
};
