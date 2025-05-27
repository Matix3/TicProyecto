import axios from "axios";

const API_BASE_URL = "https://tics-web.vercel.app/api/logs";
import { obtenerUbicacion } from "./location";
import { hayConexionInternet } from "./internetConection"; // Asegúrate de tener esta función para verificar la conexión a internet

export const obtenerHoraActual = () => {
  const ahora = new Date();

  const año = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0"); // meses van de 0 a 11
  const dia = String(ahora.getDate()).padStart(2, "0");

  const hora = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");

  return `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
};


//antes de enviar log, verificar si hay coneccion a internet, si no hay, guardar en localStorage y enviar cuando haya conección
const verificarConexion = async () => {
  const conectado = await hayConexionInternet();
  console.log("¿Conectado a internet?", conectado);
};


export async function enviarLog(mac: string, mensaje: string) {
  try {

    const hora = obtenerHoraActual(); // Obtener la hora actual en formato YYYY-MM-DD HH:mm:ss
    const ubicacion =await obtenerUbicacion(); // 
    const url = `${API_BASE_URL}/${encodeURIComponent(mac)}/${encodeURIComponent(mensaje)}/${encodeURIComponent(hora)}/${encodeURIComponent(ubicacion)}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al enviar log:", error);
    throw error;
  }
}