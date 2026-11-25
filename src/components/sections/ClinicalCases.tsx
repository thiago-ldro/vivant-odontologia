import type { Photo } from '../../config/schema'
import { Image } from './Intro'

export function ClinicalCases({ photos, attribution }: { photos: Photo[]; attribution: string }) {
  return <section id="casos-clinicos" className="section wrap clinical-cases" aria-labelledby="clinical-cases-title">
    <div className="section-heading" data-reveal>
      <div>
        <p className="eyebrow">Casos clínicos</p>
        <h2 id="clinical-cases-title">Antes e depois.</h2>
      </div>
      <p>Registros de tratamentos concluídos, publicados com autorização dos pacientes. O resultado varia de acordo com cada caso.</p>
    </div>
    <div className="clinical-case-grid">
      {photos.map((photo) => <figure className="clinical-case" key={photo.src} data-reveal>
        <div className="clinical-case-image">
          <Image photo={photo} />
          <span className="clinical-case-label" aria-hidden="true">Antes</span>
          <span className="clinical-case-label" aria-hidden="true">Depois</span>
        </div>
        <figcaption>{attribution}</figcaption>
      </figure>)}
    </div>
  </section>
}
