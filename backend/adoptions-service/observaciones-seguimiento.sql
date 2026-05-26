-- =========================
-- OBSERVACIONES DE ADAPTACIÓN
-- =========================
-- Tabla para que el refugio registre observaciones sobre la adaptación del animal en el hogar del adoptante
-- HU: El refugio registra observaciones de adaptación

CREATE TABLE IF NOT EXISTS observa_adapt (
    id_obs      serial PRIMARY KEY,
    id_soli     int       NOT NULL,
    id_refug    int       NOT NULL,
    descripcion text      NOT NULL,
    fech_obs    timestamp NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (id_soli)  REFERENCES soli_adop(id_soli) ON DELETE CASCADE,
    FOREIGN KEY (id_refug) REFERENCES refugios(id_refug) ON DELETE CASCADE
);

-- =========================
-- SEGUIMIENTO DE ADOPCIÓN
-- =========================
-- Tabla para que el adoptante reporte novedades sobre el seguimiento de la mascota adoptada
-- HU: El adoptante reporta novedades en seguimiento de la mascota adoptada

CREATE TABLE IF NOT EXISTS segui_adop (
    id_seg      serial PRIMARY KEY,
    id_soli     int       NOT NULL,
    id_usuario  int       NOT NULL,
    descripcion text      NOT NULL,
    fech_seg    timestamp NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (id_soli)    REFERENCES soli_adop(id_soli) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- =========================
-- ÍNDICES (para mejorar rendimiento)
-- =========================

CREATE INDEX IF NOT EXISTS idx_observa_adapt_soli ON observa_adapt(id_soli);
CREATE INDEX IF NOT EXISTS idx_observa_adapt_refug ON observa_adapt(id_refug);
CREATE INDEX IF NOT EXISTS idx_segui_adop_soli ON segui_adop(id_soli);
CREATE INDEX IF NOT EXISTS idx_segui_adop_usuario ON segui_adop(id_usuario);
