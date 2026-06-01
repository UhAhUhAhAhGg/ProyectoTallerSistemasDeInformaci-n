// ═══════════════════════════════════════════════════════════════
// TIPOS: Observaciones de Adaptación y Seguimiento
// ═══════════════════════════════════════════════════════════════

export interface ObservacionAdaptacion {
  id_obs: number;
  id_soli: number;
  id_refug: number;
  descripcion: string;
  fech_obs: Date;
}

export interface CreateObservacionDto {
  id_soli: number;
  descripcion: string;
}

export interface SeguimientoAdopcion {
  id_seg: number;
  id_soli: number;
  id_usuario: number;
  descripcion: string;
  fech_seg: Date;
}

export interface CreateSeguimientoDto {
  id_soli: number;
  descripcion: string;
}
