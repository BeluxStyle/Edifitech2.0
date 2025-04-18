import React, { useState, useEffect } from "react";
import { getCity } from "@edifitech-graphql/index";
import { Typography } from "@mui/material";


const CityNameComponent = ({ postalCode }: { postalCode: string }) => {
    const [cityName, setCityName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCityName = async () => {
        try {
          setIsLoading(true);
          setError(null);
          if (postalCode == "41701" || postalCode == "41702") setCityName('Dos Hermanas');
          if (postalCode == "41510") setCityName('Mairena del Alcor');
          else {
            const data = await getCity(postalCode); // Asume que devuelve los lugares
            setCityName(data);
          }
        } catch (err) {
          setError('Desconocida');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCityName();
    }, [postalCode]);

    if (isLoading) {
      return "Cargando..."
    }

    if (error) {
      return error
    }

    return cityName || 'Ciudad desconocida'
  };

  export default CityNameComponent