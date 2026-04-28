import axios from 'axios';
import { ENV } from '../config/env';

interface Publicacion {
  id_publi:  number;
  id_refug:  number;
  est_publi: boolean;
  est_adop:  boolean;
}

export const getPublicacionDisponible = async (
  id_publi: number,
  token: string
): Promise<Publicacion | null> => {
  try {
    const { data } = await axios.get(
      `${ENV.SERVICES.pets}/publicaciones/${id_publi}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const pub: Publicacion = data.data;

    if (!pub || !pub.est_publi || pub.est_adop) return null;

    return pub;
  } catch {
    return null;
  }
};