-- ============================================================
-- SEED: Animales de prueba — PetMatch
-- Refugios: patitas.org (u=5), hualllitas.casa (u=7), peluchin.org (u=8)
-- ============================================================

-- ─── Paso 1: Hacer imágenes opcionales (NOT NULL → nullable) ─────────────────
ALTER TABLE MASCOTAS      ALTER COLUMN img_mascot  DROP NOT NULL;
ALTER TABLE PUBLICACIONES ALTER COLUMN arch_publi  DROP NOT NULL;

-- ─── Paso 2: Aprobar los refugios (necesario para que aparezcan en matching) ──
UPDATE REFUGIOS SET est_aprobacion = 'aprobado'
WHERE id_usuario IN (5, 7, 8);

-- ─── Paso 3: Razas (solo inserta si no existen) ───────────────────────────────
INSERT INTO RAZAS (id_espe, nom_raza)
SELECT e.id_espe, v.nom_raza
FROM (VALUES
  ('Perro',   'Labrador Retriever'),
  ('Perro',   'Golden Retriever'),
  ('Perro',   'Beagle'),
  ('Perro',   'Mestizo'),
  ('Perro',   'Pastor Alemán'),
  ('Perro',   'Chihuahua'),
  ('Perro',   'Poodle'),
  ('Perro',   'Cocker Spaniel'),
  ('Gato',    'Siamés'),
  ('Gato',    'Persa'),
  ('Gato',    'Mestizo'),
  ('Gato',    'Angora'),
  ('Ave',     'Periquito'),
  ('Ave',     'Loro'),
  ('Ave',     'Canario'),
  ('Conejo',  'Holandés'),
  ('Conejo',  'Rex'),
  ('Conejo',  'Mestizo')
) AS v(nom_espe, nom_raza)
JOIN ESPECIES e ON e.nom_espe = v.nom_espe
WHERE NOT EXISTS (
  SELECT 1 FROM RAZAS r
  WHERE r.nom_raza = v.nom_raza
    AND r.id_espe  = e.id_espe
);

-- ─── Paso 4: Mascotas y publicaciones ─────────────────────────────────────────
DO $$
DECLARE
  v_refug_patitas   int;
  v_refug_huallitas int;
  v_refug_peluchin  int;
  v_mascot          int;
  v_raza            int;
BEGIN

  SELECT id_refug INTO v_refug_patitas   FROM REFUGIOS WHERE id_usuario = 5;
  SELECT id_refug INTO v_refug_huallitas FROM REFUGIOS WHERE id_usuario = 7;
  SELECT id_refug INTO v_refug_peluchin  FROM REFUGIOS WHERE id_usuario = 8;

  -- ══════════════════════════════════════════════════════════════
  -- PATITAS.ORG — Kamila Jimenez
  -- ══════════════════════════════════════════════════════════════

  -- 1. Max · Labrador · 3 años · macho · esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Labrador Retriever' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Max', 3, '2023-01-15',
      'Max es un Labrador cariñoso y lleno de energía. Está entrenado en comandos básicos, '
      'convive perfecto con niños y otros perros. Necesita espacio para correr y una familia activa.',
      true, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_patitas,
      'Max lleva 4 meses en nuestro refugio y está listo para su nuevo hogar. '
      'Vacunas al día, desparasitado y esterilizado. Ideal para familias con jardín.');

  -- 2. Luna · Gata Mestiza · 2 años · hembra · esterilizada
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Mestizo' AND e.nom_espe = 'Gato' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Luna', 2, '2024-03-10',
      'Luna es una gatita tranquila y cariñosa. Le encanta el sol de la ventana y las caricias. '
      'Se lleva bien con gatos adultos. Perfecta para hogares tranquilos.',
      false, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_patitas,
      'Luna fue rescatada de la calle y rehabilitada. Ya está esterilizada, vacunada y desparasitada. '
      'Busca un hogar tranquilo donde pueda sentirse segura y amada.');

  -- 3. Rocky · Perro Mestizo · 5 años · macho · no esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Mestizo' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Rocky', 5, '2021-06-20',
      'Rocky es un perro adulto leal y tranquilo. Disfruta los paseos largos y estar al aire libre. '
      'Se lleva bien con personas adultas. No requiere experiencia previa.',
      true, false)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_patitas,
      'Rocky lleva 8 meses en el refugio. Es un perro maduro que necesita una familia paciente. '
      'Vacunas al día. Ideal para parejas o personas adultas que busquen un compañero tranquilo.');

  -- 4. Mochi · Gata Siamés · 1 año · hembra · esterilizada
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Siamés' AND e.nom_espe = 'Gato' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Mochi', 1, '2025-02-14',
      'Mochi es una gatita joven, juguetona y muy expresiva. Le encanta explorar y jugar. '
      'Muy sociable, se adapta fácilmente a nuevos ambientes.',
      false, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_patitas,
      'Mochi llegó de pequeña al refugio. Tiene todas sus vacunas y fue esterilizada. '
      'Ideal para familias con niños mayores o adoptantes primerizos que busquen una compañía activa.');

  -- ══════════════════════════════════════════════════════════════
  -- HUALLLITAS CASA — Adela Zamudio
  -- ══════════════════════════════════════════════════════════════

  -- 5. Bolt · Golden Retriever · 4 años · macho · esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Golden Retriever' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Bolt', 4, '2022-04-05',
      'Bolt es un Golden Retriever amigable y gentil con toda la familia. Adora el agua, '
      'convive perfecto con niños pequeños y otros perros. Sabe sentarse, echarse y dar la pata.',
      true, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_huallitas,
      'Bolt llegó cuando su familia tuvo que mudarse al extranjero. Está en excelentes condiciones, '
      'esterilizado y con todas sus vacunas. Perfecto para familias con niños.');

  -- 6. Nala · Beagle · 2 años · hembra · esterilizada
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Beagle' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Nala', 2, '2024-01-20',
      'Nala es una Beagle curiosa y llena de vida. Le encanta olfatear y explorar. '
      'Necesita paseos diarios y estimulación mental. Se lleva bien con niños y otros perros.',
      false, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_huallitas,
      'Nala es una perrita joven con mucha energía. Esterilizada y al día con vacunas. '
      'Ideal para familias activas que disfruten salir a caminar o correr.');

  -- 7. Simba · Gato Persa · 3 años · macho · esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Persa' AND e.nom_espe = 'Gato' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Simba', 3, '2023-07-11',
      'Simba es un gato Persa de temperamento tranquilo y elegante. Le gusta la calma y '
      'los rincones acogedores. Muy cariñoso con su persona de confianza.',
      true, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_huallitas,
      'Simba necesita cepillado regular por su pelo largo. Esterilizado, vacunado y en perfecta salud. '
      'Busca un hogar tranquilo, sin mucho ruido, donde pueda ser el rey de la casa.');

  -- 8. Coco · Conejo Holandés · 1 año · macho · no esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Holandés' AND e.nom_espe = 'Conejo' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Coco', 1, '2025-01-08',
      'Coco es un conejo Holandés curioso y muy activo. Le gusta explorar, comer verduras frescas '
      'y recibir caricias en la cabeza. Necesita espacio para saltar y moverse.',
      true, false)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_huallitas,
      'Coco fue rescatado de una tienda en malas condiciones. Completamente recuperado y sano. '
      'Ideal para un hogar con espacio donde pueda moverse con libertad.');

  -- ══════════════════════════════════════════════════════════════
  -- PELUCHIN.ORG — Cristian Rivera
  -- ══════════════════════════════════════════════════════════════

  -- 9. Thor · Pastor Alemán · 5 años · macho · no esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Pastor Alemán' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Thor', 5, '2021-03-22',
      'Thor es un Pastor Alemán leal, inteligente y protector. Está bien entrenado y responde '
      'a comandos de obediencia. Requiere adoptante con experiencia en perros de raza grande.',
      true, false)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_peluchin,
      'Thor fue entregado por su dueño anterior por cambio de vivienda. Vacunas al día y buen '
      'comportamiento. Requiere adoptante con experiencia y espacio amplio.');

  -- 10. Lily · Gata Angora · 2 años · hembra · esterilizada
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Angora' AND e.nom_espe = 'Gato' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Lily', 2, '2024-05-18',
      'Lily es una gata Angora de pelo blanco y ojos azules. Delicada y cariñosa. '
      'Le gusta jugar pero también descansar en lugares suaves y cálidos.',
      false, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_peluchin,
      'Lily fue rescatada de un abandono. Esterilizada, vacunada y en excelente estado. '
      'Su pelo requiere cepillado frecuente. Ideal para hogares tranquilos sin otros animales.');

  -- 11. Pipo · Periquito · 1 año · macho
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Periquito' AND e.nom_espe = 'Ave' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Pipo', 1, '2025-04-01',
      'Pipo es un periquito verde y amarillo muy alegre. Ya pronuncia algunas palabras y '
      'le encanta escuchar música. Activo de día, tranquilo de noche.',
      true, false)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_peluchin,
      'Pipo fue donado por una familia que no podía cuidarlo. Viene con su jaula y accesorios. '
      'Perfecto para apartamentos, no hace ruido excesivo.');

  -- 12. Tobi · Chihuahua · 4 años · macho · esterilizado
  SELECT r.id_raza INTO v_raza
    FROM RAZAS r JOIN ESPECIES e ON r.id_espe = e.id_espe
    WHERE r.nom_raza = 'Chihuahua' AND e.nom_espe = 'Perro' LIMIT 1;

  INSERT INTO MASCOTAS (id_raza, nom_mascot, edad_mascot, fenac_mascot, descrip_mascot, gen_mascot, esterilizado)
    VALUES (v_raza, 'Tobi', 4, '2022-08-30',
      'Tobi es un Chihuahua pequeño pero con una personalidad enorme. Leal y muy apegado a su persona. '
      'Puede ser tímido al principio, con cariño se vuelve muy afectuoso.',
      true, true)
    RETURNING id_mascot INTO v_mascot;
  INSERT INTO PUBLICACIONES (id_mascot, id_refug, decrip_publi)
    VALUES (v_mascot, v_refug_peluchin,
      'Tobi lleva 6 meses en Peluchin.org tras ser encontrado en la calle. Esterilizado y vacunado. '
      'No recomendable con niños muy pequeños. Ideal para personas adultas o parejas.');

END;
$$;