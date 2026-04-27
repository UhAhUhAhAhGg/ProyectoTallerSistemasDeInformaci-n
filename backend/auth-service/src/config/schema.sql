-- =========================
-- TABLAS BASE (sin cambios)
-- =========================

CREATE TABLE ESPECIES (
    id_espe serial PRIMARY KEY,
    nom_espe varchar(50) NOT NULL
);

CREATE TABLE RAZAS (
    id_raza serial PRIMARY KEY,
    id_espe int NOT NULL,
    nom_raza varchar(50) NOT NULL,
    FOREIGN KEY (id_espe) REFERENCES ESPECIES(id_espe)
);

CREATE TABLE ROLES (
    id_rol serial PRIMARY KEY,
    nom_rol varchar(50) NOT NULL
);

CREATE TABLE ESTAD_SOLI (
    id_est int PRIMARY KEY,
    nom_est varchar(30) NOT NULL
);

-- =========================
-- USUARIOS
-- Cambios:
-- + est_usuario para controlar estado del flujo
-- - id_refug eliminado (la relación se invirtió)
-- - campos de perfil ahora son opcionales (nullable)
-- =========================

CREATE TABLE USUARIOS (
    id_usuario  serial PRIMARY KEY,
    id_rol      int          NOT NULL,
    corr_usuario varchar(100) NOT NULL UNIQUE,
    contra_usuario varchar(255) NOT NULL,
    nom_usuario  varchar(80)  NOT NULL,
    apell_usuario varchar(80) NOT NULL,

    -- Estado del usuario en el sistema
    -- 'activo'    → adoptante con perfil completo, o admin
    -- 'pendiente' → refugio esperando aprobación del admin
    -- 'rechazado' → refugio rechazado por el admin
    -- 'incompleto'→ usuario recién registrado, sin perfil aún
    est_usuario varchar(20) NOT NULL DEFAULT 'incompleto',

    -- Datos de perfil personal (opcionales al registrarse)
    telf_usuario  varchar(20),
    fenac_usuario date,
    gen_usuario   boolean,
    direc_usuario text,

    fecha_registro timestamp NOT NULL DEFAULT now(),

    FOREIGN KEY (id_rol) REFERENCES ROLES(id_rol)
);

-- =========================
-- PERFIL ADOPTANTE (sin cambios en estructura)
-- La relación va desde aquí hacia USUARIOS, correcto
-- =========================

CREATE TABLE PERFIL_ADOPTANTE (
    id_perfil   serial PRIMARY KEY,
    id_usuario  int NOT NULL UNIQUE,

    tipo_vivienda varchar(30) NOT NULL,
    tiene_patio   boolean     NOT NULL DEFAULT false,
    disp_tiempo   varchar(20) NOT NULL,
    exp_previa    boolean     NOT NULL DEFAULT false,
    desc_exp      text,

    pref_especie  int,
    pref_tamanio  varchar(20),
    pref_edad     varchar(20),

    acepta_ninos  boolean NOT NULL DEFAULT true,
    acepta_otros  boolean NOT NULL DEFAULT true,

    FOREIGN KEY (id_usuario)    REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (pref_especie)  REFERENCES ESPECIES(id_espe)
);

-- =========================
-- REFUGIOS
-- Cambios:
-- + id_usuario (la relación ahora va desde REFUGIOS hacia USUARIOS)
-- - corr_refug eliminado (ya existe en USUARIOS)
-- est_verif_refug renombrado a est_aprobacion para más claridad
-- =========================

CREATE TABLE REFUGIOS (
    id_refug    serial PRIMARY KEY,
    id_usuario  int NOT NULL UNIQUE,  -- un usuario refugio = un perfil refugio

    nom_refug      varchar(80)  NOT NULL,
    dir_refug      varchar(200) NOT NULL,
    telf_refug     varchar(20)  NOT NULL,
    licencia_refug varchar(200) NOT NULL,
    descripcion    text,

    -- Estado de aprobación administrativa
    -- 'pendiente' → recién registrado, admin no ha revisado
    -- 'aprobado'  → admin aprobó, puede publicar mascotas
    -- 'rechazado' → admin rechazó
    est_aprobacion varchar(20) NOT NULL DEFAULT 'pendiente',

    fecha_solicitud timestamp NOT NULL DEFAULT now(),

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =========================
-- MASCOTAS (sin cambios)
-- =========================

CREATE TABLE MASCOTAS (
    id_mascot    serial PRIMARY KEY,
    id_raza      int  NOT NULL,
    img_mascot   text NOT NULL,
    nom_mascot   varchar(80) NOT NULL,
    edad_mascot  int  NOT NULL,
    fenac_mascot date NOT NULL,
    descrip_mascot text NOT NULL,
    gen_mascot   boolean NOT NULL,
    esterilizado boolean NOT NULL,

    FOREIGN KEY (id_raza) REFERENCES RAZAS(id_raza)
);

-- =========================
-- PUBLICACIONES
-- La relación va a REFUGIOS directamente, correcto
-- =========================

CREATE TABLE PUBLICACIONES (
    id_publi    serial PRIMARY KEY,
    id_mascot   int NOT NULL,
    id_refug    int NOT NULL,
    fech_publi  timestamp NOT NULL DEFAULT now(),
    fech_baja   timestamp,
    arch_publi  text NOT NULL,
    decrip_publi text NOT NULL,
    est_adop    boolean NOT NULL DEFAULT false,
    est_publi   boolean NOT NULL DEFAULT true,

    FOREIGN KEY (id_mascot) REFERENCES MASCOTAS(id_mascot),
    FOREIGN KEY (id_refug)  REFERENCES REFUGIOS(id_refug)
);

-- =========================
-- SOLICITUDES DE ADOPCIÓN (sin cambios)
-- =========================

CREATE TABLE SOLI_ADOP (
    id_soli    serial PRIMARY KEY,
    id_usuario int NOT NULL,
    id_publi   int NOT NULL,
    id_est     int NOT NULL,
    fech_soli  timestamp NOT NULL DEFAULT now(),
    decrip_soli text NOT NULL,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_publi)   REFERENCES PUBLICACIONES(id_publi),
    FOREIGN KEY (id_est)     REFERENCES ESTAD_SOLI(id_est)
);

-- =========================
-- HISTORIAL (sin cambios)
-- =========================

CREATE TABLE HISTO_ADOP (
    id_ha   serial PRIMARY KEY,
    id_soli int NOT NULL,
    FOREIGN KEY (id_soli) REFERENCES SOLI_ADOP(id_soli)
);

-- =========================
-- NOTIFICACIONES (sin cambios)
-- =========================

CREATE TABLE NOTIFICACIONES (
    id_notif    serial PRIMARY KEY,
    id_usuario  int  NOT NULL,
    tipo_notif  varchar(50)  NOT NULL,
    titulo_notif varchar(150) NOT NULL,
    cuerpo_notif text NOT NULL,
    leida       boolean   NOT NULL DEFAULT false,
    fech_notif  timestamp NOT NULL DEFAULT now(),
    ref_id      int,

    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =========================
-- DATOS INICIALES
-- =========================

INSERT INTO ROLES (nom_rol)
VALUES ('administrador'), ('adoptante'), ('refugio');

INSERT INTO ESTAD_SOLI (id_est, nom_est)
VALUES
(1, 'enviada'),
(2, 'en revisión'),
(3, 'aprobada'),
(4, 'rechazada'),
(5, 'completada');

INSERT INTO ESPECIES (nom_espe)
VALUES ('Perro'), ('Gato'), ('Ave'), ('Conejo'), ('Hamster'), ('Reptil'), ('Otro');