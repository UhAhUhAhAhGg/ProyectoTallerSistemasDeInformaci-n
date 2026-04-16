const pets = [
  {
    id: 1,
    nombre: 'Luna',
    especie: 'perro',
    tamano: 'pequeno',
    edad: 'adulto',
    zonaGeografica: 'Sopocachi',
    refugioId: 1,
    refugioNombre: 'Refugio Los Amigos',
  },
  {
    id: 2,
    nombre: 'Michi',
    especie: 'gato',
    tamano: 'pequeno',
    edad: 'cachorro',
    zonaGeografica: 'Miraflores',
    refugioId: 2,
    refugioNombre: 'Patitas Felices',
  },
  {
    id: 3,
    nombre: 'Max',
    especie: 'perro',
    tamano: 'grande',
    edad: 'adulto',
    zonaGeografica: 'Calacoto',
    refugioId: 1,
    refugioNombre: 'Refugio Los Amigos',
  },
];

exports.getFilteredPets = (req, res) => {
  const { especie, tamano, edad, zonaGeografica, refugioId } = req.query;

  let result = [...pets];

  if (especie) {
    result = result.filter((pet) => pet.especie === especie);
  }

  if (tamano) {
    result = result.filter((pet) => pet.tamano === tamano);
  }

  if (edad) {
    result = result.filter((pet) => pet.edad === edad);
  }

  if (zonaGeografica) {
    result = result.filter((pet) =>
      pet.zonaGeografica.toLowerCase().includes(zonaGeografica.toLowerCase())
    );
  }

  if (refugioId) {
    result = result.filter((pet) => pet.refugioId === Number(refugioId));
  }

  res.json(result);
};