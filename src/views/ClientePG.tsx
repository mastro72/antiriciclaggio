import { useState, useEffect } from 'react';
import { Factory, Save, RefreshCw } from 'lucide-react';
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

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
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
    alert('Scheda Identificazione salvata con successo!');
    setView('fascicolo');
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Scheda Identificazione Soggetto Collettivo</h2>
          <p className="mt-1.5 text-sm text-slate-500">Società, Ente, Trust o struttura analoga — Art. 18 D.Lgs. 231/2007</p>
        </div>
        <div className="flex gap-2">
          {currentClienteId && (
            <button className="btn btn-secondary" onClick={() => setView('fascicolo')}>Torna al Fascicolo</button>
          )}
          <button className="btn btn-secondary" onClick={() => setFormData({ numeroCliente: String(Math.floor(Math.random() * 90000) + 10000) })}><RefreshCw size={16} /> Nuovo</button>
          <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva Cliente</button>
        </div>
      </div>

      <div className="card">
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
      </div>
    </div>
  );
}
