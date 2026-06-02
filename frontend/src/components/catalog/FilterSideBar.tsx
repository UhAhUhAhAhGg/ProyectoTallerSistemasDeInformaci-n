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

const FilterSideBar: React.FC<Props> = ({ filters, refugios, onChange, onApply, onClear }) => {

  // Toggle: si ya está activo, lo deselecciona; si no, lo selecciona y aplica
  const toggle = (name: keyof PetFilters, value: string) => {
    const nuevo = filters[name] === value ? '' : value;
    onChange(name, nuevo);
    // auto-apply después del tick para que el estado se actualice
    setTimeout(onApply, 0);
  };

  const especieOpciones = [
    { valor: 'Perro',  label: '🐶 Perros' },
    { valor: 'Gato',   label: '🐱 Gatos'  },
    { valor: 'Ave',    label: '🐦 Aves'   },
    { valor: 'Conejo', label: '🐰 Conejos'},
    { valor: 'Otro',   label: '🐾 Otro'   },
  ];

  const edadOpciones = [
    { valor: 'cachorro', label: 'Cachorro (0-1 año)' },
    { valor: 'joven',    label: 'Joven (1-3 años)'   },
    { valor: 'adulto',   label: 'Adulto (3-8 años)'  },
    { valor: 'senior',   label: 'Senior (8+ años)'   },
  ];

  const hayFiltros = !!(filters.especie || filters.edad || filters.zonaGeografica || filters.refugioId);

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Filtros</h3>
        {hayFiltros && (
          <button
            className="clear-btn"
            onClick={onClear}
            style={{ fontSize: 12, padding: '4px 10px' }}
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* ESPECIE */}
      <div className="filter-group">
        <h4>Especie</h4>
        <div className="filter-options">
          {especieOpciones.map(({ valor, label }) => (
            <button
              key={valor}
              className={`filter-btn ${filters.especie === valor ? 'active' : ''}`}
              onClick={() => toggle('especie', valor)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* EDAD */}
      <div className="filter-group">
        <h4>Edad</h4>
        <div className="filter-options">
          {edadOpciones.map(({ valor, label }) => (
            <button
              key={valor}
              className={`filter-btn ${filters.edad === valor ? 'active' : ''}`}
              onClick={() => toggle('edad', valor)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* REFUGIO */}
      {refugios.length > 0 && (
        <div className="filter-group">
          <h4>Refugio</h4>
          <div className="filter-options">
            {refugios.map((r) => (
              <button
                key={r.id}
                className={`filter-btn ${filters.refugioId === String(r.id) ? 'active' : ''}`}
                onClick={() => toggle('refugioId', String(r.id))}
              >
                {r.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ZONA GEOGRÁFICA */}
      <div className="filter-group">
        <h4>Zona geográfica</h4>
        <input
          className="filter-input"
          type="search"
          value={filters.zonaGeografica}
          onChange={(e) => onChange('zonaGeografica', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onApply(); }}
          placeholder="Ej: Centro, Norte, Sopocachi"
        />
        {filters.zonaGeografica && (
          <button
            className="apply-btn"
            onClick={onApply}
            style={{ marginTop: 8, width: '100%' }}
          >
            Buscar zona
          </button>
        )}
      </div>
    </aside>
  );
};

export default FilterSideBar;