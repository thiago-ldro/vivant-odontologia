import { useState, type ReactNode } from 'react'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="studio-field"><span>{label}</span>{children}</label>
}

export function Text({ label, value, set, multiline = false, type = 'text' }: { label: string; value: string; set: (value: string) => void; multiline?: boolean; type?: string }) {
  return <Field label={label}>{multiline ? <textarea value={value} onChange={(event) => set(event.target.value)} rows={3} /> : <input type={type} value={value} onChange={(event) => set(event.target.value)} />}</Field>
}

export function Select({ label, value, set, options }: { label: string; value: string; set: (value: string) => void; options: readonly string[] }) {
  return <Field label={label}><select value={value} onChange={(event) => set(event.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select></Field>
}

export function Upload({ label, value, set }: { label: string; value: string; set: (value: string) => void }) {
  const [error, setError] = useState('')
  async function read(file?: File) {
    if (!file) return
    if (!/^image\/(avif|webp|jpeg|png|gif)$/.test(file.type) || file.size > 3 * 1024 * 1024) {
      setError('Escolha JPEG, PNG, WebP, AVIF ou GIF de até 3 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => { set(String(reader.result)); setError('') }
    reader.onerror = () => setError('Não foi possível ler a imagem.')
    reader.readAsDataURL(file)
  }
  return <div className="upload"><Text label={label + ' · caminho ou URL'} value={value.startsWith('data:') ? '' : value} set={set} /><Field label={'Enviar ' + label.toLowerCase()}><input type="file" accept="image/avif,image/webp,image/jpeg,image/png,image/gif" onChange={(event) => { void read(event.target.files?.[0]); event.target.value = '' }} /></Field>
    {value.startsWith('data:') && <p>Imagem incorporada ao JSON. <button type="button" onClick={() => set('')}>Remover</button></p>}
    {error && <p role="alert">{error}</p>}
  </div>
}
