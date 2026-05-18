import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "../utils/api";

const PhotographerLimitsContext = createContext(null);

export const PhotographerLimitsProvider = ({ children }) => {
  const [maxQuantities, setMaxQuantities] = useState({
    Photographer: 0,
    Videographer: 0,
    Magnet: 1,
  });

  useEffect(() => {
    const fetchCaps = async () => {
      try {
        const data = await apiGet("/getPhotographerLimits");
        if (data.success && data.caps) {
          setMaxQuantities({
            Photographer: data.caps.maxStills || 0,
            Videographer: data.caps.maxVideo || 0,
            Magnet: 1,
          });
        }
      } catch (e) {
        console.error("Error fetching photographer caps:", e);
      }
    };
    fetchCaps();
  }, []);

  return (
    <PhotographerLimitsContext.Provider value={maxQuantities}>
      {children}
    </PhotographerLimitsContext.Provider>
  );
};

export const usePhotographerLimits = () =>
  useContext(PhotographerLimitsContext);
