import { useState } from 'react';
import { Studio } from '../store';
import { Building2, Save } from 'lucide-react';

export default function Anagrafica({ studio, updateStudio }: { studio: Studio, updateStudio: (s: Studio) => void }) {
  const [formData, setFormData] = useState<Studio>(studio);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateStudio(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Anagrafica Studio</h2>
          <p className="mt-1.5 text-sm text-slate-500">Dati identificativi dello studio professionale da riportare su tutti i documenti</p>
        </div>
        <button className="btn btn-gold" onClick={handleSave}>
          <Save size={16} /> {saved ? 'Salvato!' : 'Salva'}
        </button>
      </div>

      <div className="card">
        <div className="card-title"><div className="ct-icon"><Building2 size={18} /></div> Dati dello Studio</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label required">Denominazione Studio</label>
            <input name="denominazione" value={formData.denominazione || ''} onChange={handleChange} className="form-input" placeholder="Es. Studio Tributario Rossi" />
          </div>
          <div>
            <label className="form-label required">Città</label>
            <input name="citta" value={formData.citta || ''} onChange={handleChange} className="form-input" placeholder="Es. Milano" />
          </div>
          <div>
            <label className="form-label required">Indirizzo</label>
            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="form-input" placeholder="Via/Piazza, n." />
          </div>
          <div>
            <label className="form-label required">Partita IVA</label>
            <input name="piva" value={formData.piva || ''} onChange={handleChange} className="form-input" placeholder="00000000000" />
          </div>
          <div>
            <label className="form-label required">Codice Fiscale</label>
            <input name="cf" value={formData.cf || ''} onChange={handleChange} className="form-input" placeholder="Codice fiscale titolare" />
          </div>
          <div>
            <label className="form-label">Telefono</label>
            <input name="tel" value={formData.tel || ''} onChange={handleChange} className="form-input" placeholder="+39 ..." />
          </div>
          <div>
            <label className="form-label">E-mail</label>
            <input name="email" value={formData.email || ''} onChange={handleChange} className="form-input" placeholder="studio@esempio.it" />
          </div>
          <div>
            <label className="form-label">PEC</label>
            <input name="pec" value={formData.pec || ''} onChange={handleChange} className="form-input" placeholder="studio@pec.it" />
          </div>
          <div>
            <label className="form-label">Sito Web</label>
            <input name="web" value={formData.web || ''} onChange={handleChange} className="form-input" placeholder="www.esempio.it" />
          </div>
        </div>

        <div className="section-divider">
          <div className="section-divider-title">Legale Rappresentante</div>
          <div className="section-divider-line"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className="form-label required">Cognome e Nome</label>
            <input name="lrNome" value={formData.lrNome || ''} onChange={handleChange} className="form-input" placeholder="Cognome Nome" />
          </div>
          <div>
            <label className="form-label">Luogo di Nascita</label>
            <input name="lrLuogo" value={formData.lrLuogo || ''} onChange={handleChange} className="form-input" placeholder="Città" />
          </div>
          <div>
            <label className="form-label">Data di Nascita</label>
            <input name="lrData" value={formData.lrData || ''} onChange={handleChange} type="date" className="form-input" />
          </div>
          <div>
            <label className="form-label">Codice Fiscale</label>
            <input name="lrCf" value={formData.lrCf || ''} onChange={handleChange} className="form-input" placeholder="CF" />
          </div>
        </div>

        <div className="section-divider">
          <div className="section-divider-title">Iscrizione Professionale</div>
          <div className="section-divider-line"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Associazione</label>
            <select name="assoc" value={formData.assoc || ''} onChange={handleChange} className="form-select">
              <option value="LAPET">Associazione Nazionale Tributaristi LAPET</option>
              <option value="ODCEC">Ordine Dottori Commercialisti e Esperti Contabili</option>
              <option value="altro">Altra associazione</option>
            </select>
          </div>
          <div>
            <label className="form-label">Numero di Iscrizione</label>
            <input name="niscrizione" value={formData.niscrizione || ''} onChange={handleChange} className="form-input" placeholder="n. ..." />
          </div>
        </div>
      </div>
    </div>
  );
}
