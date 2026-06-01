-- Migración: agregar columnas necesarias a HISTO_ADOP.

ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_est_anterior   int          NOT NULL DEFAULT 1;
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_est_nuevo      int          NOT NULL DEFAULT 1;
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS motivo            text         NOT NULL DEFAULT '';
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS fech_cambio       timestamp    NOT NULL DEFAULT NOW();
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_usuario_accion int          NOT NULL DEFAULT 0;

-- Foreign keys opcionales (recomendadas). PostgreSQL no soporta
-- ADD CONSTRAINT IF NOT EXISTS, por eso se revisa pg_constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_hist_est_anterior'
  ) THEN
    ALTER TABLE HISTO_ADOP ADD CONSTRAINT fk_hist_est_anterior
      FOREIGN KEY (id_est_anterior) REFERENCES ESTAD_SOLI(id_est);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_hist_est_nuevo'
  ) THEN
    ALTER TABLE HISTO_ADOP ADD CONSTRAINT fk_hist_est_nuevo
      FOREIGN KEY (id_est_nuevo) REFERENCES ESTAD_SOLI(id_est);
  END IF;
END $$;

-- Datos semilla: estados requeridos por el sistema
INSERT INTO ESTAD_SOLI (id_est, nom_est) VALUES
  (1, 'Enviada'),
  (2, 'En revisión'),
  (3, 'Aprobada'),
  (4, 'Rechazada'),
  (5, 'En espera')
ON CONFLICT (id_est) DO UPDATE SET nom_est = EXCLUDED.nom_est;
