import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getProfileApi } from '../api/provider.api';

const ProviderProfileContext = createContext(null);

export const ProviderProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return getProfileApi()
      .then(({ data }) => setProfile(data.data.profile))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ProviderProfileContext.Provider value={{ profile, setProfile, loading, refresh }}>
      {children}
    </ProviderProfileContext.Provider>
  );
};

export const useProviderProfile = () => useContext(ProviderProfileContext);
