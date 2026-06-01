import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { pool } from '../config/database';
import { forbidden, ok, serverError } from '../utils/response.helper';
import { getConfig, updateConfig, MatchingConfig } from './matching.config';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PerfilAdoptante {
  tipo_vivienda: string;
  tiene_patio: boolean;
  disp_tiempo: string;
  exp_previa: boolean;
  desc_exp: string | null;
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
  fech_publi: Date;
}

interface ResultadoIA {
  id_publi: number;
  score: number;
  motivos: string[];
  alertas: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const edadCategoria = (edad: number): string => {
  if (edad <= 1) return 'cachorro';
  if (edad <= 3) return 'joven';
  if (edad <= 8) return 'adulto';
  return 'senior';
};

const contiene = (texto: string, palabras: string[]): boolean => {
  const n = texto.toLowerCase();
  return palabras.some((p) => n.includes(p));
};

// ─── Motor de reglas (fallback) ───────────────────────────────────────────────

const calcularMatchReglas = (
  perfil: PerfilAdoptante,
  mascota: PublicacionCandidata,
  config: MatchingConfig,
) => {
  const factorEspecie    = config.peso_especie    / 100;
  const factorEdad       = config.peso_edad       / 100;
  const factorEspacio    = config.peso_espacio    / 100;
  const factorTiempo     = config.peso_tiempo     / 100;
  const factorExp        = config.peso_experiencia / 100;

  let score = 50;
  const motivos: string[] = [];
  const alertas: string[] = [];
  const texto = `${mascota.nom_mascot} ${mascota.nom_raza} ${mascota.nom_espe} ${mascota.descrip_mascot} ${mascota.decrip_publi}`;

  if (perfil.pref_especie) {
    if (perfil.pref_especie === mascota.id_espe) {
      score += 20 * factorEspecie;
      motivos.push(`Coincide con la especie preferida: ${mascota.nom_espe}.`);
    } else {
      score -= 18 * factorEspecie;
      alertas.push(`No coincide con la especie preferida (${perfil.pref_especie_nombre ?? 'seleccionada'}).`);
    }
  }

  if (perfil.pref_edad) {
    const cat = edadCategoria(mascota.edad_mascot);
    if (perfil.pref_edad === 'cualquiera' || perfil.pref_edad === cat) {
      score += 12 * factorEdad;
      motivos.push(`La edad encaja con la preferencia: ${cat}.`);
    } else {
      score -= 8 * factorEdad;
      alertas.push(`La edad es ${cat}, distinta a la preferencia indicada.`);
    }
  }

  if (perfil.tipo_vivienda === 'apartamento') {
    const pareceGrande = contiene(texto, ['grande', 'activo', 'energia alta', 'energico']);
    if (pareceGrande && !perfil.tiene_patio) {
      score -= 12 * factorEspacio;
      alertas.push('Puede requerir más espacio o actividad para un apartamento sin patio.');
    } else {
      score += 8 * factorEspacio;
      motivos.push('Puede adaptarse al tipo de vivienda indicado.');
    }
  }

  if (perfil.disp_tiempo === 'alta') {
    score += 8 * factorTiempo;
    motivos.push('La disponibilidad alta favorece el proceso de adaptación.');
  }

  if (perfil.disp_tiempo === 'baja' && contiene(texto, ['activo', 'energia alta', 'requiere tiempo', 'entrenamiento'])) {
    score -= 12 * factorTiempo;
    alertas.push('Podría requerir más tiempo del disponible.');
  }

  if (!perfil.exp_previa && contiene(texto, ['especial', 'rehabilitacion', 'ansioso', 'miedoso', 'entrenamiento'])) {
    score -= 10 * factorExp;
    alertas.push('Podría requerir experiencia previa o acompañamiento.');
  }

  if (perfil.pref_tamanio && perfil.pref_tamanio !== 'cualquiera') {
    if (contiene(texto, [perfil.pref_tamanio])) {
      score += 8;
      motivos.push(`La descripción sugiere tamaño ${perfil.pref_tamanio}.`);
    }
  }

  if (perfil.acepta_ninos && contiene(texto, ['ninos', 'familia', 'niños'])) {
    score += 5;
    motivos.push('La descripción menciona buena convivencia familiar.');
  }

  if (perfil.acepta_otros && contiene(texto, ['otros animales', 'perros', 'gatos', 'convive'])) {
    score += 5;
    motivos.push('La descripción sugiere compatibilidad con otros animales.');
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    motivos: motivos.length > 0 ? motivos : ['Candidato disponible para evaluación según el perfil del adoptante.'],
    alertas,
  };
};

// ─── Motor IA con Groq ────────────────────────────────────────────────────────

const calcularMatchIA = async (
  perfil: PerfilAdoptante,
  mascotas: PublicacionCandidata[],
  config: MatchingConfig,
): Promise<ResultadoIA[]> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada');

  const groq = new Groq({ apiKey });

  const perfilTexto = `
Perfil del adoptante:
- Tipo de vivienda: ${perfil.tipo_vivienda}${perfil.tiene_patio ? ' con patio' : ' sin patio'}
- Disponibilidad de tiempo: ${perfil.disp_tiempo}
- Experiencia previa con animales: ${perfil.exp_previa ? 'Sí' : 'No'}${perfil.desc_exp ? ` (${perfil.desc_exp})` : ''}
- Especie preferida: ${perfil.pref_especie_nombre ?? 'sin preferencia'}
- Tamaño preferido: ${perfil.pref_tamanio ?? 'sin preferencia'}
- Edad preferida: ${perfil.pref_edad ?? 'sin preferencia'}
- Acepta niños en casa: ${perfil.acepta_ninos ? 'Sí' : 'No'}
- Acepta otros animales: ${perfil.acepta_otros ? 'Sí' : 'No'}
- Importancia de especie (0-100): ${config.peso_especie}
- Importancia de edad (0-100): ${config.peso_edad}
- Importancia de espacio/vivienda (0-100): ${config.peso_espacio}
- Importancia de disponibilidad de tiempo (0-100): ${config.peso_tiempo}
- Importancia de experiencia (0-100): ${config.peso_experiencia}
`.trim();

  const mascotasTexto = mascotas.map((m, i) => `
[${i}] id_publi=${m.id_publi}
  Nombre: ${m.nom_mascot} | Especie: ${m.nom_espe} | Raza: ${m.nom_raza}
  Edad: ${m.edad_mascot} años (${edadCategoria(m.edad_mascot)}) | Esterilizado: ${m.esterilizado ? 'Sí' : 'No'}
  Descripción: ${m.descrip_mascot}
  Descripción publicación: ${m.decrip_publi}
  Refugio: ${m.nom_refug} - ${m.dir_refug}
`).join('\n');

  const prompt = `Eres un experto en bienestar animal y adopción responsable de mascotas en Bolivia.

Tu tarea es evaluar la compatibilidad entre el siguiente adoptante potencial y cada mascota disponible.

${perfilTexto}

Mascotas disponibles:
${mascotasTexto}

Para cada mascota, evalúa la compatibilidad y responde SOLO con un JSON válido con este formato exacto (sin texto adicional, sin markdown):
[
  {
    "id_publi": <número>,
    "score": <número entre 0 y 100>,
    "motivos": ["<razón positiva 1>", "<razón positiva 2>"],
    "alertas": ["<posible incompatibilidad o desafío>"]
  },
  ...
]

Criterios de evaluación:
- Considera el espacio disponible vs necesidades de ejercicio del animal
- Evalúa si la experiencia del adoptante es suficiente para las necesidades del animal
- Considera compatibilidad con niños y otros animales si aplica
- Da mayor puntuación a la especie/raza/edad preferida
- Si la disponibilidad de tiempo es baja y el animal necesita mucha atención, penaliza
- Sé preciso y útil; los motivos y alertas deben ser en español natural boliviano
- Devuelve los arrays vacíos [] cuando no hay motivos o alertas relevantes`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const responseText = completion.choices[0]?.message?.content ?? '[]';

  // Extraer JSON aunque venga con texto extra
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('La IA no devolvió JSON válido');

  const resultados: ResultadoIA[] = JSON.parse(jsonMatch[0]);
  return resultados;
};

// ─── Controlador principal ────────────────────────────────────────────────────

export const getRecomendaciones = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUsuario = req.user?.id;
    if (!idUsuario) { forbidden(res, 'Token requerido'); return; }

    const config = getConfig();

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

    const pubResult = await pool.query<PublicacionCandidata>(
      `SELECT
         p.id_publi, p.id_refug, p.arch_publi, p.decrip_publi, p.fech_publi,
         m.id_mascot, m.nom_mascot, m.edad_mascot, m.descrip_mascot,
         m.gen_mascot, m.esterilizado, m.img_mascot,
         r.nom_raza,
         e.id_espe, e.nom_espe,
         ref.nom_refug, ref.dir_refug
       FROM PUBLICACIONES p
       JOIN MASCOTAS m ON m.id_mascot = p.id_mascot
       JOIN RAZAS r    ON r.id_raza   = m.id_raza
       JOIN ESPECIES e ON e.id_espe   = r.id_espe
       JOIN REFUGIOS ref ON ref.id_refug = p.id_refug
       WHERE p.est_publi = true
         AND p.est_adop = false
         AND ref.est_aprobacion = 'aprobado'
       ORDER BY p.fech_publi ASC`,
    );

    const publicaciones = pubResult.rows;
    if (publicaciones.length === 0) {
      ok(res, [], 'No hay mascotas disponibles en este momento');
      return;
    }

    let resultadosMatch: { id_publi: number; score: number; motivos: string[]; alertas: string[] }[];
    let fuente = 'reglas';

    const useIA = config.usar_ia && !!process.env.GROQ_API_KEY;

    if (useIA) {
      try {
        const iaResults = await calcularMatchIA(perfil, publicaciones, config);
        // Fusionar con datos locales: si falta alguna mascota en la resp de IA, completar con reglas
        const iaMap = new Map(iaResults.map((r) => [r.id_publi, r]));
        resultadosMatch = publicaciones.map((pub) => {
          const iaItem = iaMap.get(pub.id_publi);
          if (iaItem) return iaItem;
          // fallback por si la IA omitió alguna mascota
          const reglas = calcularMatchReglas(perfil, pub, config);
          return { id_publi: pub.id_publi, ...reglas };
        });
        fuente = 'ia';
      } catch (iaErr) {
        console.error('[IA matching] Error, usando reglas como fallback:', iaErr instanceof Error ? iaErr.message : iaErr);
        resultadosMatch = publicaciones.map((pub) => ({
          id_publi: pub.id_publi,
          ...calcularMatchReglas(perfil, pub, config),
        }));
      }
    } else {
      resultadosMatch = publicaciones.map((pub) => ({
        id_publi: pub.id_publi,
        ...calcularMatchReglas(perfil, pub, config),
      }));
    }

    const pubMap = new Map(publicaciones.map((p) => [p.id_publi, p]));

    // Boost para animales con más tiempo en el refugio
    const ahora = Date.now();
    const diasRefugio = (fech: Date) => Math.floor((ahora - new Date(fech).getTime()) / 86400000);

    const recomendaciones = resultadosMatch
      .filter((r) => r.score >= config.umbral_minimo)
      .map((r) => {
        const pub = pubMap.get(r.id_publi)!;
        let scoreAjustado = r.score;
        if (config.priorizar_tiempo_refugio) {
          const dias = diasRefugio(pub.fech_publi);
          // +1 punto por cada 30 días en el refugio, máximo 5 puntos extra
          scoreAjustado = Math.min(100, r.score + Math.min(5, Math.floor(dias / 30)));
        }
        return {
          id_publi: pub.id_publi,
          id_mascot: pub.id_mascot,
          id_refug: pub.id_refug,
          mascota: {
            nombre:        pub.nom_mascot,
            edad:          pub.edad_mascot,
            edad_categoria: edadCategoria(pub.edad_mascot),
            especie:       pub.nom_espe,
            raza:          pub.nom_raza,
            imagen:        pub.img_mascot || pub.arch_publi,
            esterilizado:  pub.esterilizado,
          },
          refugio: { nombre: pub.nom_refug, direccion: pub.dir_refug },
          score:   scoreAjustado,
          motivos: r.motivos,
          alertas: r.alertas,
          fuente,
          listo_para_ia: true,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, config.max_resultados);

    ok(res, recomendaciones, 'Recomendaciones generadas');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al generar recomendaciones');
  }
};

// ─── HU-15: admin obtiene y actualiza configuración de matching ───────────────

export const getMatchingConfig = (_req: Request, res: Response): void => {
  ok(res, getConfig(), 'Configuración de matching');
};

export const updateMatchingConfig = (req: Request, res: Response): void => {
  try {
    const cfg = updateConfig(req.body as Partial<MatchingConfig>);
    ok(res, cfg, 'Configuración actualizada');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al actualizar configuración');
  }
};