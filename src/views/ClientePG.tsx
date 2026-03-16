import { useState, useEffect } from 'react';
import { Factory, Save, RefreshCw, Printer } from 'lucide-react';
import { Cliente, Studio, AppState } from '../store';

export default function ClientePG({ addCliente, setView, studio, currentClienteId, state }: { addCliente: (c: Cliente) => void, setView: (v: string) => void, studio: Studio, currentClienteId?: string | null, state?: AppState }) {
  const [formData, setFormData] = useState<any>({
    numeroCliente: String(Math.floor(Math.random() * 90000) + 10000)
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`cliente_pg_${currentClienteId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (state) {
          const c = state.clienti.find(c => c.id === currentClienteId);
          if (c) {
            setFormData(prev => ({ ...prev, nome: c.nome, cf: c.cf || '', piva: c.piva || '', prestazione: c.prestazione }));
          }
        }
      } catch {}
    }
  }, [currentClienteId, state]);

  const [preview, setPreview] = useState(false);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!formData.nome) return alert('Inserire la denominazione');
    
    let clienteId = currentClienteId;
    
    if (!clienteId) {
      clienteId = 'c_' + Date.now();
      const riskLevel = formData.prestazione ? parseInt(formData.prestazione.split('-')[0]) || 2 : 2;
      
      const cliente: Cliente = {
        id: clienteId,
        numeroCliente: formData.numeroCliente,
        tipo: 'pg',
        nome: formData.nome,
        cf: formData.cf?.toUpperCase(),
        piva: formData.piva,
        prestazione: formData.prestazione,
        riskLevel,
        dataRegistrazione: new Date().toLocaleDateString('it-IT'),
        dataInizio: formData.dataInizio,
        note: formData.note
      };
      
      addCliente(cliente);
    }
    
    localStorage.setItem(`cliente_pg_${clienteId}`, JSON.stringify(formData));
    
    try {
      const { saveGeneratedDocument } = await import('../utils/fs');
      const success = await saveGeneratedDocument(formData.numeroCliente, 'Scheda_Identificazione', 'print-scheda-pg');
      if (success) {
        alert('Scheda Identificazione salvata con successo nel fascicolo e nella cartella locale!');
      }
    } catch (err) {
      console.error(err);
      alert('Dati salvati, ma impossibile generare il file PDF nella cartella locale.');
    }
    
    setView('fascicolo');
  };

  return (
    <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Scheda Identificazione Soggetto Collettivo</h2>
          <p className="mt-1.5 text-sm text-slate-500">Società, Ente, Trust o struttura analoga — Art. 18 D.Lgs. 231/2007</p>
        </div>
        <div className="flex gap-2">
          {currentClienteId && (
            <button className="btn btn-secondary" onClick={() => setView('fascicolo')}>Torna al Fascicolo</button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva Cliente</button>
        </div>
      </div>

      <div className="card print:hidden">
        <div className="card-title"><div className="ct-icon"><Factory size={18} /></div> Dati Soggetto</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label required">Numero Cliente</label>
            <input name="numeroCliente" value={formData.numeroCliente || ''} onChange={handleChange} className="form-input" maxLength={5} />
          </div>
          <div className="col-span-2">
            <label className="form-label required">Denominazione</label>
            <input name="nome" value={formData.nome || ''} onChange={handleChange} className="form-input" placeholder="Ragione sociale" />
          </div>
          <div>
            <label className="form-label required">Natura Giuridica</label>
            <select name="natura" value={formData.natura || ''} onChange={handleChange} className="form-select">
              <option value="">— Seleziona —</option>
              <option>S.r.l.</option><option>S.p.A.</option><option>S.a.s.</option>
              <option>S.n.c.</option><option>S.s.</option><option>Associazione professionale</option>
              <option>Trust</option><option>Fondazione</option><option>Associazione</option>
              <option>Altro</option>
            </select>
          </div>
          <div>
            <label className="form-label required">Codice Fiscale</label>
            <input name="cf" value={formData.cf || ''} onChange={handleChange} className="form-input uppercase" placeholder="CF società" />
          </div>
          <div>
            <label className="form-label">Partita IVA</label>
            <input name="piva" value={formData.piva || ''} onChange={handleChange} className="form-input" placeholder="P.IVA" />
          </div>
          <div>
            <label className="form-label">Data Costituzione</label>
            <input name="dataCostituzione" type="date" value={formData.dataCostituzione || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
        
        <div className="section-divider"><div className="section-divider-title">Prestazione Professionale</div><div className="section-divider-line"></div></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label required">Tipo Prestazione</label>
            <select name="prestazione" value={formData.prestazione || ''} onChange={handleChange} className="form-select">
              <option value="">— Seleziona —</option>
              <optgroup label="Rischio non significativo">
                <option value="1-visto">Visto di conformità / Interpelli / Quesiti</option>
                <option value="1-sindaco">Collegio Sindacale</option>
              </optgroup>
              <optgroup label="Poco significativo">
                <option value="2-consulenza">Consulenza tributaria / Amministrazione</option>
                <option value="2-valutazione">Valutazione aziende</option>
              </optgroup>
              <optgroup label="Abbastanza significativo">
                <option value="3-contabilita">Tenuta contabilità / Bilancio / Societaria</option>
                <option value="3-revisione">Revisione legale / Consulenza finanziaria</option>
              </optgroup>
              <optgroup label="Molto significativo">
                <option value="4-finstraord">Operazioni di finanza straordinaria</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="form-label">Data Inizio Rapporto</label>
            <input name="dataInizio" type="date" value={formData.dataInizio || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <button className="btn btn-gold mt-6 w-full justify-center" onClick={() => setPreview(true)}>📄 Genera Anteprima Scheda</button>
      </div>

      {/* Print Preview Area */}
      <div id="print-scheda-pg" className={`bg-white p-8 shadow-lg print:shadow-none print:p-0 ${preview ? 'block' : 'hidden print:block'}`}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-red-600 uppercase">SCHEDA PER L'IDENTIFICAZIONE DEL CLIENTE PER FINI ANTIRICICLAGGIO</h1>
        </div>

        <h2 className="text-red-600 font-bold mb-2">Dati dello studio</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-200 w-1/3">denominazione</td>
              <td className="border border-black p-2">{studio.denominazione || 'Studio Novanzi SRL'}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">città</td>
              <td className="border border-black p-2">{studio.citta || 'Prato'}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Partita IVA</td>
              <td className="border border-black p-2">{studio.piva || '02539510970'}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">CF</td>
              <td className="border border-black p-2">{studio.cf || '02539510970'}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-red-600 font-bold mb-2">Dati del cliente (Soggetto Collettivo)</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-200 w-1/3">Denominazione</td>
              <td className="border border-black p-2 uppercase" colSpan={3}>{formData.nome}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Natura Giuridica</td>
              <td className="border border-black p-2" colSpan={3}>{formData.natura}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Codice Fiscale</td>
              <td className="border border-black p-2 uppercase">{formData.cf}</td>
              <td className="border border-black p-2 bg-gray-200">Partita IVA</td>
              <td className="border border-black p-2 uppercase">{formData.piva}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Data Costituzione</td>
              <td className="border border-black p-2" colSpan={3}>{formData.dataCostituzione ? new Date(formData.dataCostituzione).toLocaleDateString('it-IT') : ''}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-red-600 font-bold mb-2">Prestazione Professionale</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-200 w-1/3">Tipo Prestazione</td>
              <td className="border border-black p-2 uppercase">{formData.prestazione}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Data Inizio Rapporto</td>
              <td className="border border-black p-2">{formData.dataInizio ? new Date(formData.dataInizio).toLocaleDateString('it-IT') : ''}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-12 flex justify-between">
          <div className="text-center">
            <p className="mb-8">Luogo e Data</p>
            <p className="border-b border-black w-48 mx-auto"></p>
          </div>
          <div className="text-center">
            <p className="mb-8">Firma del Professionista</p>
            <p className="border-b border-black w-48 mx-auto"></p>
          </div>
        </div>
      </div>
    </div>
  );
}
