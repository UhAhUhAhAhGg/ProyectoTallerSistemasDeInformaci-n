import { Request, Response } from 'express';
import { pool } from '../config/database';
import { forbidden, ok, serverError } from '../utils/response.helper';

interface PerfilAdoptante {
  tipo_vivienda: string;
  tiene_patio: boolean;
  disp_tiempo: string;
  exp_previa: boolean;
  pref_especie: number | null;
  pref_tamanio: string | null;
  pref_edad: string | null;
  acepta_ninos: boolean;
  acepta_otros: boolean;
  pref_especie_nombre: string | null;
}

interface PublicacionCandidata {
  id_publi: number;
  id_refug: number;
  id_mascot: number;
  nom_mascot: string;
  edad_mascot: number;
  descrip_mascot: string;
  gen_mascot: boolean;
  esterilizado: boolean;
  img_mascot: string;
  arch_publi: string;
  decrip_publi: string;
  nom_raza: string;
  id_espe: number;
  nom_espe: string;
  nom_refug: string;
  dir_refug: string;
}

const edadCategoria = (edad: number): string => {
  if (edad <= 1) return 'cachorro';
  if (edad <= 3) return 'joven';
  if (edad <= 8) return 'adulto';
  return 'senior';
};

const contiene = (texto: string, palabras: string[]): boolean => {
  const normalizado = texto.toLowerCase();
  return palabras.some((palabra) => normalizado.includes(palabra));
};

const calcularMatch = (perfil: PerfilAdoptante, mascota: PublicacionCandidata) => {
  let score = 50;
  const motivos: string[] = [];
  const alertas: string[] = [];
  const texto = `${mascota.nom_mascot} ${mascota.nom_raza} ${mascota.nom_espe} ${mascota.descrip_mascot} ${mascota.decrip_publi}`;

  if (perfil.pref_especie) {
    if (perfil.pref_especie === mascota.id_espe) {
      score += 20;
      motivos.push(`Coincide con la especie preferida: ${mascota.nom_espe}.`);
    } else {
      score -= 18;
      alertas.push(`No coincide con la especie preferida (${perfil.pref_especie_nombre || 'seleccionada'}).`);
    }
  }

  if (perfil.pref_edad) {
    const categoria = edadCategoria(mascota.edad_mascot);
    if (perfil.pref_edad === 'cualquiera' || perfil.pref_edad === categoria) {
      score += 12;
      motivos.push(`La edad encaja con la preferencia: ${categoria}.`);
    } else {
      score -= 8;
      alertas.push(`La edad es ${categoria}, distinta a la preferencia indicada.`);
    }
  }

  if (perfil.tipo_vivienda === 'apartamento') {
    const pareceGrande = contiene(texto, ['grande', 'activo', 'energia alta', 'energico']);
    if (pareceGrande && !perfil.tiene_patio) {
      score -= 12;
      alertas.push('Puede requerir mas espacio o actividad para un apartamento sin patio.');
    } else {
      score += 8;
      motivos.push('Puede adaptarse al tipo de vivienda indicado.');
    }
  }

  if (perfil.disp_tiempo === 'alta') {
    score += 8;
    motivos.push('La disponibilidad alta favorece el proceso de adaptacion.');
  }

  if (perfil.disp_tiempo === 'baja' && contiene(texto, ['activo', 'energia alta', 'requiere tiempo', 'entrenamiento'])) {
    score -= 12;
    alertas.push('Podria requerir mas tiempo del disponible.');
  }

  if (!perfil.exp_previa && contiene(texto, ['especial', 'rehabilitacion', 'ansioso', 'miedoso', 'entrenamiento'])) {
    score -= 10;
    alertas.push('Podria requerir experiencia previa o acompanamiento.');
  }

  if (perfil.pref_tamanio && perfil.pref_tamanio !== 'cualquiera') {
    if (contiene(texto, [perfil.pref_tamanio])) {
      score += 8;
      motivos.push(`La descripcion sugiere tamanio ${perfil.pref_tamanio}.`);
    }
  }

  if (perfil.acepta_ninos && contiene(texto, ['ninos', 'familia'])) {
    score += 5;
    motivos.push('La descripcion menciona buena convivencia familiar.');
  }

  if (perfil.acepta_otros && contiene(texto, ['otros animales', 'perros', 'gatos', 'convive'])) {
    score += 5;
    motivos.push('La descripcion sugiere compatibilidad con otros animales.');
  }

  const scoreFinal = Math.max(0, Math.min(100, score));

  return {
    score: scoreFinal,
    motivos: motivos.length > 0 ? motivos : ['Candidato disponible para evaluacion segun el perfil del adoptante.'],
    alertas,
  };
};

export const getRecomendaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUsuario = req.user?.id;
    if (!idUsuario) {
      forbidden(res, 'Token requerido');
      return;
    }

    const perfilResult = await pool.query<PerfilAdoptante>(
      `SELECT pa.*, e.nom_espe AS pref_especie_nombre
       FROM PERFIL_ADOPTANTE pa
       LEFT JOIN ESPECIES e ON e.id_espe = pa.pref_especie
       WHERE pa.id_usuario = $1`,
      [idUsuario],
    );

    const perfil = perfilResult.rows[0];
    if (!perfil) {
      ok(res, [], 'Completa tu perfil de adoptante para recibir recomendaciones');
      return;
    }

    const publicacionesResult = await pool.query<PublicacionCandidata>(
      `SELECT
         p.id_publi, p.id_refug, p.arch_publi, p.decrip_publi,
         m.id_mascot, m.nom_mascot, m.edad_mascot, m.descrip_mascot,
         m.gen_mascot, m.esterilizado, m.img_mascot,
         r.nom_raza,
         e.id_espe, e.nom_espe,
         ref.nom_refug, ref.dir_refug
       FROM PUBLICACIONES p
       JOIN MASCOTAS m ON m.id_mascot = p.id_mascot
       JOIN RAZAS r ON r.id_raza = m.id_raza
       JOIN ESPECIES e ON e.id_espe = r.id_espe
       JOIN REFUGIOS ref ON ref.id_refug = p.id_refug
       WHERE p.est_publi = true
         AND p.est_adop = false
         AND ref.est_aprobacion = 'aprobado'
       ORDER BY p.fech_publi DESC`,
    );

    const recomendaciones = publicacionesResult.rows
      .map((publicacion) => {
        const match = calcularMatch(perfil, publicacion);
        return {
          id_publi: publicacion.id_publi,
          id_mascot: publicacion.id_mascot,
          id_refug: publicacion.id_refug,
          mascota: {
            nombre: publicacion.nom_mascot,
            edad: publicacion.edad_mascot,
            edad_categoria: edadCategoria(publicacion.edad_mascot),
            especie: publicacion.nom_espe,
            raza: publicacion.nom_raza,
            imagen: publicacion.img_mascot || publicacion.arch_publi,
            esterilizado: publicacion.esterilizado,
          },
          refugio: {
            nombre: publicacion.nom_refug,
            direccion: publicacion.dir_refug,
          },
          score: match.score,
          motivos: match.motivos,
          alertas: match.alertas,
          fuente: 'reglas',
          listo_para_ia: true,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    ok(res, recomendaciones, 'Recomendaciones generadas');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al generar recomendaciones');
  }
};
