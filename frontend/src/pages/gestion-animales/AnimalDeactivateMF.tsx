// HU-11 — Dar de baja a un animal del catálogo (soft delete)
import { useState } from 'react'
import { darDeBaja } from './shared/animal.service'
import type { Publicacion } from './shared/animal.types'

interface Props {
  publicacion: Publicacion
  nombreAnimal: string
  onSuccess?: () => void
  onCancel?: () => void
}

const MOTIVOS = [
  'Ya fue adoptado por otra vía',
  'Falleció',
  'Fue transferido a otro refugio',
  'Requiere tratamiento prolongado',
  'Otro motivo',
]

export default function AnimalDeactivateMF({ publicacion, nombreAnimal, onSuccess, onCancel }: Props) {
  const [motivo, setMotivo] = useState('')
  const [motivoCustom, setMotivoCustom] = useState('')
  const [confirmar, setConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const motivoFinal = motivo === 'Otro motivo' ? motivoCustom : motivo
  const puedeConfirmar = !!motivoFinal.trim()

  const submit = async () => {
    if (!puedeConfirmar) return
    setLoading(true); setErr('')
    try {
      await darDeBaja(publicacion.id_publi, motivoFinal)
      onSuccess?.()
    } catch (e: any) {
      setErr(e.response?.data?.mensaje || 'Error al dar de baja')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <div style={{ background: '#fdecea', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontWeight: 600, color: '#c62828', fontSize: 14, marginBottom: 4 }}>⚠️ Dar de baja: {nombreAnimal}</div>
        <div style={{ fontSize: 13, color: '#e53e3e' }}>
          El animal dejará de aparecer en el catálogo y no recibirá nuevas solicitudes. Esta acción puede revertirse.
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 10 }}>Motivo de baja *</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOTIVOS.map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#444' }}>
              <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} style={{ accentColor: '#e4adcc' }} />
              {m}
            </label>
          ))}
        </div>
        {motivo === 'Otro motivo' && (
          <textarea value={motivoCustom} onChange={e => setMotivoCustom(e.target.value)} placeholder="Describe el motivo..." rows={3}
            style={{ marginTop: 10, width: '100%', padding: '8px 12px', border: '2px solid #e8e8e8', borderRadius: 8, fontSize: 13, resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
        )}
      </div>

      {puedeConfirmar && !confirmar && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#444', marginBottom: 16 }}>
          <input type="checkbox" checked={confirmar} onChange={e => setConfirmar(e.target.checked)} style={{ accentColor: '#e53e3e', width: 16, height: 16 }} />
          Confirmo que deseo dar de baja a <strong style={{ marginLeft: 4 }}>{nombreAnimal}</strong>
        </label>
      )}
      {confirmar && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#c62828', marginBottom: 16, background: '#fdecea', padding: '8px 12px', borderRadius: 8 }}>
          <input type="checkbox" checked={confirmar} onChange={e => setConfirmar(e.target.checked)} style={{ accentColor: '#e53e3e', width: 16, height: 16 }} />
          Confirmo que deseo dar de baja a <strong style={{ marginLeft: 4 }}>{nombreAnimal}</strong>
        </label>
      )}

      {err && <div style={{ padding: 10, background: '#fee', border: '1px solid #fcc', color: '#c33', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', background: 'transparent', border: '2px solid #e0e0e0', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Cancelar</button>
        <button onClick={submit} disabled={!confirmar || !puedeConfirmar || loading}
          style={{ padding: '10px 22px', background: confirmar && puedeConfirmar ? '#c62828' : '#e0e0e0', color: confirmar && puedeConfirmar ? 'white' : '#999', border: 'none', borderRadius: 10, cursor: confirmar ? 'pointer' : 'default', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
          {loading ? 'Procesando...' : 'Dar de baja'}
        </button>
      </div>
    </div>
  )
}
