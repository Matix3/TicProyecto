import * as Network from "expo-network";

export const hayConexionInternet = async (): Promise<boolean> => {
  try {
    const estado = await Network.getNetworkStateAsync();
    return estado.isConnected && estado.isInternetReachable !== false; // isInternetReachable verifica si hay acceso a internet, is connected verifica si hay conexión a la red
    /* estados: estado.isInternetReachable !== false
    true: internet disponible.
    false: sin internet, aunque haya red.
    undefined o null: el estado aún no está determinado.
    Por eso usamos !== false en lugar de === true, para cubrir también los casos indefinidos (que podrían interpretarse como "sí hay conexión").
    
    */
  } catch (error) {
    console.error("Error verificando la conexión:", error);
    return false;
  }
};
