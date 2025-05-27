import * as Location from "expo-location";

export const obtenerUbicacion = async (): Promise<string> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permiso de ubicación denegado");
  }

  const ubicacion = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = ubicacion.coords;

  return `${latitude};${longitude}`; // entrega un string con latitud y longitud separadas por punto y coma
};
  
