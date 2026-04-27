import { useState } from 'react'
import { cambiarEstado } from './shared/animal.service'
import type { EstadoAnimal, Publicacion } from './shared/animal.types'

interface Props {
  publicacion: Publicacion
  estadoActual: EstadoAnimal
  onSuccess?: (nuevo: EstadoAnimal) => void
  onCancel?: () => void
}

const ESTADOS: { val: EstadoAnimal; label: string; desc: string; color: string; bg: string }[] = [
  { val: 'disponible',     label: '🟢 Disponible',     desc: 'Visible en catálogo, acepta solicitudes',   color: '#2e7d32', bg: '#e8f5e9' },
  { val: 'en_proceso',     label: '🟡 En proceso',      desc: 'Solicitud activa, sin nuevas postulaciones', color: '#b45309', bg: '#fffbeb' },
  { val: 'en_tratamiento', label: '🔵 En tratamiento',  desc: 'Fuera del catálogo por motivos de salud',   color: '#1565c0', bg: '#e3f2fd' },
  { val: 'adoptado',       label: '⭐ Adoptado',         desc: 'Proceso completado, baja automática',       color: '#4a148c', bg: '#f3e5f5' },
]

export default function AnimalStatusMF({ publicacion, estadoActual, onSuccess, onCancel }: Props) {
  const [selected, setSelected] = useState<EstadoAnimal>(estadoActual)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const changed = selected !== estadoActual

  const submit = async () => {
    if (!changed) return
    setLoading(true); setErr('')
    try {
      await cambiarEstado(publicacion.id_publi, selected)
      onSuccess?.(selected)
    } catch (e: any) {
      setErr(e.response?.data?.mensaje || 'Error al cambiar estado')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, margin: '0 0 6px', color: '#1a1a1a' }}>
        Cambiar estado
      </h2>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
        Estado actual: <strong style={{ color: '#1a1a1a' }}>{estadoActual.replace('_', ' ')}</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ESTADOS.map(({ val, label, desc, color, bg }) => {
          const active = selected === val
          return (
            <button key={val} type="button" onClick={() => setSelected(val)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', background: active ? bg : 'white', border: `2px solid ${active ? color : '#e8e8e8'}`, transition: 'all .15s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${color}`, background: active ? color : 'white', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: active ? color : '#333' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {err && <div style={{ marginTop: 12, padding: 10, background: '#fee', border: '1px solid #fcc', color: '#c33', borderRadius: 8, fontSize: 13 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', background: 'transparent', border: '2px solid #e0e0e0', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
        <button onClick={submit} disabled={!changed || loading}
          style={{ padding: '10px 22px', background: changed ? '#96c6b5' : '#e0e0e0', color: changed ? '#1a1a1a' : '#999', border: 'none', borderRadius: 10, cursor: changed ? 'pointer' : 'default', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
          {loading ? 'Aplicando...' : 'Aplicar estado'}
        </button>
      </div>
    </div>
  )
}
