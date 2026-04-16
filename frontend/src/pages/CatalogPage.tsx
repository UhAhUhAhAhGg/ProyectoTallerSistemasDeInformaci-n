import React, { useEffect, useState } from 'react';
import './CatalogPage.css';
import FilterSidebar from '../components/catalog/FilterSideBar';
import { getPets, getRefugios } from '../services/pets.service';
import type { Pet, PetFilters } from '../types/pet';

const initialFilters: PetFilters = {
  especie: '',
  tamano: '',
  edad: '',
  zonaGeografica: '',
  refugioId: '',
};

function CatalogPage() {
  const [filters, setFilters] = useState<PetFilters>(initialFilters);
  const [pets, setPets] = useState<Pet[]>([]);
  const [refugios, setRefugios] = useState<{ id: number; nombre: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPets(filters).then(setPets).catch(console.error);
    getRefugios().then(setRefugios).catch(console.error);
  }, []);

  const activeFilters: string[] = [];

  if (filters.especie) activeFilters.push(filters.especie);
  if (filters.tamano) activeFilters.push(filters.tamano);
  if (filters.edad) activeFilters.push(filters.edad);

  // 👇 AQUÍ VA TU RETURN
  return (
    <div className="page">
      <header className="header">
        <div className="brand">Pets-Up</div>

        <nav className="nav">
          <span className="active">Catálogo</span>
          <span>Mis solicitudes</span>
          <span>Seguimiento</span>
          <span>Mensajes</span>
        </nav>

        <div className="avatar" />
      </header>

      <div className="container">
        <FilterSidebar
          filters={filters}
          refugios={refugios}
          onChange={(name, value) =>
            setFilters((prev) => ({ ...prev, [name]: value }))
          }
          onApply={() => getPets(filters).then(setPets)}
          onClear={() => {
            setFilters(initialFilters);
            getPets(initialFilters).then(setPets);
          }}
        />

        <main className="content">
          <h1 className="title">Catálogo de mascotas</h1>
          <p className="subtitle">{pets.length} animales disponibles</p>

          <div className="topbar">
            <input className="search" placeholder="Buscar..." />
            <button className="ai-btn">Ver mi feed IA</button>
          </div>

          <div className="filters-info">
            <span>{pets.length} resultados</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="chip">{f}</span>
            ))}
          </div>

          <div className="grid">
            {pets.map((pet) => (
              <div key={pet.id} className="card">
                <div className="card-image">
                  🐕
                  <div className="match">90%</div>
                </div>

                <div className="card-body">
                  <h3>{pet.nombre}</h3>
                  <p>{pet.especie} · {pet.edad}</p>
                  <p>{pet.refugioNombre}</p>
                  <button className="btn">Ver perfil</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CatalogPage;