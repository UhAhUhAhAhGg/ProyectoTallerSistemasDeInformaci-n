import axios from 'axios';
import { ENV } from '../config/env';

interface Publicacion {
  id_publi:   number;
  id_refug:   number;
  est_publi:  boolean;  // true = activa
  est_adop:   boolean;  // false = disponible para adopción
}

// Verifica que la publicación existe, está activa y disponible
export const getPublicacionDisponible = async (
  id_publi: number
): Promise<Publicacion | null> => {
  try {
    const { data } = await axios.get(
      `${ENV.SERVICES.pets}/publicaciones/${id_publi}`
    );
    const pub: Publicacion = data.data;

    if (!pub.est_publi || pub.est_adop) return null;  // inactiva o ya adoptada

    return pub;
  } catch {
    return null;
  }
};
