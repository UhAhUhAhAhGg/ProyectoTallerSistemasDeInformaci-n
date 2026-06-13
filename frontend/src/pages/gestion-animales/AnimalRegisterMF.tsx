//Registrar animal con perfil completo
import { useState } from 'react'
import AnimalFormFields from './shared/AnimalFormFields'
import { registrarAnimal } from './shared/animal.service'
import type { AnimalFormData } from './shared/animal.types'

const EMPTY: AnimalFormData = {
  nom_mascot: '', id_raza: '', edad_mascot: '', fenac_mascot: '',
  descrip_mascot: '', gen_mascot: false, esterilizado: false,
  img_mascot: '', decrip_publi: '', tamano_mascot: '',
}

interface Props { onSuccess?: () => void; onCancel?: () => void }

export default function AnimalRegisterMF({ onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<AnimalFormData>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof AnimalFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [globalErr, setGlobalErr] = useState('')

  const onChange = (field: keyof AnimalFormData, value: AnimalFormData[keyof AnimalFormData]) =>
    setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.nom_mascot.trim()) e.nom_mascot = 'Nombre requerido'
    if (!form.id_raza)           e.id_raza = 'Selecciona una raza'
    if (!form.descrip_mascot.trim()) e.descrip_mascot = 'Descripción requerida'
    if (!form.decrip_publi.trim())   e.decrip_publi = 'Descripción catálogo requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setGlobalErr('')
    try {
      const id_refug = Number(localStorage.getItem('refugioId') || 0)
      await registrarAnimal(form, id_refug)
      onSuccess?.()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { mensaje?: string } } }
      setGlobalErr(e.response?.data?.mensaje || 'Error al registrar')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, margin: '0 0 4px', color: '#1a1a1a' }}>
          Registrar nuevo animal
        </h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Los datos se publicarán en el catálogo global de adopciones
        </p>
      </div>
      {globalErr && (
        <div style={{ background: '#fee', border: '1px solid #fcc', color: '#c33', padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
          {globalErr}
        </div>
      )}
      <form onSubmit={submit}>
        <AnimalFormFields data={form} errors={errors} onChange={onChange} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onCancel}
            style={{ padding: '10px 22px', background: 'transparent', border: '2px solid #e0e0e0', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            style={{ padding: '10px 26px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Guardando...' : 'Publicar en catálogo'}
          </button>
        </div>
      </form>
    </div>
  )
}