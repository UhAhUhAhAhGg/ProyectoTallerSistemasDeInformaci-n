# Borrador para integrar IA en recomendaciones

Este modulo ya tiene un endpoint funcional:

```http
GET /recomendaciones
Authorization: Bearer <token_adoptante>
```

Hoy responde recomendaciones calculadas por reglas en `Recomendacion.controller.ts`. La idea es que la IA mejore el orden y los textos, pero que las reglas sigan como fallback si la API externa falla o si `AI_RECOMMENDATIONS_ENABLED=false`.

## Variables esperadas

Agregar al `.env` de `backend/pets-service`:

```env
AI_RECOMMENDATIONS_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

No subir claves reales al repositorio.

## Punto recomendado de integracion

Crear un cliente aparte para no mezclar HTTP externo con SQL:

```txt
src/recomendaciones/
  Recomendacion.controller.ts
  Recomendacion.routes.ts
  ia-recomendacion.client.ts
```

El controller ya arma:

- `perfil`: datos del adoptante.
- `publicacionesResult.rows`: mascotas candidatas disponibles.
- `recomendaciones`: respuesta ordenada por reglas.

La integracion mas segura es:

1. Calcular primero las recomendaciones por reglas.
2. Si `AI_RECOMMENDATIONS_ENABLED=true`, mandar a la IA solo los datos necesarios.
3. Pedir que devuelva JSON valido con el mismo contrato.
4. Si falla, responder las recomendaciones por reglas.

## Contrato de salida que debe respetar la IA

Cada recomendacion debe mantener esta forma para no romper el frontend:

```ts
type RecomendacionMascota = {
  id_publi: number;
  id_mascot: number;
  id_refug: number;
  mascota: {
    nombre: string;
    edad: number;
    edad_categoria: string;
    especie: string;
    raza: string;
    imagen: string;
    esterilizado: boolean;
  };
  refugio: {
    nombre: string;
    direccion: string;
  };
  score: number; // 0 a 100
  motivos: string[];
  alertas: string[];
  fuente: 'reglas' | 'ia';
  listo_para_ia: boolean;
};
```

## Ejemplo de prompt/payload

Enviar a la IA algo asi:

```json
{
  "perfil": {
    "tipo_vivienda": "apartamento",
    "tiene_patio": false,
    "disp_tiempo": "media",
    "exp_previa": true,
    "pref_especie_nombre": "Perro",
    "pref_tamanio": "pequeno",
    "pref_edad": "joven",
    "acepta_ninos": true,
    "acepta_otros": true
  },
  "candidatas": [
    {
      "id_publi": 1,
      "nombre": "Luna",
      "edad": 2,
      "especie": "Perro",
      "raza": "Mestizo",
      "descripcion": "Tranquila, convive con ninos y otros animales.",
      "refugio": "Huellitas"
    }
  ]
}
```

Instruccion sugerida:

```txt
Eres un asistente de adopcion responsable. Ordena las mascotas por compatibilidad con el perfil.
Devuelve solo JSON valido. No inventes datos. Usa score de 0 a 100.
Motivos y alertas deben ser breves, utiles y en espanol.
```

## Pseudocodigo de integracion

```ts
const recomendacionesReglas = generarRecomendacionesPorReglas(perfil, publicaciones);

if (!ENV.AI_RECOMMENDATIONS_ENABLED) {
  return recomendacionesReglas;
}

try {
  const recomendacionesIA = await generarRecomendacionesIA({
    perfil,
    candidatas: recomendacionesReglas,
  });

  return recomendacionesIA.map((item) => ({
    ...item,
    fuente: 'ia',
    listo_para_ia: true,
  }));
} catch (error) {
  return recomendacionesReglas;
}
```

## Checklist para quien implemente

- Instalar el SDK o usar `fetch` segun la API elegida.
- Leer la clave desde `process.env.AI_API_KEY`.
- Validar que la respuesta sea JSON antes de enviarla al frontend.
- Mantener fallback por reglas.
- No enviar datos sensibles innecesarios del usuario.
- Probar con un adoptante con perfil completo y publicaciones activas.
