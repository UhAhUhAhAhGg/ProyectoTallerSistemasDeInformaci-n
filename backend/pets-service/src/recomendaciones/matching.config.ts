// Configuración de pesos y umbral para el motor de matching.
export interface MatchingConfig {
  umbral_minimo: number;        // score mínimo para incluir en resultados
  max_resultados: number;       // cuántos resultados devolver
  peso_especie: number;         // 0-100: qué tan importante es la especie preferida
  peso_edad: number;            // 0-100
  peso_espacio: number;         // 0-100: vivienda + patio
  peso_tiempo: number;          // 0-100
  peso_experiencia: number;     // 0-100
  priorizar_tiempo_refugio: boolean; // dar boost a animales con más tiempo en el refugio
  usar_ia: boolean;             // true = Groq, false = solo reglas
}

let config: MatchingConfig = {
  umbral_minimo: 40,
  max_resultados: 10,
  peso_especie: 30,
  peso_edad: 20,
  peso_espacio: 20,
  peso_tiempo: 15,
  peso_experiencia: 15,
  priorizar_tiempo_refugio: true,
  usar_ia: true,
};

export const getConfig = (): MatchingConfig => ({ ...config });

export const updateConfig = (partial: Partial<MatchingConfig>): MatchingConfig => {
  config = { ...config, ...partial };
  return { ...config };
};