// Orquestador: lista animales del refugio y abre cada MF en un modal
import { useEffect, useState } from 'react'
import { getPublicacionesRefugio } from './shared/animal.service'
import type { EstadoAnimal, Publicacion } from './shared/animal.types'
import AnimalRegisterMF from './AnimalRegisterMF'
import AnimalEditMF from './AnimalEditMF'
import AnimalStatusMF from './AnimalStatusMF'
import AnimalDeactivateMF from './AnimalDeactivateMF'

type Modal = { type: 'register' } | { type: 'edit'; pub: Publicacion } | { type: 'status'; pub: Publicacion; estado: EstadoAnimal } | { type: 'baja'; pub: Publicacion }

const estadoDesde = (p: Publicacion): EstadoAnimal =>
  !p.est_publi && p.est_adop ? 'adoptado' : !p.est_publi ? 'en_tratamiento' : p.est_adop ? 'en_proceso' : 'disponible'

const ETIQUETA: Record<EstadoAnimal, { label: string; color: string; bg: string }> = {
  disponible:     { label: 'Disponible',     color: '#2e7d32', bg: '#e8f5e9' },
  en_proceso:     { label: 'En proceso',      color: '#b45309', bg: '#fffbeb' },
  en_tratamiento: { label: 'En tratamiento',  color: '#1565c0', bg: '#e3f2fd' },
  adoptado:       { label: 'Adoptado',        color: '#4a148c', bg: '#f3e5f5' },
}

export default function AnimalList() {
  const id_refug = Number(localStorage.getItem('refugioId') || 0)
  const [pubs, setPubs] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Modal | null>(null)

  const cargar = () => { setLoading(true); getPublicacionesRefugio(id_refug).then(setPubs).finally(() => setLoading(false)) }
  useEffect(cargar, [])

  const cerrar = () => { setModal(null); cargar() }

  if (modal) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 36, maxWidth: 720, width: '95%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {modal.type === 'register' && <AnimalRegisterMF onSuccess={cerrar} onCancel={cerrar} />}
        {modal.type === 'edit'     && <AnimalEditMF animal={modal.pub.animal!} id_publi={modal.pub.id_publi} onSuccess={cerrar} onCancel={cerrar} />}
        {modal.type === 'status'   && <AnimalStatusMF publicacion={modal.pub} estadoActual={modal.estado} onSuccess={cerrar} onCancel={cerrar} />}
        {modal.type === 'baja'     && <AnimalDeactivateMF publicacion={modal.pub} nombreAnimal={modal.pub.animal?.nom_mascot ?? '—'} onSuccess={cerrar} onCancel={cerrar} />}
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, margin: '0 0 4px', color: '#1a1a1a' }}>Mis animales</h2>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{pubs.length} publicaciones</p>
        </div>
        <button onClick={() => setModal({ type: 'register' })}
          style={{ padding: '10px 20px', background: '#e4adcc', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          + Registrar animal
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Cargando...</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pubs.map(pub => {
          const estado = estadoDesde(pub)
          const et = ETIQUETA[estado]
          return (
            <div key={pub.id_publi} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'white', borderRadius: 14, padding: '16px 20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 28, width: 48, height: 48, background: '#faf8f5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🐾</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1a1a' }}>{pub.animal?.nom_mascot ?? `ID ${pub.id_mascot}`}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{pub.animal?.nom_raza ?? '—'} · {pub.animal?.edad_mascot ?? '?'} años</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: et.color, background: et.bg, border: `1px solid ${et.color}30` }}>{et.label}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setModal({ type: 'edit', pub })} style={{ padding: '6px 14px', background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>Editar</button>
                <button onClick={() => setModal({ type: 'status', pub, estado })} style={{ padding: '6px 14px', background: '#e8f5e9', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#2e7d32' }}>Estado</button>
                {pub.est_publi && <button onClick={() => setModal({ type: 'baja', pub })} style={{ padding: '6px 14px', background: '#fdecea', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: '#c62828' }}>Dar baja</button>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
