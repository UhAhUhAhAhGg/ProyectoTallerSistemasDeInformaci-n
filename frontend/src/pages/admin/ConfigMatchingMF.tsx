import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const PETS_URL = import.meta.env.VITE_PETS_URL || 'http://localhost:3003';

interface Config {
  umbral_minimo: number;
  max_resultados: number;
  peso_especie: number;
  peso_edad: number;
  peso_espacio: number;
  peso_tiempo: number;
  peso_experiencia: number;
  priorizar_tiempo_refugio: boolean;
  usar_ia: boolean;
}

const DEFAULT_CONFIG: Config = {
  umbral_minimo: 40,
  max_resultados: 10,
  peso_especie: 30,
  peso_edad: 20,
  peso_espacio: 20,
  peso_tiempo: 15,
  peso_experiencia: 15,
  priorizar_tiempo_refugio: true,
  usar_ia: true,
};

const SliderField = ({
  label, value, onChange, hint,
}: { label: string; value: number; onChange: (v: number) => void; hint?: string }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <label style={{ fontWeight: 600, fontSize: 14 }}>{label}</label>
      <strong style={{ fontSize: 14, color: '#4f46e5' }}>{value}</strong>
    </div>
    <input
      type="range" min={0} max={100} step={5} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: '#4f46e5' }}
    />
    {hint && <small style={{ color: '#6b7280', fontSize: 12 }}>{hint}</small>}
  </div>
);

const ConfigMatchingMF: React.FC = () => {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${PETS_URL}/recomendaciones/config`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.data) setConfig(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const guardar = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(`${PETS_URL}/recomendaciones/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setMensaje({ tipo: 'ok', texto: 'Configuración guardada correctamente.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudo guardar la configuración.' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Cargando configuración...</p>;

  const totalPesos = config.peso_especie + config.peso_edad + config.peso_espacio + config.peso_tiempo + config.peso_experiencia;

  return (
    <div style={{ maxWidth: 600, padding: '0 4px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Configuración del Motor de Matching</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
          Ajusta los pesos y umbral del algoritmo de compatibilidad entre adoptantes y mascotas.
        </p>
      </div>

      {/* Toggle IA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: config.usar_ia ? '#ede9fe' : '#f3f4f6', borderRadius: 10, marginBottom: 24 }}>
        <input
          type="checkbox" id="usar_ia" checked={config.usar_ia}
          onChange={(e) => setConfig((c) => ({ ...c, usar_ia: e.target.checked }))}
          style={{ width: 18, height: 18, accentColor: '#4f46e5' }}
        />
        <label htmlFor="usar_ia" style={{ fontWeight: 600, cursor: 'pointer' }}>
          {config.usar_ia ? 'Motor IA activo (Groq / Llama 3.3 70B)' : 'Motor de reglas activo (IA desactivada)'}
        </label>
      </div>

      {/* Umbral y resultados */}
      <div style={{ background: '#f9fafb', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <SliderField
          label="Umbral mínimo de compatibilidad (%)"
          value={config.umbral_minimo}
          onChange={(v) => setConfig((c) => ({ ...c, umbral_minimo: v }))}
          hint="Solo se muestran mascotas con score >= este valor"
        />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Máximo de resultados: {config.max_resultados}</label>
          <input
            type="number" min={1} max={50} value={config.max_resultados}
            onChange={(e) => setConfig((c) => ({ ...c, max_resultados: Number(e.target.value) }))}
            style={{ marginLeft: 12, width: 60, padding: '4px 8px', borderRadius: 6,
              border: '1px solid #d1d5db', fontSize: 14 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox" id="priorizar"
            checked={config.priorizar_tiempo_refugio}
            onChange={(e) => setConfig((c) => ({ ...c, priorizar_tiempo_refugio: e.target.checked }))}
            style={{ accentColor: '#4f46e5' }}
          />
          <label htmlFor="priorizar" style={{ fontSize: 14, cursor: 'pointer' }}>
            Priorizar animales con más tiempo en el refugio (+puntos extra)
          </label>
        </div>
      </div>

      {/* Pesos */}
      <div style={{ background: '#f9fafb', borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>Pesos de criterios</h3>
          <span style={{ fontSize: 13, color: totalPesos === 100 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            Total: {totalPesos}/100 {totalPesos !== 100 && '⚠ recomienda sumar 100'}
          </span>
        </div>
        <SliderField label="Peso: Especie preferida" value={config.peso_especie}
          onChange={(v) => setConfig((c) => ({ ...c, peso_especie: v }))} />
        <SliderField label="Peso: Edad preferida" value={config.peso_edad}
          onChange={(v) => setConfig((c) => ({ ...c, peso_edad: v }))} />
        <SliderField label="Peso: Espacio / vivienda" value={config.peso_espacio}
          onChange={(v) => setConfig((c) => ({ ...c, peso_espacio: v }))} />
        <SliderField label="Peso: Disponibilidad de tiempo" value={config.peso_tiempo}
          onChange={(v) => setConfig((c) => ({ ...c, peso_tiempo: v }))} />
        <SliderField label="Peso: Experiencia previa" value={config.peso_experiencia}
          onChange={(v) => setConfig((c) => ({ ...c, peso_experiencia: v }))} />
      </div>

      {mensaje && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16,
          background: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
          color: mensaje.tipo === 'ok' ? '#166534' : '#991b1b', fontSize: 14 }}>
          {mensaje.texto}
        </div>
      )}

      <button onClick={guardar} disabled={guardando}
        style={{ padding: '10px 28px', background: '#4f46e5', color: '#fff', border: 'none',
          borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer',
          opacity: guardando ? 0.7 : 1 }}>
        {guardando ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
};

export default ConfigMatchingMF;