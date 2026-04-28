import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CatalogPage.css';
import FilterSidebar from '../components/catalog/FilterSideBar';
import { getPets, getRefugios } from '../services/pets.service';
import EnviarSolicitudMF from './gestion-solicitudes/EnviarSolicitudMF';
import type { PetFilters } from '../types/pet';
import Navbar from './Navbar';

// Lo que realmente devuelve el backend en /catalogo
interface CatalogItem {
  id_publi:     number;
  id_refug:     number;
  fech_publi:   string;
  arch_publi:   string;
  decrip_publi: string;
  id_mascot:    number;
  nom_mascot:   string;
  edad_mascot:  number;
  gen_mascot:   boolean;
  esterilizado: boolean;
  img_mascot:   string;
  nom_raza:     string;
  nom_espe:     string;
  nom_refug:    string;
  dir_refug:    string;
}

const initialFilters: PetFilters = {
  especie: '',
  tamano: '',
  edad: '',
  zonaGeografica: '',
  refugioId: '',
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const [filters, setFilters]   = useState<PetFilters>(initialFilters);
  const [pets, setPets]         = useState<CatalogItem[]>([]);
  const [refugios, setRefugios] = useState<{ id: number; nombre: string }[]>([]);
  const [solicitando, setSolicitando] = useState<CatalogItem | null>(null);

  const userName = localStorage.getItem('nombre');
  const userRol  = localStorage.getItem('rol');
  const userId   = Number(localStorage.getItem('userId') || 0);

  const cargarPets = (f: PetFilters = filters) => {
    getPets(f as any).then(setPets).catch(console.error);
  };

  useEffect(() => {
    cargarPets(initialFilters);
    getRefugios().then(setRefugios).catch(console.error);
  }, []);

  const handleSolicitar = (pet: CatalogItem) => {
    if (!userId || userRol !== 'adoptante') {
      alert('Debes iniciar sesión como adoptante para enviar una solicitud.');
      navigate('/login');
      return;
    }
    setSolicitando(pet);
  };

  const activeFilters = [filters.especie, filters.edad].filter(Boolean) as string[];

  return (
    <div className="page">
      <Navbar />

      <div className="container">
        <FilterSidebar
          filters={filters}
          refugios={refugios}
          onChange={(name, value) => setFilters((prev) => ({ ...prev, [name]: value }))}
          onApply={() => cargarPets()}
          onClear={() => {
            setFilters(initialFilters);
            cargarPets(initialFilters);
          }}
        />

        <main className="content">
          <h1 className="title">Catálogo de mascotas</h1>
          <p className="subtitle">{pets.length} animales disponibles</p>

          <div className="topbar">
            <input className="search" placeholder="Buscar por nombre..." />
          </div>

          <div className="filters-info">
            <span>{pets.length} resultados</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="chip">{f}</span>
            ))}
          </div>

          <div className="grid">
            {pets.map((pet) => (
              <div key={pet.id_publi} className="card">
                <div className="card-image">
                  {pet.img_mascot ? (
                    <img
                      src={pet.img_mascot}
                      alt={pet.nom_mascot}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 48 }}>🐕</span>
                  )}
                </div>

                <div className="card-body">
                  <h3>{pet.nom_mascot}</h3>
                  <p>{pet.nom_espe} · {pet.nom_raza}</p>
                  <p style={{ fontSize: 12 }}>
                    {pet.edad_mascot} año{pet.edad_mascot !== 1 ? 's' : ''} ·{' '}
                    {pet.gen_mascot ? '♂ Macho' : '♀ Hembra'}
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>📍 {pet.nom_refug}</p>
                  <button className="btn" onClick={() => handleSolicitar(pet)}>
                    Solicitar adopción
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
              <div style={{ fontSize: 48 }}>🐾</div>
              <p>No hay mascotas que coincidan con los filtros.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal de solicitud */}
      {solicitando && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  }}>
    <div style={{
      background: 'white', borderRadius: 16, maxWidth: 500, width: '100%',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      <EnviarSolicitudMF
        id_publ={solicitando.id_publi}
        nom_animal={solicitando.nom_mascot}
        onEnviada={() => setTimeout(() => setSolicitando(null), 1800)}
        onCancelar={() => setSolicitando(null)}
      />
    </div>
  </div>
)}
    </div>
  );
}