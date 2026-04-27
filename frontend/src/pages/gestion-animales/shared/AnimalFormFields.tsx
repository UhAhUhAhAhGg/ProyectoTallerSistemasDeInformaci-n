import { useEffect, useState } from 'react'
import type { AnimalFormData, Raza, Especie } from './animal.types'
import { getRazas, getEspecies } from './animal.service'

interface Props {
  data: AnimalFormData
  errors: Partial<Record<keyof AnimalFormData, string>>
  onChange: (field: keyof AnimalFormData, value: AnimalFormData[keyof AnimalFormData]) => void
}

const s: {
  row: React.CSSProperties
  group: React.CSSProperties
  label: React.CSSProperties
  input: React.CSSProperties
  err: React.CSSProperties
  tog: React.CSSProperties
  chip: (active: boolean) => React.CSSProperties
} = {
  row:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  group: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 500, color: '#333' },
  input: { padding: '9px 12px', border: '2px solid #e8e8e8', borderRadius: 10, fontSize: 13, fontFamily: 'DM Sans, sans-serif', background: '#fafafa' },
  err:   { fontSize: 11, color: '#e53e3e', marginTop: 3 },
  tog:   { display: 'flex', gap: 8, alignItems: 'center' },
  chip:  (active: boolean) => ({ padding: '6px 14px', border: `2px solid ${active ? '#e4adcc' : '#e8e8e8'}`, background: active ? '#fdf0f7' : 'white', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: active ? '#c47fa4' : '#666' }),
}

export default function AnimalFormFields({ data, errors, onChange }: Props) {
  const [razas, setRazas] = useState<Raza[]>([])
  const [especies, setEspecies] = useState<Especie[]>([])
  const [especieId, setEspecieId] = useState<number | ''>('')

  useEffect(() => {
    getEspecies().then(setEspecies)
    getRazas().then(setRazas)
  }, [])

  const razasFiltradas = especieId ? razas.filter(r => r.id_espe === especieId) : razas

  return (
    <>
      <div style={s.row}>
        <div style={s.group}>
          <label style={s.label}>Nombre *</label>
          <input style={s.input} value={data.nom_mascot} onChange={e => onChange('nom_mascot', e.target.value)} placeholder="Luna" />
          {errors.nom_mascot && <span style={s.err}>{errors.nom_mascot}</span>}
        </div>
        <div style={s.group}>
          <label style={s.label}>Edad (años) *</label>
          <input style={s.input} type="number" min={0} value={data.edad_mascot} onChange={e => onChange('edad_mascot', Number(e.target.value))} />
        </div>
      </div>
      <div style={s.row}>
        <div style={s.group}>
          <label style={s.label}>Especie</label>
          <select style={s.input} value={especieId} onChange={e => setEspecieId(Number(e.target.value) || '')}>
            <option value="">Todas</option>
            {especies.map(e => <option key={e.id_espe} value={e.id_espe}>{e.nom_espe}</option>)}
          </select>
        </div>
        <div style={s.group}>
          <label style={s.label}>Raza *</label>
          <select style={s.input} value={data.id_raza} onChange={e => onChange('id_raza', Number(e.target.value))}>
            <option value="">Selecciona</option>
            {razasFiltradas.map(r => <option key={r.id_raza} value={r.id_raza}>{r.nom_raza}</option>)}
          </select>
          {errors.id_raza && <span style={s.err}>{errors.id_raza}</span>}
        </div>
      </div>
      <div style={s.group}>
        <label style={s.label}>Sexo</label>
        <div style={s.tog}>
          {[{ label: '♀ Hembra', val: false }, { label: '♂ Macho', val: true }].map(({ label, val }) => (
            <button key={label} type="button" style={s.chip(data.gen_mascot === val)} onClick={() => onChange('gen_mascot', val)}>{label}</button>
          ))}
          <span style={{ marginLeft: 16, fontSize: 12, color: '#888' }}>Esterilizado</span>
          {[{ label: 'Sí', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
            <button key={label} type="button" style={s.chip(data.esterilizado === val)} onClick={() => onChange('esterilizado', val)}>{label}</button>
          ))}
        </div>
      </div>
      <div style={s.group}>
        <label style={s.label}>Fecha de nacimiento</label>
        <input style={s.input} type="date" value={data.fenac_mascot} onChange={e => onChange('fenac_mascot', e.target.value)} />
      </div>
      <div style={s.group}>
        <label style={s.label}>Comportamiento y salud *</label>
        <textarea style={{ ...s.input, resize: 'none', height: 70 }} value={data.descrip_mascot} onChange={e => onChange('descrip_mascot', e.target.value)} placeholder="Describe su comportamiento, salud y necesidades especiales..." />
        {errors.descrip_mascot && <span style={s.err}>{errors.descrip_mascot}</span>}
      </div>
      <div style={s.group}>
        <label style={s.label}>URL de foto principal</label>
        <input style={s.input} value={data.img_mascot} onChange={e => onChange('img_mascot', e.target.value)} placeholder="https://..." />
      </div>
      <div style={s.group}>
        <label style={s.label}>Descripción para el catálogo *</label>
        <textarea style={{ ...s.input, resize: 'none', height: 56 }} value={data.decrip_publi} onChange={e => onChange('decrip_publi', e.target.value)} placeholder="Texto que verán los adoptantes..." />
      </div>
    </>
  )
}
