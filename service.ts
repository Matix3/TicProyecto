import axios from "axios";

const API_BASE_URL = "https://tics-web.vercel.app/api/logs";
import { obtenerUbicacion } from "./location";
import { hayConexionInternet } from "./internetConection"; // Asegúrate de tener esta función para verificar la conexión a internet

const listaPendientes: { mac: string; mensaje: string; hora: string; ubicacion: string }[] = [];


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
  return conectado;
};
export async function enviarLog(mac: string, mensaje: string) {
  try {
    const conectado = await verificarConexion();

    const hora = obtenerHoraActual(); // Obtener la hora actual
    const ubicacion = await obtenerUbicacion(); // Obtener ubicación

    if (!conectado) {
      // Guardar el log en la lista de pendientes
      listaPendientes.push({ mac, mensaje, hora, ubicacion });
      console.log("Log guardado en pendientes:", { mac, mensaje, hora, ubicacion });
      return { success: false, message: "No hay conexión a internet. Log guardado localmente." };
    }

    // Enviar logs pendientes primero
    while (listaPendientes.length > 0) {
      const pendiente = listaPendientes.shift(); // Elimina el primer elemento
      if (pendiente) {
        const { mac, mensaje, hora, ubicacion } = pendiente;
        const urlPendiente = `${API_BASE_URL}/${encodeURIComponent(mac)}/${encodeURIComponent(mensaje)}/${encodeURIComponent(hora)}/${encodeURIComponent(ubicacion)}`;
        await axios.get(urlPendiente);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
      }
    }

    // Enviar log actual
    const url = `${API_BASE_URL}/${encodeURIComponent(mac)}/${encodeURIComponent(mensaje)}/${encodeURIComponent(hora)}/${encodeURIComponent(ubicacion)}`;
    const response = await axios.get(url);
    return response.data;

  } catch (error) {
    console.error("Error al enviar log:", error);
    throw error;
  }
}


