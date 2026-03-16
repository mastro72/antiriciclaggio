import { useState, useEffect } from 'react';
import { Lock, Printer, Save } from 'lucide-react';
import { Studio, AppState } from '../store';

export default function Privacy({ studio, currentClienteId, state, setView }: { studio: Studio, currentClienteId?: string | null, state?: AppState, setView?: (v: string) => void }) {
  const [formData, setFormData] = useState({
    cliente: '',
    cf: '',
    data: new Date().toISOString().slice(0, 10),
    consensoMarketing: false,
    consensoTerzi: false
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`privacy_${currentClienteId}`);
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
  const toggleConsenso = (key: 'consensoMarketing' | 'consensoTerzi') => setFormData({ ...formData, [key]: !formData[key] });

  const handleSave = async () => {
    if (currentClienteId) {
      localStorage.setItem(`privacy_${currentClienteId}`, JSON.stringify(formData));
      
      try {
        const { saveGeneratedDocument } = await import('../utils/fs');
        const c = state?.clienti.find(c => c.id === currentClienteId);
        const numCliente = c?.numeroCliente || '00000';
        await saveGeneratedDocument(numCliente, 'Informativa_Privacy', 'print-privacy');
        alert('Informativa Privacy salvata con successo nel fascicolo e nella cartella locale!');
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
          <h2 className="font-serif text-3xl font-semibold text-navy">Informativa Privacy</h2>
          <p className="mt-1.5 text-sm text-slate-500">Art. 13 Reg. UE 2016/679 — Informativa e consenso al trattamento dei dati</p>
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
          <div className="card-title"><div className="ct-icon"><Lock size={18} /></div> Dati Titolare del Trattamento</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="form-label">Titolare</label><input className="form-input" readOnly value={studio.denominazione || ''} /></div>
            <div><label className="form-label">Sede</label><input className="form-input" readOnly value={studio.indirizzo || ''} /></div>
            <div><label className="form-label">Città</label><input className="form-input" readOnly value={studio.citta || ''} /></div>
            <div><label className="form-label">Codice Fiscale</label><input className="form-input" readOnly value={studio.cf || ''} /></div>
            <div><label className="form-label">E-mail</label><input className="form-input" readOnly value={studio.email || ''} /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><div className="ct-icon"><Lock size={18} /></div> Dati Cliente e Consensi</div>
          <div className="space-y-4">
            <div><label className="form-label">Cliente</label><input name="cliente" value={formData.cliente} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Codice Fiscale / P.IVA</label><input name="cf" value={formData.cf} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Data</label><input name="data" type="date" value={formData.data} onChange={handleChange} className="form-input" /></div>
            
            <div className="pt-2">
              <label className="form-label">Consensi Facoltativi:</label>
              <div className="space-y-2 mt-2">
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input type="checkbox" checked={formData.consensoMarketing} onChange={() => toggleConsenso('consensoMarketing')} className="mt-1 accent-navy" /> 
                  <span>Acconsento al trattamento per finalità di marketing e invio di comunicazioni informative.</span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input type="checkbox" checked={formData.consensoTerzi} onChange={() => toggleConsenso('consensoTerzi')} className="mt-1 accent-navy" /> 
                  <span>Acconsento alla comunicazione dei dati a terzi per loro finalità commerciali.</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print View */}
      <div id="print-privacy" className="hidden print:block font-serif text-[11px] leading-snug max-w-4xl mx-auto bg-white p-8">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold uppercase">INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI</h1>
          <p className="text-sm">(Art. 13 Regolamento UE 2016/679 - GDPR)</p>
        </div>

        <div className="mb-4">
          <p>Gentile Cliente <strong>{formData.cliente || '_______________________'}</strong> (CF/P.IVA: {formData.cf || '_______________________'}),</p>
          <p className="mt-2">Ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR), La informiamo che i Suoi dati personali saranno trattati dal Titolare del Trattamento <strong>{studio.denominazione || '_______________________'}</strong>, con sede in {studio.indirizzo || '_______________________'} - {studio.citta || '_______________________'} (CF/P.IVA: {studio.cf || '_______________________'}), e-mail: {studio.email || '_______________________'}, secondo i principi di liceità, correttezza e trasparenza.</p>
        </div>

        <div className="space-y-3 text-justify">
          <div>
            <h3 className="font-bold">1. Finalità e base giuridica del trattamento</h3>
            <p>I dati personali forniti sono necessari per: a) l'esecuzione dell'incarico professionale conferito (tenuta contabilità, dichiarazioni fiscali, consulenza, ecc.); b) l'adempimento di obblighi previsti dalla legge, da regolamenti o dalla normativa comunitaria (es. normativa antiriciclaggio D.Lgs. 231/2007, adempimenti fiscali). La base giuridica è l'esecuzione di un contratto (art. 6 lett. b GDPR) e l'adempimento di un obbligo legale (art. 6 lett. c GDPR).</p>
          </div>
          <div>
            <h3 className="font-bold">2. Modalità del trattamento e conservazione</h3>
            <p>Il trattamento sarà effettuato con strumenti cartacei e informatici, con logiche strettamente correlate alle finalità indicate e mediante l'adozione di adeguate misure di sicurezza. I dati saranno conservati per il tempo necessario all'espletamento dell'incarico e, successivamente, per il tempo in cui il Titolare sia soggetto a obblighi di conservazione per finalità fiscali o per altre finalità, previsti, da norme di legge o regolamento (di norma 10 anni).</p>
          </div>
          <div>
            <h3 className="font-bold">3. Destinatari dei dati</h3>
            <p>I Suoi dati potranno essere comunicati a: a) soggetti pubblici (es. Agenzia delle Entrate, INPS, CCIAA) per adempimenti di legge; b) soggetti privati (es. banche, notai, consulenti del lavoro) strettamente necessari per l'esecuzione dell'incarico; c) soggetti che elaborano i dati in esecuzione di specifici obblighi di legge; d) Autorità giudiziarie o di vigilanza, ove richiesto.</p>
          </div>
          <div>
            <h3 className="font-bold">4. Diritti dell'interessato</h3>
            <p>In ogni momento, Lei potrà esercitare, ai sensi degli articoli dal 15 al 22 del GDPR, il diritto di: a) chiedere la conferma dell'esistenza o meno di propri dati personali; b) ottenere le indicazioni circa le finalità del trattamento, le categorie dei dati, i destinatari e il periodo di conservazione; c) ottenere la rettifica e la cancellazione dei dati; d) ottenere la limitazione del trattamento; e) ottenere la portabilità dei dati; f) opporsi al trattamento in qualsiasi momento. Può esercitare i Suoi diritti con richiesta scritta inviata al Titolare. Ha inoltre il diritto di proporre reclamo a un'autorità di controllo (Garante Privacy).</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-black">
          <h3 className="font-bold text-center mb-4 uppercase">Consenso al Trattamento dei Dati</h3>
          <p className="mb-4">Il/La sottoscritto/a <strong>{formData.cliente || '_______________________'}</strong>, acquisite le informazioni fornite dal Titolare del trattamento ai sensi dell'art. 13 del GDPR:</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">X</div>
              <p><strong>Presta il consenso</strong> al trattamento dei propri dati personali per le finalità strettamente connesse all'esecuzione dell'incarico professionale (il consenso è obbligatorio per l'esecuzione del contratto).</p>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">{formData.consensoMarketing ? 'X' : ''}</div>
              <p><strong>{formData.consensoMarketing ? 'Presta il consenso' : 'Nega il consenso'}</strong> al trattamento dei propri dati personali per l'invio di comunicazioni informative e promozionali da parte dello Studio.</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">{formData.consensoTerzi ? 'X' : ''}</div>
              <p><strong>{formData.consensoTerzi ? 'Presta il consenso' : 'Nega il consenso'}</strong> alla comunicazione dei propri dati personali a soggetti terzi per loro finalità commerciali.</p>
            </div>
          </div>

          <div className="flex justify-between mt-12">
            <div>
              <p>Luogo e Data</p>
              <p className="mt-2 text-sm">{studio.citta || '_______________________'}, {new Date(formData.data).toLocaleDateString('it-IT')}</p>
            </div>
            <div className="text-center">
              <p>Firma del Cliente</p>
              <p className="mt-8 border-t border-black w-48"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
