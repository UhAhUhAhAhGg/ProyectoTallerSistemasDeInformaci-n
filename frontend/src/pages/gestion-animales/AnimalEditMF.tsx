import { useEffect, useState } from 'react'
import AnimalFormFields from './shared/AnimalFormFields'
import { editarAnimal } from './shared/animal.service'
import type { Animal, AnimalFormData } from './shared/animal.types'

interface Props {
  animal: Animal
  id_publi: number
  onSuccess?: () => void
  onCancel?: () => void
}

const toForm = (a: Animal): AnimalFormData => ({
  nom_mascot: a.nom_mascot, id_raza: a.id_raza,
  edad_mascot: a.edad_mascot, fenac_mascot: a.fenac_mascot,
  descrip_mascot: a.descrip_mascot, gen_mascot: a.gen_mascot,
  esterilizado: a.esterilizado, img_mascot: a.img_mascot,
  decrip_publi: '',
})

export default function AnimalEditMF({ animal, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<AnimalFormData>(() => toForm(animal))
  const [errors, setErrors] = useState<Partial<Record<keyof AnimalFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [globalErr, setGlobalErr] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(toForm(animal)) }, [animal.id_mascot])

  const onChange = (field: keyof AnimalFormData, value: AnimalFormData[keyof AnimalFormData]) =>
    setForm(f => ({ ...f, [field]: value }))

  const validate = () => {
    const e: typeof errors = {}
    if (!form.nom_mascot.trim()) e.nom_mascot = 'Nombre requerido'
    if (!form.id_raza)           e.id_raza = 'Selecciona una raza'
    if (!form.descrip_mascot.trim()) e.descrip_mascot = 'Descripción requerida'
    setErrors(e); return Object.keys(e).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setGlobalErr('')
    try {
      await editarAnimal(animal.id_mascot, form)
      setSaved(true)
      setTimeout(() => { setSaved(false); onSuccess?.() }, 1500)
    } catch (err: any) {
      setGlobalErr(err.response?.data?.mensaje || 'Error al guardar')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, margin: '0 0 4px', color: '#1a1a1a' }}>
          Editar: {animal.nom_mascot}
        </h2>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
          Los cambios se reflejarán en el catálogo inmediatamente
        </p>
      </div>
      {saved && (
        <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
          ✓ Cambios guardados correctamente
        </div>
      )}
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
            style={{ padding: '10px 26px', background: '#e4adcc', color: '#1a1a1a', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
