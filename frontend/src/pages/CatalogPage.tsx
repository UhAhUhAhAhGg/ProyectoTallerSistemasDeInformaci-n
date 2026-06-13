import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/catalog/FilterSideBar';
import PetDetailModal from '../components/catalog/PetDetailModal';
import { getPets, getRefugios } from '../services/pets.service';
import type { PetFilters } from '../types/pet';
import './CatalogPage.css';
import EnviarSolicitudMF from './gestion-solicitudes/EnviarSolicitudMF';
import Navbar from './Navbar';

interface CatalogItem {
  id_publi:      number;
  id_refug:      number;
  fech_publi:    string;
  arch_publi:    string | null;
  decrip_publi:  string;
  id_mascot:     number;
  nom_mascot:    string;
  edad_mascot:   number;
  gen_mascot:    boolean;
  esterilizado:  boolean;
  img_mascot:    string | null;
  descrip_mascot?: string;
  nom_raza:      string;
  nom_espe:      string;
  nom_refug:     string;
  dir_refug:     string;
  telf_refug?:   string;
}

const initialFilters: PetFilters = {
  especie:        '',
  edad:           '',
  zonaGeografica: '',
  refugioId:      '',
  tamano:         '',
};

export default function CatalogPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PetFilters>({
  especie: '', edad: '', zonaGeografica: '', refugioId: '', tamano: '',});
  const [busqueda, setBusqueda]       = useState('');
  const [pets, setPets]               = useState<CatalogItem[]>([]);
  const [refugios, setRefugios]       = useState<{ id: number; nombre: string }[]>([]);
  const [cargando, setCargando]       = useState(false);
  const [solicitando, setSolicitando] = useState<CatalogItem | null>(null);
  const [detalle, setDetalle]         = useState<CatalogItem | null>(null);

  const userRol = localStorage.getItem('rol');
  const userId  = Number(localStorage.getItem('userId') || 0);

  const cargarPets = (f: PetFilters = filters, q = busqueda) => {
    setCargando(true);
    getPets({ ...f, busqueda: q.trim() })
      .then(setPets)
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarPets(initialFilters, '');
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

  const activeFilters = [
    filters.especie,
    filters.edad,
    filters.zonaGeografica,
    refugios.find((r) => String(r.id) === filters.refugioId)?.nombre,
  ].filter(Boolean) as string[];

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
            setBusqueda('');
            cargarPets(initialFilters, '');
          }}
        />

        <main className="content">
          <h1 className="title">Catálogo de mascotas</h1>

          <div className="topbar">
            <input
              className="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') cargarPets(filters, busqueda); }}
              placeholder="Buscar por nombre, raza, especie o refugio..."
            />
            <button className="search-btn" onClick={() => cargarPets(filters, busqueda)}>
              Buscar
            </button>
          </div>

          <div className="filters-info">
            <span>{cargando ? 'Buscando...' : `${pets.length} resultado${pets.length !== 1 ? 's' : ''}`}</span>
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
                    <span style={{ fontSize: 48 }}>
                      {pet.nom_espe === 'Gato' ? '🐱' : pet.nom_espe === 'Ave' ? '🐦' : pet.nom_espe === 'Conejo' ? '🐰' : '🐕'}
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <h3>{pet.nom_mascot}</h3>
                  <p>{pet.nom_espe} · {pet.nom_raza}</p>
                  <p style={{ fontSize: 12 }}>
                    {pet.edad_mascot} año{pet.edad_mascot !== 1 ? 's' : ''} ·{' '}
                    {pet.gen_mascot ? '♂ Macho' : '♀ Hembra'}
                    {pet.esterilizado ? ' · Esterilizado/a' : ''}
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>📍 {pet.nom_refug}</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      className="btn"
                      style={{ flex: 1, marginTop: 0 }}
                      onClick={() => setDetalle(pet)}
                    >
                      Ver detalle
                    </button>
                    {userRol === 'adoptante' && (
                      <button
                        className="btn"
                        style={{ flex: 1, marginTop: 0, background: '#c8a8c0' }}
                        onClick={() => handleSolicitar(pet)}
                      >
                        Adoptar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!cargando && pets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
              <div style={{ fontSize: 48 }}>🐾</div>
              <p>No hay mascotas que coincidan con los filtros.</p>
              {activeFilters.length > 0 && (
                <button
                  className="search-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => { setFilters(initialFilters); setBusqueda(''); cargarPets(initialFilters, ''); }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {detalle && (
        <PetDetailModal
          pet={detalle}
          onClose={() => setDetalle(null)}
          onSolicitar={
            userRol === 'adoptante'
              ? () => { setSolicitando(detalle); setDetalle(null); }
              : undefined
          }
        />
      )}

      {solicitando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 500, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
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