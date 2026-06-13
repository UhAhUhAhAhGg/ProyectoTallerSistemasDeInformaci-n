-- Agregar estado 6 a ESTAD_SOLI
INSERT INTO ESTAD_SOLI (id_est, nom_est) VALUES (6, 'completada');
ALTER TABLE MASCOTAS
  ADD COLUMN tamano_mascot VARCHAR(10)
    CHECK (tamano_mascot IN ('pequeño', 'mediano', 'grande'));