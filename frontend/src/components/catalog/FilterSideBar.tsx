import React from 'react';
import './FilterSideBar.css';
import type { PetFilters } from '../../types/pet';

interface Refugio {
  id: number;
  nombre: string;
}

interface Props {
  filters: PetFilters;
  refugios: Refugio[];
  onChange: (name: keyof PetFilters, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}

const FilterSideBar: React.FC<Props> = ({
  filters,
  refugios,
  onChange,
  onApply,
  onClear,
}) => {
  return (
    <aside className="sidebar">
      <h3>Filtros</h3>

      {/* ESPECIE */}
      <div className="filter-group">
        <h4>Especie</h4>
        <div className="filter-options">
          <button
            className={`filter-btn ${filters.especie === 'perro' ? 'active' : ''}`}
            onClick={() => onChange('especie', 'perro')}
          >
            🐶 Perros
          </button>

          <button
            className={`filter-btn ${filters.especie === 'gato' ? 'active' : ''}`}
            onClick={() => onChange('especie', 'gato')}
          >
            🐱 Gatos
          </button>
        </div>
      </div>

      {/* TAMAÑO */}
      <div className="filter-group">
        <h4>Tamaño</h4>
        <div className="filter-options">
          {['pequeno', 'mediano', 'grande'].map((t) => (
            <button
              key={t}
              className={`filter-btn ${filters.tamano === t ? 'active' : ''}`}
              onClick={() => onChange('tamano', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* EDAD */}
      <div className="filter-group">
        <h4>Edad</h4>
        <div className="filter-options">
          {['cachorro', 'adulto', 'senior'].map((e) => (
            <button
              key={e}
              className={`filter-btn ${filters.edad === e ? 'active' : ''}`}
              onClick={() => onChange('edad', e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* REFUGIO */}
      <div className="filter-group">
        <h4>Refugio</h4>
        <div className="filter-options">
          {refugios.map((r) => (
            <button
              key={r.id}
              className={`filter-btn ${filters.refugioId === String(r.id) ? 'active' : ''}`}
              onClick={() => onChange('refugioId', String(r.id))}
            >
              {r.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* ZONA GEOGRÁFICA */}
      <div className="filter-group">
        <h4>Zona geográfica</h4>
        <input
          className="filter-input"
          type="search"
          value={filters.zonaGeografica}
          onChange={(e) => onChange('zonaGeografica', e.target.value)}
          placeholder="Ej: Centro, Norte, Sopocachi"
        />
      </div>

      {/* BOTONES */}
      <div className="sidebar-actions">
        <button className="apply-btn" onClick={onApply}>
          Aplicar filtros
        </button>

        <button className="clear-btn" onClick={onClear}>
          Limpiar
        </button>
      </div>
    </aside>
  );
};

export default FilterSideBar;
