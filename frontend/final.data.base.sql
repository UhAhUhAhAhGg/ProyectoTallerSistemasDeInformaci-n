-- ============================================================
-- SCHEMA COMPLETO - PetMatch
-- ============================================================

-- =========================
-- TABLAS BASE
-- =========================

CREATE TABLE ESPECIES (
    id_espe  serial PRIMARY KEY,
    nom_espe varchar(50) NOT NULL
);

CREATE TABLE RAZAS (
    id_raza  serial PRIMARY KEY,
    id_espe  int NOT NULL,
    nom_raza varchar(50) NOT NULL,
    FOREIGN KEY (id_espe) REFERENCES ESPECIES(id_espe)
);

CREATE TABLE ROLES (
    id_rol  serial PRIMARY KEY,
    nom_rol varchar(50) NOT NULL
);

CREATE TABLE ESTAD_SOLI (
    id_est  int PRIMARY KEY,
    nom_est varchar(30) NOT NULL
);

-- =========================
-- USUARIOS
-- =========================

CREATE TABLE USUARIOS (
    id_usuario     serial PRIMARY KEY,
    id_rol         int          NOT NULL,
    corr_usuario   varchar(100) NOT NULL UNIQUE,
    contra_usuario varchar(255) NOT NULL,
    nom_usuario    varchar(80)  NOT NULL,
    apell_usuario  varchar(80)  NOT NULL,
    est_usuario    varchar(20)  NOT NULL DEFAULT 'incompleto',
    telf_usuario   varchar(20),
    fenac_usuario  date,
    gen_usuario    boolean,
    direc_usuario  text,
    fecha_registro timestamp    NOT NULL DEFAULT now(),
    FOREIGN KEY (id_rol) REFERENCES ROLES(id_rol)
);

-- =========================
-- PERFIL ADOPTANTE
-- =========================

CREATE TABLE PERFIL_ADOPTANTE (
    id_perfil     serial PRIMARY KEY,
    id_usuario    int         NOT NULL UNIQUE,
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
    FOREIGN KEY (id_usuario)   REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (pref_especie) REFERENCES ESPECIES(id_espe)
);

-- =========================
-- REFUGIOS
-- =========================

CREATE TABLE REFUGIOS (
    id_refug       serial PRIMARY KEY,
    id_usuario     int          NOT NULL UNIQUE,
    nom_refug      varchar(80)  NOT NULL,
    dir_refug      varchar(200) NOT NULL,
    telf_refug     varchar(20)  NOT NULL,
    licencia_refug varchar(200) NOT NULL,
    descripcion    text,
    est_aprobacion varchar(20)  NOT NULL DEFAULT 'pendiente',
    fecha_solicitud timestamp   NOT NULL DEFAULT now(),
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =========================
-- MASCOTAS
-- =========================

CREATE TABLE MASCOTAS (
    id_mascot      serial PRIMARY KEY,
    id_raza        int     NOT NULL,
    img_mascot     text    NOT NULL,
    nom_mascot     varchar(80) NOT NULL,
    edad_mascot    int     NOT NULL,
    fenac_mascot   date    NOT NULL,
    descrip_mascot text    NOT NULL,
    gen_mascot     boolean NOT NULL,
    esterilizado   boolean NOT NULL,
    FOREIGN KEY (id_raza) REFERENCES RAZAS(id_raza)
);

-- =========================
-- PUBLICACIONES
-- =========================

CREATE TABLE PUBLICACIONES (
    id_publi     serial PRIMARY KEY,
    id_mascot    int       NOT NULL,
    id_refug     int       NOT NULL,
    fech_publi   timestamp NOT NULL DEFAULT now(),
    fech_baja    timestamp,
    arch_publi   text      NOT NULL,
    decrip_publi text      NOT NULL,
    est_adop     boolean   NOT NULL DEFAULT false,
    est_publi    boolean   NOT NULL DEFAULT true,
    FOREIGN KEY (id_mascot) REFERENCES MASCOTAS(id_mascot),
    FOREIGN KEY (id_refug)  REFERENCES REFUGIOS(id_refug)
);

-- =========================
-- SOLICITUDES DE ADOPCIÓN
-- =========================

CREATE TABLE SOLI_ADOP (
    id_soli     serial PRIMARY KEY,
    id_usuario  int       NOT NULL,
    id_publi    int       NOT NULL,
    id_est      int       NOT NULL,
    fech_soli   timestamp NOT NULL DEFAULT now(),
    decrip_soli text      NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario),
    FOREIGN KEY (id_publi)   REFERENCES PUBLICACIONES(id_publi),
    FOREIGN KEY (id_est)     REFERENCES ESTAD_SOLI(id_est)
);

-- =========================
-- HISTORIAL DE ADOPCIÓN
-- =========================

CREATE TABLE HISTO_ADOP (
    id_ha             serial PRIMARY KEY,
    id_soli           int       NOT NULL,
    id_est_anterior   int       NOT NULL DEFAULT 1,
    id_est_nuevo      int       NOT NULL DEFAULT 1,
    motivo            text      NOT NULL DEFAULT '',
    fech_cambio       timestamp NOT NULL DEFAULT now(),
    id_usuario_accion int       NOT NULL DEFAULT 0,
    FOREIGN KEY (id_soli)         REFERENCES SOLI_ADOP(id_soli),
    FOREIGN KEY (id_est_anterior) REFERENCES ESTAD_SOLI(id_est),
    FOREIGN KEY (id_est_nuevo)    REFERENCES ESTAD_SOLI(id_est)
);

-- =========================
-- OBSERVACIONES DE ADAPTACIÓN
-- =========================

CREATE TABLE observa_adapt (
    id_obs      serial PRIMARY KEY,
    id_soli     int       NOT NULL,
    id_refug    int       NOT NULL,
    descripcion text      NOT NULL,
    fech_obs    timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_soli)  REFERENCES SOLI_ADOP(id_soli)  ON DELETE CASCADE,
    FOREIGN KEY (id_refug) REFERENCES REFUGIOS(id_refug)  ON DELETE CASCADE
);

-- =========================
-- SEGUIMIENTO DE ADOPCIÓN
-- =========================

CREATE TABLE segui_adop (
    id_seg      serial PRIMARY KEY,
    id_soli     int       NOT NULL,
    id_usuario  int       NOT NULL,
    descripcion text      NOT NULL,
    fech_seg    timestamp NOT NULL DEFAULT NOW(),
    FOREIGN KEY (id_soli)    REFERENCES SOLI_ADOP(id_soli)   ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =========================
-- NOTIFICACIONES
-- =========================

CREATE TABLE NOTIFICACIONES (
    id_notif     serial PRIMARY KEY,
    id_usuario   int          NOT NULL,
    tipo_notif   varchar(50)  NOT NULL,
    titulo_notif varchar(150) NOT NULL,
    cuerpo_notif text         NOT NULL,
    leida        boolean      NOT NULL DEFAULT false,
    fech_notif   timestamp    NOT NULL DEFAULT now(),
    ref_id       int,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- =========================
-- ÍNDICES
-- =========================

CREATE INDEX idx_observa_adapt_soli   ON observa_adapt(id_soli);
CREATE INDEX idx_observa_adapt_refug  ON observa_adapt(id_refug);
CREATE INDEX idx_segui_adop_soli      ON segui_adop(id_soli);
CREATE INDEX idx_segui_adop_usuario   ON segui_adop(id_usuario);

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
    (5, 'en espera');

INSERT INTO ESPECIES (nom_espe)
VALUES ('Perro'), ('Gato'), ('Ave'), ('Conejo'), ('Hamster'), ('Reptil'), ('Otro');

-- =========================
-- MENSAJERÍA
-- =========================

CREATE TABLE IF NOT EXISTS CONVERSACIONES (
    id_conv     serial PRIMARY KEY,
    id_soli     int       NOT NULL UNIQUE,
    creado_en   timestamp NOT NULL DEFAULT now(),
    FOREIGN KEY (id_soli) REFERENCES SOLI_ADOP(id_soli) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MENSAJES (
    id_msg      serial PRIMARY KEY,
    id_conv     int       NOT NULL,
    id_usuario  int       NOT NULL,
    contenido   text      NOT NULL,
    enviado_en  timestamp NOT NULL DEFAULT now(),
    FOREIGN KEY (id_conv)    REFERENCES CONVERSACIONES(id_conv) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_mensajes_conv ON MENSAJES(id_conv);

-- =========================
-- HU-05: Recuperación de contraseña
-- =========================

CREATE TABLE IF NOT EXISTS PASSWORD_RESET_TOKENS (
    id_usuario  INTEGER PRIMARY KEY REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
    token       VARCHAR(64) NOT NULL UNIQUE,
    expira_en   TIMESTAMPTZ NOT NULL,
    usado       BOOLEAN     NOT NULL DEFAULT false,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);