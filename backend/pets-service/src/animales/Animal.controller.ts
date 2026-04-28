import { Request, Response } from 'express';
import * as repo from '../animales/Animal.repository';
import { ok, created, badRequest, notFound, serverError } from '../utils/response.helper';

// HU-07: registrar mascota — fenac_mascot es opcional (default = hoy)
export const registrarAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id_raza, nom_mascot, edad_mascot,
      descrip_mascot, gen_mascot, esterilizado, img_mascot,
      fenac_mascot,   // opcional
    } = req.body;

    if (!id_raza || !nom_mascot || edad_mascot === undefined || !descrip_mascot || !img_mascot) {
      badRequest(res, 'Faltan campos requeridos: id_raza, nom_mascot, edad_mascot, descrip_mascot, img_mascot');
      return;
    }

    const animal = await repo.createAnimal({
      id_raza:        Number(id_raza),
      nom_mascot,
      edad_mascot:    Number(edad_mascot),
      fenac_mascot:   fenac_mascot || new Date().toISOString().slice(0, 10),
      descrip_mascot,
      gen_mascot:     gen_mascot ?? true,
      esterilizado:   esterilizado ?? false,
      img_mascot,
    });
    created(res, animal, 'Mascota registrada exitosamente');
  } catch (err) {
    serverError(res, err instanceof Error ? err.message : 'Error al registrar mascota');
  }
};

// HU-08: editar mascota
export const editarAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const animal = await repo.updateAnimal(id, req.body);
    if (!animal) { notFound(res, 'Mascota no encontrada'); return; }
    ok(res, animal, 'Mascota actualizada');
  } catch {
    serverError(res);
  }
};

// Listar animales del refugio autenticado
export const listarAnimales = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_refug = req.user!.id_refug;
    const animales = id_refug
      ? await repo.findAnimalesByRefugio(id_refug)
      : await repo.findAllAnimales();
    ok(res, animales);
  } catch {
    serverError(res);
  }
};

export const obtenerAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const animal = await repo.findAnimalById(Number(req.params.id));
    if (!animal) { notFound(res); return; }
    ok(res, animal);
  } catch {
    serverError(res);
  }
};

// Catálogo: razas (filtra por ?id_espe=X) y especies
export const listarRazas = async (req: Request, res: Response): Promise<void> => {
  try {
    const id_espe = req.query.id_espe ? Number(req.query.id_espe) : undefined;
    ok(res, await repo.findAllRazas(id_espe));
  } catch { serverError(res); }
};

export const listarEspecies = async (_req: Request, res: Response): Promise<void> => {
  try { ok(res, await repo.findAllEspecies()); } catch { serverError(res); }
};