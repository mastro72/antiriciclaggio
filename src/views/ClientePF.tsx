import { useState, useEffect } from 'react';
import { User, Save, RefreshCw, Printer } from 'lucide-react';
import { Cliente, Studio, AppState } from '../store';

export default function ClientePF({ addCliente, setView, studio, currentClienteId, state }: { addCliente: (c: Cliente) => void, setView: (v: string) => void, studio: Studio, currentClienteId?: string | null, state?: AppState }) {
  const [formData, setFormData] = useState({
    numeroCliente: String(Math.floor(Math.random() * 90000) + 10000),
    nome: '',
    sesso: 'M',
    dataNascita: '',
    luogoNascita: '',
    cf: '',
    piva: '',
    indirizzo: '',
    comune: '',
    docTipo: '',
    docData: '',
    docAutorita: '',
    docNumero: '',
    professione: '',
    pep: 'NO',
    titolare: {
      nome: '',
      luogoNascita: '',
      dataNascita: '',
      comune: '',
      cf: '',
      pep: 'NO'
    },
    esecutore: {
      nome: '',
      luogoNascita: '',
      dataNascita: '',
      comune: '',
      cf: '',
      pep: 'NO'
    },
    prestazione: {
      descrizione: 'TENUTA CONTABILITA\'',
      valore: '',
      nonDeterminabile: true
    },
    dataIdentificazione: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`cliente_pf_${currentClienteId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (state) {
          const c = state.clienti.find(c => c.id === currentClienteId);
          if (c) {
            setFormData(prev => ({ ...prev, nome: c.nome, cf: c.cf || '', prestazione: { ...prev.prestazione, descrizione: c.prestazione } }));
          }
        }
      } catch {}
    }
  }, [currentClienteId, state]);

  const [preview, setPreview] = useState(false);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleNestedChange = (category: 'titolare' | 'esecutore' | 'prestazione', field: string, value: any) => {
    setFormData({ ...formData, [category]: { ...formData[category], [field]: value } });
  };

  const handleSave = async () => {
    if (!formData.nome) return alert('Inserire il nome del cliente');
    
    let clienteId = currentClienteId;
    
    if (!clienteId) {
      clienteId = 'c_' + Date.now();
      const cliente: Cliente = {
        id: clienteId,
        numeroCliente: formData.numeroCliente,
        tipo: 'pf',
        nome: formData.nome,
        cf: formData.cf?.toUpperCase(),
        piva: formData.piva,
        prestazione: formData.prestazione.descrizione,
        riskLevel: 2, // Default, can be adjusted based on PEP status
        dataRegistrazione: new Date().toLocaleDateString('it-IT'),
        dataInizio: formData.dataIdentificazione,
      };
      addCliente(cliente);
    }
    
    localStorage.setItem(`cliente_pf_${clienteId}`, JSON.stringify(formData));
    
    try {
      const { saveGeneratedDocument } = await import('../utils/fs');
      const success = await saveGeneratedDocument(formData.numeroCliente, 'Scheda_Identificazione', 'print-scheda-pf');
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
          <h2 className="font-serif text-3xl font-semibold text-navy">Scheda Identificazione Cliente</h2>
          <p className="mt-1.5 text-sm text-slate-500">Persona Fisica / Ditta Individuale — Adeguata Verifica</p>
        </div>
        <div className="flex gap-2">
          {currentClienteId && (
            <button className="btn btn-secondary" onClick={() => setView('fascicolo')}>Torna al Fascicolo</button>
          )}
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva Cliente</button>
        </div>
      </div>

      <div className="space-y-6 print:hidden">
        <div className="card">
          <div className="card-title"><div className="ct-icon"><User size={18} /></div> Dati del Cliente</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="form-label required">Numero Cliente</label><input name="numeroCliente" value={formData.numeroCliente} onChange={handleChange} className="form-input" maxLength={5} /></div>
            <div><label className="form-label required">Cognome e Nome</label><input name="nome" value={formData.nome} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Sesso</label><select name="sesso" value={formData.sesso} onChange={handleChange} className="form-select"><option value="M">M</option><option value="F">F</option></select></div>
            <div><label className="form-label">Data di Nascita</label><input type="date" name="dataNascita" value={formData.dataNascita} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Luogo di Nascita (con EE se estero)</label><input name="luogoNascita" value={formData.luogoNascita} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label required">Codice Fiscale</label><input name="cf" value={formData.cf} onChange={handleChange} className="form-input uppercase" maxLength={16} /></div>
            <div><label className="form-label">Partita IVA</label><input name="piva" value={formData.piva} onChange={handleChange} className="form-input" maxLength={11} /></div>
            <div><label className="form-label">Indirizzo</label><input name="indirizzo" value={formData.indirizzo} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Comune</label><input name="comune" value={formData.comune} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Professione</label><input name="professione" value={formData.professione} onChange={handleChange} className="form-input" /></div>
            
            <div className="col-span-1 md:col-span-2 h-px bg-warm-gray my-2"></div>
            
            <div><label className="form-label">Tipo Documento</label><input name="docTipo" value={formData.docTipo} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Numero Documento</label><input name="docNumero" value={formData.docNumero} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Data Rilascio</label><input type="date" name="docData" value={formData.docData} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Autorità Rilascio</label><input name="docAutorita" value={formData.docAutorita} onChange={handleChange} className="form-input" /></div>
            
            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={formData.pep === 'SI'} onChange={(e) => setFormData({...formData, pep: e.target.checked ? 'SI' : 'NO'})} className="accent-navy" />
                Il cliente dichiara di ESSERE Persona Politicamente Esposta (PEP)
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-title"><div className="ct-icon"><User size={18} /></div> Titolare Effettivo</div>
            <div className="space-y-4">
              <div><label className="form-label">Cognome e Nome</label><input value={formData.titolare.nome} onChange={(e) => handleNestedChange('titolare', 'nome', e.target.value)} className="form-input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Data Nascita</label><input type="date" value={formData.titolare.dataNascita} onChange={(e) => handleNestedChange('titolare', 'dataNascita', e.target.value)} className="form-input" /></div>
                <div><label className="form-label">Luogo Nascita</label><input value={formData.titolare.luogoNascita} onChange={(e) => handleNestedChange('titolare', 'luogoNascita', e.target.value)} className="form-input" /></div>
              </div>
              <div><label className="form-label">Comune Residenza</label><input value={formData.titolare.comune} onChange={(e) => handleNestedChange('titolare', 'comune', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">Codice Fiscale</label><input value={formData.titolare.cf} onChange={(e) => handleNestedChange('titolare', 'cf', e.target.value)} className="form-input uppercase" maxLength={16} /></div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={formData.titolare.pep === 'SI'} onChange={(e) => handleNestedChange('titolare', 'pep', e.target.checked ? 'SI' : 'NO')} className="accent-navy" />
                Persona Politicamente Esposta (PEP)
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><div className="ct-icon"><User size={18} /></div> Esecutore</div>
            <div className="space-y-4">
              <div><label className="form-label">Cognome e Nome</label><input value={formData.esecutore.nome} onChange={(e) => handleNestedChange('esecutore', 'nome', e.target.value)} className="form-input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Data Nascita</label><input type="date" value={formData.esecutore.dataNascita} onChange={(e) => handleNestedChange('esecutore', 'dataNascita', e.target.value)} className="form-input" /></div>
                <div><label className="form-label">Luogo Nascita</label><input value={formData.esecutore.luogoNascita} onChange={(e) => handleNestedChange('esecutore', 'luogoNascita', e.target.value)} className="form-input" /></div>
              </div>
              <div><label className="form-label">Comune Residenza</label><input value={formData.esecutore.comune} onChange={(e) => handleNestedChange('esecutore', 'comune', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">Codice Fiscale</label><input value={formData.esecutore.cf} onChange={(e) => handleNestedChange('esecutore', 'cf', e.target.value)} className="form-input uppercase" maxLength={16} /></div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={formData.esecutore.pep === 'SI'} onChange={(e) => handleNestedChange('esecutore', 'pep', e.target.checked ? 'SI' : 'NO')} className="accent-navy" />
                Persona Politicamente Esposta (PEP)
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><div className="ct-icon"><User size={18} /></div> Prestazione e Identificazione</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="form-label">Descrizione Prestazione</label><input value={formData.prestazione.descrizione} onChange={(e) => handleNestedChange('prestazione', 'descrizione', e.target.value)} className="form-input" /></div>
            <div><label className="form-label">Data Identificazione</label><input type="date" name="dataIdentificazione" value={formData.dataIdentificazione} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Valore Prestazione (€)</label><input type="number" value={formData.prestazione.valore} onChange={(e) => handleNestedChange('prestazione', 'valore', e.target.value)} className="form-input" disabled={formData.prestazione.nonDeterminabile} /></div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={formData.prestazione.nonDeterminabile} onChange={(e) => handleNestedChange('prestazione', 'nonDeterminabile', e.target.checked)} className="accent-navy" />
                Di valore non determinabile
              </label>
            </div>
          </div>
          <button className="btn btn-gold mt-6 w-full justify-center" onClick={() => setPreview(true)}>📄 Genera Anteprima Scheda</button>
        </div>
      </div>

      {/* Print Preview Area */}
      <div id="print-scheda-pf" className={`bg-white p-8 shadow-lg print:shadow-none print:p-0 ${preview ? 'block' : 'hidden print:block'}`}>
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

        <h2 className="text-red-600 font-bold mb-2">Dati del cliente</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-200 w-1/3">Cognome nome</td>
              <td className="border border-black p-2 uppercase" colSpan={3}>{formData.nome}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">sesso</td>
              <td className="border border-black p-2" colSpan={3}>{formData.sesso}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Data di nascita</td>
              <td className="border border-black p-2 w-1/4">{formData.dataNascita ? new Date(formData.dataNascita).toLocaleDateString('it-IT') : ''}</td>
              <td className="border border-black p-2 bg-gray-200 w-1/4">Luogo di nascita</td>
              <td className="border border-black p-2 uppercase">{formData.luogoNascita}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Codice fiscale</td>
              <td className="border border-black p-2 uppercase" colSpan={3}>{formData.cf}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">indirizzo</td>
              <td className="border border-black p-2 uppercase">{formData.indirizzo}</td>
              <td className="border border-black p-2 bg-gray-200">Comune</td>
              <td className="border border-black p-2 uppercase">{formData.comune}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Tipo documento</td>
              <td className="border border-black p-2 bg-yellow-300 uppercase">{formData.docTipo}</td>
              <td className="border border-black p-2 bg-gray-200">Data Rilascio</td>
              <td className="border border-black p-2 bg-yellow-300">{formData.docData ? new Date(formData.docData).toLocaleDateString('it-IT') : ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Autorità</td>
              <td className="border border-black p-2 bg-yellow-300 uppercase">{formData.docAutorita}</td>
              <td className="border border-black p-2 bg-gray-200">numero</td>
              <td className="border border-black p-2 bg-yellow-300 uppercase">{formData.docNumero}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">professione</td>
              <td className="border border-black p-2 bg-yellow-300 uppercase" colSpan={3}>{formData.professione}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-200">Dichiara inoltre</td>
              <td className="border border-black p-2" colSpan={3}>
                {formData.pep === 'SI' ? 'essere persona politicamente esposta' : 'non essere persona politicamente esposta'}
              </td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-red-600 font-bold mb-2 text-center">TITOLARE EFFETTIVO</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 font-normal">Cognome e nome</th>
              <th className="border border-black p-2 font-normal">Luogo di nascita</th>
              <th className="border border-black p-2 font-normal">Data di nascita</th>
              <th className="border border-black p-2 font-normal">Comune residenza</th>
              <th className="border border-black p-2 font-normal">Codice fiscale</th>
              <th className="border border-black p-2 font-normal">Politicam. esposto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12">
              <td className="border border-black p-2 uppercase">{formData.titolare.nome}</td>
              <td className="border border-black p-2 uppercase">{formData.titolare.luogoNascita}</td>
              <td className="border border-black p-2">{formData.titolare.dataNascita ? new Date(formData.titolare.dataNascita).toLocaleDateString('it-IT') : ''}</td>
              <td className="border border-black p-2 uppercase">{formData.titolare.comune}</td>
              <td className="border border-black p-2 uppercase">{formData.titolare.cf}</td>
              <td className="border border-black p-2">{formData.titolare.pep}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-red-600 font-bold mb-2 text-center">ESECUTORE</h2>
        <table className="w-full border-collapse border border-black text-sm mb-6 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 font-normal">Cognome e nome</th>
              <th className="border border-black p-2 font-normal">Luogo di nascita</th>
              <th className="border border-black p-2 font-normal">Data di nascita</th>
              <th className="border border-black p-2 font-normal">Comune residenza</th>
              <th className="border border-black p-2 font-normal">Codice fiscale</th>
              <th className="border border-black p-2 font-normal">Politicamente esposto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12">
              <td className="border border-black p-2 uppercase">{formData.esecutore.nome}</td>
              <td className="border border-black p-2 uppercase">{formData.esecutore.luogoNascita}</td>
              <td className="border border-black p-2">{formData.esecutore.dataNascita ? new Date(formData.esecutore.dataNascita).toLocaleDateString('it-IT') : ''}</td>
              <td className="border border-black p-2 uppercase">{formData.esecutore.comune}</td>
              <td className="border border-black p-2 uppercase">{formData.esecutore.cf}</td>
              <td className="border border-black p-2">{formData.esecutore.pep}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-red-600 font-bold mb-2 text-center">DESCRIZIONE E VALORE DELLA PRESTAZIONE FORNITA</h2>
        <table className="w-full border-collapse border border-black text-sm mb-12 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 font-normal w-1/2">prestazione</th>
              <th className="border border-black p-2 font-normal w-1/4">Valore della prestazione</th>
              <th className="border border-black p-2 font-normal w-1/4">di valore non determinabile</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12">
              <td className="border border-black p-2 uppercase">{formData.prestazione.descrizione}</td>
              <td className="border border-black p-2">{formData.prestazione.nonDeterminabile ? '' : formData.prestazione.valore}</td>
              <td className="border border-black p-2 font-bold">{formData.prestazione.nonDeterminabile ? 'X' : ''}</td>
            </tr>
            <tr className="h-8"><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
            <tr className="h-8"><td className="border border-black"></td><td className="border border-black"></td><td className="border border-black"></td></tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end mt-16">
          <div>
            <p className="mb-8 uppercase">{studio.citta || 'PRATO'}, lì <span className="bg-yellow-300 px-2 py-1">{formData.dataIdentificazione ? new Date(formData.dataIdentificazione).toLocaleDateString('it-IT') : ''}</span></p>
            <div className="border-b border-black w-64 mb-2"></div>
            <p className="text-center text-xs uppercase">{formData.nome}</p>
          </div>
          <div className="text-center">
            <div className="border-b border-black w-64 mb-2"></div>
            <p className="text-xs uppercase">{studio.lrNome || 'NOVANZI SAURA'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
