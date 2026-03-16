import { useState, useEffect } from 'react';
import { BookText, Printer, CheckSquare, Square, Save } from 'lucide-react';
import { Studio, AppState } from '../store';

export default function DichiarazioneScritture({ studio, currentClienteId, state, setView }: { studio: Studio, currentClienteId?: string | null, state?: AppState, setView?: (v: string) => void }) {
  const [formData, setFormData] = useState({
    cliente: '',
    indirizzoCliente: '',
    pivaCliente: '',
    relativeA: { generale: false, iva: true },
    regime: 'Semplificato',
    libri: {
      giornale: false,
      inventari: false,
      magazzino: false,
      cespiti: true,
      acquistiIva: true,
      fattureIva: true,
      corrispettivi: false,
      ricevute: false
    },
    depositate: {
      vendita: true,
      acquisto: true,
      altri: false,
      rimanenze: true
    },
    data: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`scritture_${currentClienteId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (state) {
          const c = state.clienti.find(c => c.id === currentClienteId);
          if (c) {
            setFormData(prev => ({ ...prev, cliente: c.nome, pivaCliente: c.piva || c.cf || '' }));
          }
        }
      } catch {}
    }
  }, [currentClienteId, state]);

  const [preview, setPreview] = useState(false);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const toggleRelative = (key: keyof typeof formData.relativeA) => 
    setFormData({ ...formData, relativeA: { ...formData.relativeA, [key]: !formData.relativeA[key] } });
    
  const toggleLibro = (key: keyof typeof formData.libri) => 
    setFormData({ ...formData, libri: { ...formData.libri, [key]: !formData.libri[key] } });
    
  const toggleDepositate = (key: keyof typeof formData.depositate) => 
    setFormData({ ...formData, depositate: { ...formData.depositate, [key]: !formData.depositate[key] } });

  const handleSave = () => {
    if (currentClienteId) {
      localStorage.setItem(`scritture_${currentClienteId}`, JSON.stringify(formData));
      alert('Dichiarazione salvata con successo nel fascicolo!');
    } else {
      alert('Dichiarazione generata. (Nota: per salvare nel fascicolo, genera il documento partendo dal Fascicolo Cliente)');
    }
  };

  const CheckIcon = ({ checked }: { checked: boolean }) => checked ? <CheckSquare size={16} className="text-navy" /> : <Square size={16} className="text-slate-300" />;

  return (
    <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Dichiarazione Tenuta Scritture</h2>
          <p className="mt-1.5 text-sm text-slate-500">Ai sensi del 10° comma – art. 52 D.P.R. 633 del 26.10.1972</p>
        </div>
        <div className="flex gap-2">
          {currentClienteId && setView && (
            <button className="btn btn-secondary" onClick={() => setView('fascicolo')}>Torna al Fascicolo</button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          {currentClienteId && <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva nel Fascicolo</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:hidden">
        <div className="card">
          <div className="card-title"><div className="ct-icon"><BookText size={18} /></div> Dati Cliente e Regime</div>
          <div className="space-y-4">
            <div><label className="form-label">Ragione Sociale / Nome Cliente</label><input name="cliente" value={formData.cliente} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Indirizzo Sede Cliente</label><input name="indirizzoCliente" value={formData.indirizzoCliente} onChange={handleChange} className="form-input" placeholder="Via, CAP, Città, Prov" /></div>
            <div><label className="form-label">Partita IVA / CF Cliente</label><input name="pivaCliente" value={formData.pivaCliente} onChange={handleChange} className="form-input" /></div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="form-label">Scritture relative a:</label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={formData.relativeA.generale} onChange={() => toggleRelative('generale')} className="accent-navy" /> Contabilità generale</label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={formData.relativeA.iva} onChange={() => toggleRelative('iva')} className="accent-navy" /> Contabilità iva</label>
                </div>
              </div>
              <div>
                <label className="form-label">Regime Contabile:</label>
                <select name="regime" value={formData.regime} onChange={handleChange} className="form-select">
                  <option value="Ordinario">Ordinario</option>
                  <option value="Semplificato">Semplificato</option>
                  <option value="Forfetario">Forfetario</option>
                </select>
              </div>
            </div>
            <div><label className="form-label">Data Dichiarazione</label><input name="data" type="date" value={formData.data} onChange={handleChange} className="form-input" /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><div className="ct-icon"><BookText size={18} /></div> Libri e Documenti</div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="form-label mb-3">Su Libri bollati della ditta:</label>
              <div className="space-y-2.5">
                {[
                  { k: 'giornale', l: 'Libro giornale' }, { k: 'inventari', l: 'Libro inventari' },
                  { k: 'magazzino', l: 'Registro magazzino' }, { k: 'cespiti', l: 'Registro beni ammortizzabili' },
                  { k: 'acquistiIva', l: 'Registro acquisti iva' }, { k: 'fattureIva', l: 'Registro fatture iva' },
                  { k: 'corrispettivi', l: 'Registro corrispettivi iva' }, { k: 'ricevute', l: 'Registro carico ricevute fiscali' }
                ].map(item => (
                  <label key={item.k} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.libri[item.k as keyof typeof formData.libri]} onChange={() => toggleLibro(item.k as keyof typeof formData.libri)} className="accent-navy" /> {item.l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label mb-3">Inoltre sono depositate:</label>
              <div className="space-y-2.5">
                {[
                  { k: 'vendita', l: 'Fatture di vendita e/o lavorazione' },
                  { k: 'acquisto', l: 'Fatture di acquisto e/o ricevute di pagamenti' },
                  { k: 'altri', l: 'Altri documenti contabili' },
                  { k: 'rimanenze', l: 'Distinte delle rimanenze di magazzino' }
                ].map(item => (
                  <label key={item.k} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData.depositate[item.k as keyof typeof formData.depositate]} onChange={() => toggleDepositate(item.k as keyof typeof formData.depositate)} className="accent-navy" /> {item.l}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button className="btn btn-gold mt-6 w-full justify-center" onClick={() => setPreview(true)}>📄 Genera Anteprima</button>
        </div>
      </div>

      {/* Print Preview Area */}
      <div className={`bg-white p-8 shadow-lg print:shadow-none print:p-0 ${preview ? 'block' : 'hidden print:block'}`}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase">{studio.denominazione || 'STUDIO NOVANZI SRL'}</h1>
          <p className="text-sm">AMMINISTRAZIONE E CONSULENZA AZIENDALE</p>
          <p className="text-sm">P.IVA {studio.piva || '02539510970'} {studio.niscrizione ? `* Iscr. ${studio.niscrizione}` : ''}</p>
          <p className="text-sm">{studio.indirizzo || 'VIA MAURO MILIOTTI 3/3'} - {studio.citta || '59100 PRATO'}</p>
        </div>

        <div className="text-center mb-6 border-b border-black pb-2">
          <h2 className="text-lg font-bold underline underline-offset-4">DICHIARAZIONE TENUTA SCRITTURE CONTABILI</h2>
          <p className="text-xs mt-1">Ai sensi del 10° comma – art. 52 D.P.R. 633 del 26.10.1972, e successive modificazioni</p>
        </div>

        <div className="mb-6 text-sm">
          <p className="mb-2">Si dichiara che le sottoindicate scritture contabili relative a:</p>
          <div className="ml-4 space-y-1 mb-4">
            <div className="flex items-center gap-2"><CheckIcon checked={formData.relativeA.generale} /> Contabilità generale</div>
            <div className="flex items-center gap-2"><CheckIcon checked={formData.relativeA.iva} /> Contabilità iva</div>
          </div>
          
          <p className="font-bold mb-2">REGIME CONTABILE</p>
          <div className="ml-4 space-y-1 mb-6">
            <div className="flex items-center gap-2"><CheckIcon checked={formData.regime === 'Ordinario'} /> Ordinario</div>
            <div className="flex items-center gap-2"><CheckIcon checked={formData.regime === 'Semplificato'} /> Semplificato</div>
            <div className="flex items-center gap-2"><CheckIcon checked={formData.regime === 'Forfetario'} /> Forfetario</div>
          </div>

          <div className="text-center mb-2">Della ditta</div>
          <div className="border-2 border-black p-4 text-center mb-6">
            <h3 className="text-xl font-bold uppercase">{formData.cliente || '_________________________'}</h3>
            <p className="text-lg font-bold uppercase">{formData.indirizzoCliente || '_________________________'}</p>
            <p className="text-lg font-bold uppercase">P.IVA {formData.pivaCliente || '_________________________'}</p>
          </div>

          <p className="mb-2">Sono tenute presso questo studio in:</p>
          <p className="font-bold mb-4 uppercase">{studio.citta || 'PRATO'} - {studio.indirizzo || 'Via Mauro Miliotti 3/3'} Tel. {studio.tel || '0574/876055'}</p>

          <table className="w-full border-collapse border border-black text-sm mb-4">
            <thead>
              <tr>
                <th className="border border-black p-2 text-left font-normal w-1/2">su Libri bollati della ditta</th>
                <th className="border border-black p-2 text-left font-normal w-1/2">Inoltre sono depositate presso questo studio le:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-3 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.giornale} /> Libro giornale</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.inventari} /> Libro inventari</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.magazzino} /> Registro magazzino</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.cespiti} /> Registro beni ammortizzabili</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.acquistiIva} /> Registro acquisti iva</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.fattureIva} /> Registro fatture iva</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.corrispettivi} /> Registro corrispettivi iva</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.libri.ricevute} /> Registro carico ricevute fiscali</div>
                  </div>
                </td>
                <td className="border border-black p-3 align-top">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.depositate.vendita} /> Fatture di vendita e/o lavorazione</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.depositate.acquisto} /> Fatture di acquisto e/o ricevute di pagamenti</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.depositate.altri} /> Altri documenti contabili</div>
                    <div className="flex items-center gap-2"><CheckIcon checked={formData.depositate.rimanenze} /> Distinte delle rimanenze di magazzino</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs mb-8">La presente dichiarazione deve essere esibita in caso di ispezioni e verifiche da parte dei competenti organi di vigilanza.</p>

          <div className="flex justify-between items-end">
            <div>
              <p>{studio.citta || 'Prato'}, {new Date(formData.data).toLocaleDateString('it-IT')}</p>
              <p className="text-xs mt-8">Per ricevuta di quanto sopra</p>
              <div className="border-b border-dashed border-black w-64 mt-8"></div>
            </div>
            <div className="text-center">
              <div className="border-b border-dashed border-black w-48 mb-1"></div>
              <p className="text-xs">firma del dichiarante</p>
              <p className="text-xs font-bold mt-8">COPIA PER LO STUDIO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
