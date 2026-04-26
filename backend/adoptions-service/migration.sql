-- Migración: agregar columnas necesarias a HISTO_ADOP
-- Tu modelo original solo tiene id_ha e id_soli.
-- Estas columnas son necesarias para auditoría real (HU-18, HU-19).

ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_est_anterior   int          NOT NULL DEFAULT 1;
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_est_nuevo      int          NOT NULL DEFAULT 1;
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS motivo            text         NOT NULL DEFAULT '';
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS fech_cambio       timestamp    NOT NULL DEFAULT NOW();
ALTER TABLE HISTO_ADOP ADD COLUMN IF NOT EXISTS id_usuario_accion int          NOT NULL DEFAULT 0;

-- Foreign keys opcionales (recomendadas)
ALTER TABLE HISTO_ADOP ADD CONSTRAINT fk_hist_est_anterior
  FOREIGN KEY (id_est_anterior) REFERENCES ESTAD_SOLI(id_est);

ALTER TABLE HISTO_ADOP ADD CONSTRAINT fk_hist_est_nuevo
  FOREIGN KEY (id_est_nuevo) REFERENCES ESTAD_SOLI(id_est);

-- Datos semilla: estados requeridos por el sistema
INSERT INTO ESTAD_SOLI (id_est, nom_est) VALUES
  (1, 'Enviada'),
  (2, 'En revisión'),
  (3, 'Aprobada'),
  (4, 'Rechazada'),
  (5, 'En espera')
ON CONFLICT (id_est) DO NOTHING;
