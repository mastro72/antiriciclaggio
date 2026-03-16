import { useState, useEffect } from 'react';
import { Bot, Printer, Save } from 'lucide-react';
import { Studio, AppState } from '../store';

export default function InformativaIA({ studio, currentClienteId, state, setView }: { studio: Studio, currentClienteId?: string | null, state?: AppState, setView?: (v: string) => void }) {
  const [formData, setFormData] = useState({
    cliente: '',
    cf: '',
    data: new Date().toISOString().slice(0, 10),
    usaIA: 'no',
    strumentiIA: ''
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`ia_${currentClienteId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (state) {
          const c = state.clienti.find(c => c.id === currentClienteId);
          if (c) {
            setFormData(prev => ({ ...prev, cliente: c.nome, cf: c.piva || c.cf || '' }));
          }
        }
      } catch {}
    }
  }, [currentClienteId, state]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (currentClienteId) {
      localStorage.setItem(`ia_${currentClienteId}`, JSON.stringify(formData));
      
      try {
        const { saveGeneratedDocument } = await import('../utils/fs');
        const c = state?.clienti.find(c => c.id === currentClienteId);
        const numCliente = c?.numeroCliente || '00000';
        const success = await saveGeneratedDocument(numCliente, 'Informativa_IA', 'print-ia');
        if (success) {
          alert('Informativa IA salvata con successo nel fascicolo e nella cartella locale!');
        }
      } catch (err) {
        console.error(err);
        alert('Dati salvati, ma impossibile generare il file PDF nella cartella locale.');
      }
    } else {
      alert('Informativa generata. (Nota: per salvare nel fascicolo, genera il documento partendo dal Fascicolo Cliente)');
    }
  };

  return (
    <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Informativa Intelligenza Artificiale</h2>
          <p className="mt-1.5 text-sm text-slate-500">Art. 13 L. 23/9/2025 n.132 — Informativa sull'utilizzo di strumenti IA</p>
        </div>
        <div className="flex gap-2">
          {currentClienteId && setView && (
            <button className="btn btn-secondary" onClick={() => setView('fascicolo')}>Torna al Fascicolo</button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          {currentClienteId && <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva nel Fascicolo</button>}
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800 print:hidden">
        <span className="text-lg">⚠️</span>
        <p>Informativa obbligatoria ai sensi dell'art. 13 della Legge 23 settembre 2025, n.132, da allegare alla lettera di incarico.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:hidden">
        <div className="card">
          <div className="card-title"><div className="ct-icon"><Bot size={18} /></div> Dati Cliente</div>
          <div className="space-y-4">
            <div><label className="form-label">Cliente</label><input name="cliente" value={formData.cliente} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Codice Fiscale / P.IVA</label><input name="cf" value={formData.cf} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Data</label><input name="data" type="date" value={formData.data} onChange={handleChange} className="form-input" /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><div className="ct-icon"><Bot size={18} /></div> Utilizzo IA nell'Incarico</div>
          <div className="space-y-4">
            <div>
              <label className="form-label required">Il professionista nell'esecuzione dell'incarico:</label>
              <div className="mt-2 flex flex-col gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-warm-gray bg-white px-4 py-2 hover:border-navy">
                  <input type="radio" name="usaIA" value="no" checked={formData.usaIA === 'no'} onChange={handleChange} className="accent-navy" />
                  <span className="text-sm">Non si avvale di sistemi di IA</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-warm-gray bg-white px-4 py-2 hover:border-navy">
                  <input type="radio" name="usaIA" value="si" checked={formData.usaIA === 'si'} onChange={handleChange} className="accent-navy" />
                  <span className="text-sm">Si avvale / potrebbe avvalersi di sistemi IA</span>
                </label>
              </div>
            </div>
            
            {formData.usaIA === 'si' && (
              <div className="animate-in slide-in-from-top-2">
                <label className="form-label">Specificare gli strumenti IA utilizzati (opzionale):</label>
                <textarea 
                  name="strumentiIA" 
                  value={formData.strumentiIA} 
                  onChange={handleChange} 
                  className="form-input min-h-[80px]" 
                  placeholder="Es. ChatGPT per stesura bozze, software di contabilità con IA integrata..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print View */}
      <div id="print-ia" className="hidden print:block font-serif text-[11px] leading-snug max-w-4xl mx-auto bg-white p-8">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold uppercase">INFORMATIVA SULL'UTILIZZO DI SISTEMI DI INTELLIGENZA ARTIFICIALE</h1>
          <p className="text-sm">(Ai sensi dell'art. 13 della Legge 23 settembre 2025, n. 132)</p>
        </div>

        <div className="mb-6">
          <p>Gentile Cliente <strong>{formData.cliente || '_______________________'}</strong> (CF/P.IVA: {formData.cf || '_______________________'}),</p>
          <p className="mt-2">In relazione all'incarico professionale conferito allo Studio <strong>{studio.denominazione || '_______________________'}</strong>, ai sensi e per gli effetti dell'art. 13 della Legge 23 settembre 2025, n. 132, recante disposizioni in materia di intelligenza artificiale, si rende la seguente informativa.</p>
        </div>

        <div className="mb-6 border p-4">
          <h3 className="font-bold mb-3">Dichiarazione sull'utilizzo di sistemi di Intelligenza Artificiale</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0">{formData.usaIA === 'no' ? 'X' : ''}</div>
              <p>Il Professionista dichiara che, per l'espletamento dell'incarico conferito, <strong>NON si avvale</strong> e non prevede di avvalersi dell'ausilio di sistemi di intelligenza artificiale.</p>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 border border-black flex items-center justify-center shrink-0">{formData.usaIA === 'si' ? 'X' : ''}</div>
              <div>
                <p>Il Professionista dichiara che, per l'espletamento dell'incarico conferito, <strong>SI AVVALE o potrebbe avvalersi</strong> dell'ausilio di sistemi di intelligenza artificiale.</p>
                {formData.usaIA === 'si' && formData.strumentiIA && (
                  <div className="mt-2 pl-2 border-l-2 border-gray-300">
                    <p className="italic">Strumenti utilizzati: {formData.strumentiIA}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-justify">
          <p>Nel caso in cui il Professionista si avvalga di sistemi di intelligenza artificiale, si precisa che tali strumenti sono utilizzati esclusivamente come supporto all'attività professionale e non sostituiscono in alcun modo il giudizio, la valutazione e la responsabilità del Professionista stesso.</p>
          <p>Il Professionista garantisce che l'utilizzo di tali sistemi avviene nel rispetto della normativa vigente in materia di protezione dei dati personali (GDPR) e del segreto professionale.</p>
          <p>La presente informativa costituisce parte integrante e sostanziale della lettera di incarico professionale.</p>
        </div>

        <div className="flex justify-between mt-16">
          <div>
            <p>Luogo e Data</p>
            <p className="mt-2 text-sm">{studio.citta || '_______________________'}, {new Date(formData.data).toLocaleDateString('it-IT')}</p>
          </div>
          <div className="text-center">
            <p>Firma del Cliente per presa visione</p>
            <p className="mt-8 border-t border-black w-64"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
