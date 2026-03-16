import { useState, useEffect } from 'react';
import { FileText, Printer, CheckSquare, Square, Save } from 'lucide-react';
import { Studio, AppState } from '../store';

export default function Mandato({ studio, currentClienteId, state, setView }: { studio: Studio, currentClienteId?: string | null, state?: AppState, setView?: (v: string) => void }) {
  const [formData, setFormData] = useState({
    prof: studio.lrNome || studio.denominazione || '',
    cliente: '',
    sede: `${studio.indirizzo || ''}, ${studio.citta || ''}`,
    sedecl: '',
    cf: studio.cf || '',
    cfcl: '',
    pivaCl: '',
    rappresentanteCl: '',
    iscrizioneLapet: studio.niscrizione || '6443097',
    servizi: {
      contabilita: true,
      redditi: true,
      irap: true,
      iva: true,
      sostituti: true,
      bilancio: false,
      consulenza: true
    },
    compensi: {
      bilancio: '',
      iva: '',
      redditi: '',
      consulenza: '',
      soci: '',
      forfettario: '',
      nonDeterminabile: false
    },
    assicurazione: {
      compagnia: 'MARSH',
      polizza: '',
      massimale: ''
    },
    data: new Date().toISOString().slice(0, 10),
    citta: studio.citta || ''
  });

  useEffect(() => {
    if (currentClienteId) {
      try {
        const saved = localStorage.getItem(`mandato_${currentClienteId}`);
        if (saved) {
          setFormData(JSON.parse(saved));
        } else if (state) {
          const c = state.clienti.find(c => c.id === currentClienteId);
          if (c) {
            setFormData(prev => ({ ...prev, cliente: c.nome, cfcl: c.cf || '', pivaCl: c.piva || '' }));
          }
        }
      } catch {}
    }
  }, [currentClienteId, state]);

  const [preview, setPreview] = useState(false);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleNestedChange = (category: 'compensi' | 'assicurazione', field: string, value: any) => {
    setFormData({ ...formData, [category]: { ...formData[category], [field]: value } });
  };

  const toggleServizio = (key: keyof typeof formData.servizi) => {
    setFormData({ ...formData, servizi: { ...formData.servizi, [key]: !formData.servizi[key] } });
  };

  const handleSave = () => {
    if (currentClienteId) {
      localStorage.setItem(`mandato_${currentClienteId}`, JSON.stringify(formData));
      alert('Mandato salvato con successo nel fascicolo!');
    } else {
      alert('Mandato generato. (Nota: per salvare nel fascicolo, genera il mandato partendo dal Fascicolo Cliente)');
    }
  };

  const CheckIcon = ({ checked }: { checked: boolean }) => checked ? <CheckSquare size={16} className="text-navy inline-block mr-1" /> : <Square size={16} className="text-slate-300 inline-block mr-1" />;

  return (
    <div className="animate-in fade-in duration-300 print:m-0 print:p-0">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Mandato Professionale</h2>
          <p className="mt-1.5 text-sm text-slate-500">Contratto di prestazione d'opera intellettuale — Art. 2230 cod. civ.</p>
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
          <div className="card-title"><div className="ct-icon"><FileText size={18} /></div> Dati Generali</div>
          <div className="space-y-4">
            <div><label className="form-label">Professionista / Studio</label><input name="prof" value={formData.prof} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Sede Studio</label><input name="sede" value={formData.sede} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">CF Studio</label><input name="cf" value={formData.cf} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">N. Iscrizione LAPET</label><input name="iscrizioneLapet" value={formData.iscrizioneLapet} onChange={handleChange} className="form-input" /></div>
            <div className="h-px bg-warm-gray my-4"></div>
            <div><label className="form-label">Cliente (Ragione Sociale)</label><input name="cliente" value={formData.cliente} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Sede Cliente</label><input name="sedecl" value={formData.sedecl} onChange={handleChange} className="form-input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">CF Cliente</label><input name="cfcl" value={formData.cfcl} onChange={handleChange} className="form-input" /></div>
              <div><label className="form-label">P.IVA Cliente</label><input name="pivaCl" value={formData.pivaCl} onChange={handleChange} className="form-input" /></div>
            </div>
            <div><label className="form-label">Rappresentante Legale (se PG)</label><input name="rappresentanteCl" value={formData.rappresentanteCl} onChange={handleChange} className="form-input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="form-label">Data stipula</label><input name="data" type="date" value={formData.data} onChange={handleChange} className="form-input" /></div>
              <div><label className="form-label">Città stipula</label><input name="citta" value={formData.citta} onChange={handleChange} className="form-input" /></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-title"><div className="ct-icon"><FileText size={18} /></div> Oggetto dell'Incarico (Art. 2)</div>
            <div className="space-y-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.contabilita} onChange={() => toggleServizio('contabilita')} className="accent-navy" /> Redazione della contabilità</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.redditi} onChange={() => toggleServizio('redditi')} className="accent-navy" /> Predisposizione ed invio dichiarazione redditi</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.irap} onChange={() => toggleServizio('irap')} className="accent-navy" /> Predisposizione ed invio dichiarazione IRAP</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.iva} onChange={() => toggleServizio('iva')} className="accent-navy" /> Predisposizione ed invio dichiarazione IVA</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.sostituti} onChange={() => toggleServizio('sostituti')} className="accent-navy" /> Predisposizione ed invio dichiarazione sostituti d'imposta</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.bilancio} onChange={() => toggleServizio('bilancio')} className="accent-navy" /> Predisposizione e deposito bilancio di esercizio</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={formData.servizi.consulenza} onChange={() => toggleServizio('consulenza')} className="accent-navy" /> Consulenza fiscale ed amministrativa relativa alla contabilità</label>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><div className="ct-icon"><FileText size={18} /></div> Compensi (Allegato A) & Assicurazione</div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 items-center gap-2"><span>Compenso Forfettario Annuale (€)</span><input type="number" value={formData.compensi.forfettario} onChange={(e) => handleNestedChange('compensi', 'forfettario', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Redazione e deposito bilancio (€)</span><input type="number" value={formData.compensi.bilancio} onChange={(e) => handleNestedChange('compensi', 'bilancio', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Dichiarazioni IVA (€)</span><input type="number" value={formData.compensi.iva} onChange={(e) => handleNestedChange('compensi', 'iva', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Dichiarazioni Redditi (€)</span><input type="number" value={formData.compensi.redditi} onChange={(e) => handleNestedChange('compensi', 'redditi', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Consulenza fiscale/amm.va (€)</span><input type="number" value={formData.compensi.consulenza} onChange={(e) => handleNestedChange('compensi', 'consulenza', e.target.value)} className="form-input py-1" /></div>
              <label className="flex cursor-pointer items-center gap-2 mt-2"><input type="checkbox" checked={formData.compensi.nonDeterminabile} onChange={(e) => handleNestedChange('compensi', 'nonDeterminabile', e.target.checked)} className="accent-navy" /> Valore non determinabile</label>
              
              <div className="h-px bg-warm-gray my-4"></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Compagnia Assicurazione</span><input value={formData.assicurazione.compagnia} onChange={(e) => handleNestedChange('assicurazione', 'compagnia', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Numero Polizza</span><input value={formData.assicurazione.polizza} onChange={(e) => handleNestedChange('assicurazione', 'polizza', e.target.value)} className="form-input py-1" /></div>
              <div className="grid grid-cols-2 items-center gap-2"><span>Massimale Copertura</span><input value={formData.assicurazione.massimale} onChange={(e) => handleNestedChange('assicurazione', 'massimale', e.target.value)} className="form-input py-1" /></div>
            </div>
            <button className="btn btn-gold mt-6 w-full justify-center" onClick={() => setPreview(true)}>📄 Genera Anteprima Mandato</button>
          </div>
        </div>
      </div>

      {/* Print Preview Area */}
      <div className={`bg-white p-8 shadow-lg print:shadow-none print:p-0 ${preview ? 'block' : 'hidden print:block'}`}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase mb-4">MANDATO PROFESSIONALE</h1>
        </div>

        <div className="text-sm leading-relaxed space-y-4 font-serif">
          <p>Fra le parti:</p>
          <p className="ml-4">
            &gt; <strong>{formData.prof}</strong>, con Studio in {formData.sede}, codice fiscale n. {formData.cf}, in seguito denominato Professionista;
          </p>
          <p className="ml-4">
            &gt; <strong>{formData.cliente}</strong>, corrente in {formData.sedecl}, CF {formData.cfcl}{formData.pivaCl ? `, IVA ${formData.pivaCl}` : ''} {formData.rappresentanteCl ? `rappresentata da ${formData.rappresentanteCl}` : ''} in seguito denominato Cliente;
          </p>

          <p className="text-center font-bold mt-6 mb-2">PREMESSO</p>
          <p className="ml-4">&gt; Che il Professionista dichiara di esercitare la propria attività in quanto Tributarista qualificato e certificato UNI 11511 e art. 2230 cod. civ. in merito alle prestazioni d'opera intellettuale.</p>
          <p className="ml-4">&gt; il Professionista è iscritto all'Associazione Nazionale Tributaristi LAPET, di cui dichiara di rispettare il Codice Etico e le Norme Disciplinari;</p>
          <p className="ml-4">&gt; che il numero di iscrizione è il seguente: {formData.iscrizioneLapet}.</p>
          
          <p>Ciò premesso, si conviene quanto segue:</p>
          
          <p className="text-center font-bold mt-4">Art. 1 - Richiami</p>
          <p>Le premesse costituiscono parte integrante del presente contratto.</p>

          <p className="text-center font-bold mt-4">Art. 2 - Oggetto dell'incarico</p>
          <p>Il Cliente affida al Professionista lo svolgimento delle attività professionali selezionate fra quelle di seguito elencate:</p>
          <div className="ml-4 space-y-1">
            <div><CheckIcon checked={formData.servizi.contabilita} /> Redazione della contabilità;</div>
            <div><CheckIcon checked={formData.servizi.redditi} /> Predisposizione ed invio della dichiarazione dei redditi;</div>
            <div><CheckIcon checked={formData.servizi.irap} /> Predisposizione ed invio della dichiarazione IRAP;</div>
            <div><CheckIcon checked={formData.servizi.iva} /> Predisposizione ed invio della dichiarazione IVA;</div>
            <div><CheckIcon checked={formData.servizi.sostituti} /> Predisposizione ed invio della dichiarazione dei sostituti d'imposta;</div>
            <div><CheckIcon checked={formData.servizi.bilancio} /> Predisposizione e deposito presso il Registro delle Imprese del bilancio di esercizio;</div>
            <div><CheckIcon checked={formData.servizi.consulenza} /> Consulenza fiscale ed amministrativa relativa alla redazione della contabilità;</div>
          </div>
          <p className="mt-2">Dette attività, non comprendono la scritturazione delle fatture, le consulenze contrattuali e/o societarie, la difesa avanti Enti, Amministrazioni e Commissioni Tributarie e, in ogni caso, ogni attività non espressamente menzionata.</p>

          <p className="text-center font-bold mt-4">Art. 3 - Durata del Mandato e recesso</p>
          <p>La durata del contratto è stabilita in anni uno.</p>
          <p>In mancanza di comunicazione scritta, da inviare a mezzo raccomandata A/r almeno 60 (sessanta) giorni prima della scadenza, il contratto si rinnoverà tacitamente, alle medesime condizioni, di anno in anno.</p>
          <p>Il Cliente ha libera facoltà di recesso, da esercitarsi con preavviso di 60 (sessanta) giorni, previo versamento dei compensi pattuiti per l'annualità in corso entro 15 (quindici) giorni dall'intervenuta comunicazione.</p>

          <p className="text-center font-bold mt-4">Art. 4 - Dichiarazioni del cliente</p>
          <p>Il Cliente dichiara:</p>
          <p className="ml-4">a) di avere ricevuto l'informativa di cui all'art. 13 del d.lgs. n. 196/2013 e dell'art. 13 e 14 del Regolamento UE n. 2016/679 del 27/4/2016 e di acconsentire al trattamento dei dati personali ad opera del Professionista, dei suoi collaboratori, sostituti e domiciliatari;</p>
          <p className="ml-4">b) di impegnarsi a fornire al Professionista i documenti e le informazioni necessari per lo svolgimento dell'incarico. In particolare, il Cliente si impegna a consegnare col necessario preavviso, la documentazione necessaria all'espletamento dell'incarico, prendendo atto che la legge prevede termini e scadenze obbligatori per gli adempimenti richiesti in esecuzione del presente mandato e che il Professionista declina ogni responsabilità per mancata o tardiva esecuzione del mandato dovuta al ritardo, incuria o inerzia da parte del Cliente nella tenuta della documentazione stessa;</p>
          <p className="ml-4">c) di essere stato informato dal Professionista del grado di complessità della prestazione;</p>
          <p className="ml-4">d) di essere stato informato dal Professionista dei costi prevedibili;</p>
          <p className="ml-4">e) di essere stato informato dal Professionista di ogni circostanza concernente l'incarico conferito, prevedibile al momento della stipulazione del presente contratto;</p>
          <p className="ml-4">f) di essere consapevole del fatto che il Professionista non può garantire il conseguimento del risultato voluto e di acconsentire al pagamento delle prestazioni a prescindere dal buon esito.</p>

          <p className="text-center font-bold mt-4">Art. 5 - Modalità svolgimento incarico</p>
          <p>Il Professionista impegna a svolgere l'incarico con la diligenza dovuta e ad informare il Cliente circa le prestazioni svolte. Quanto all'eventuale verificarsi di circostanze non prevedibili al momento della stipulazione del presente contratto, che possano determinare un aumento di costi, si richiama l'art. 7.</p>

          <p className="text-center font-bold mt-4">Art. 6 - Dipendenti e collaboratori del Professionista</p>
          <p>Le parti convengono che il Professionista possa avvalersi, sotto la propria responsabilità, di sostituti e collaboratori per lo svolgimento della prestazione. Il Professionista si impegna ad informare il Cliente dell'opportunità della nomina di consulenti per l'espletamento dell'incarico.</p>

          <p className="text-center font-bold mt-4">Art. 7 - Obblighi del Cliente</p>
          <p>Il Cliente ha l'obbligo di far pervenire tempestivamente presso lo studio del Professionista la documentazione necessaria all'espletamento dell'incarico. A tal fine, il Professionista dichiara ed il Cliente prende atto che la legge prevede termini e scadenze obbligatori per gli adempimenti connessi alla prestazione professionale richiesta ed oggetto del presente mandato. La consegna della documentazione occorrente alla prestazione non sarà oggetto di sollecito o ritiro da parte del Professionista, che, pertanto, declina ogni responsabilità per mancata o tardiva esecuzione del mandato dovuta al ritardo, incuria o inerzia da parte del Cliente. Il cliente esonera esplicitamente da ogni responsabilità il Professionista anche nel caso di inesattezza, incompletezza o non veridicità dei dati e/o dei documenti consegnati al Professionista stesso.</p>
          <p>Il Cliente deve collaborare con il Professionista ai fini dell'esecuzione del presente incarico consentendo allo stesso ogni attività di accesso e controllo dei dati necessari per l'espletamento del mandato.</p>
          <p>Il Cliente ha l'obbligo di informare tempestivamente il Professionista su qualsivoglia variazione che abbia inerenza all'incarico conferito mediante atti scritti.</p>

          <p className="text-center font-bold mt-4">Art. 8 - Compensi</p>
          <p>Il costo della prestazione annuale è determinata come nell' Allegato "A" in considerazione degli incombenti e dei costi attualmente imposti dalla normativa in vigore, al netto di spese, anticipazioni e rimborsi chilometrici per trasferte e/o incontri (parametri ACI).</p>
          <p>Eventuali prestazioni non ricomprese nell'oggetto del presente contratto, saranno fatturate al costo orario indicato nell'allegato "A".</p>
          <p>I compensi saranno fatturati con periodicità mensile e il rispettivo pagamento dovrà avvenire entro 30 (trenta) giorni dalla presentazione del preavviso di fattura.</p>
          <p>In caso di mancato pagamento protratto per ulteriori 15 (quindici) giorni rispetto alla precedente scadenza, il Professionista potrà sospendere l'esecuzione delle successive prestazioni, previo avviso.</p>

          <p className="text-center font-bold mt-4">Art. 9 - Copertura assicurativa ed esoneri da responsabilità professionale</p>
          <p>Il Professionista informa il Cliente di aver in corso la seguente polizza di responsabilità civile professionale:</p>
          <p className="ml-4">&gt; Compagnia assicurazione: {formData.assicurazione.compagnia}</p>
          <p className="ml-4">&gt; numero polizza: {formData.assicurazione.polizza}</p>
          <p className="ml-4">&gt; massimale di copertura: {formData.assicurazione.massimale}</p>
          <p>Il Cliente esonera il Professionista, ai sensi dell'art. 1229 cod. civ., da ogni responsabilità che non derivi da ipotesi di dolo o colpa grave.</p>
          <p>Il Cliente esonera il Professionista da ogni responsabilità derivante da eventuali inesattezze, incompletezze o mendacità di informazioni, dati e/o documenti raccolti e/o trasmessi all'Amministrazione Finanziaria.</p>

          <p className="text-center font-bold mt-4">Art. 10 - Antiriciclaggio</p>
          <p>In attuazione di quanto previsto dal D.Lgs. 21/11/2007, n. 231 il Professionista dichiara di aver adempiuto agli obblighi di legge sull'adeguata verifica della clientela in materia di antiriciclaggio e di finanziamento al terrorismo.</p>

          <p className="text-center font-bold mt-4">Art. 11 - Privacy</p>
          <p>Il Professionista informa il Cliente che tutti i dati e documenti che verranno forniti saranno utilizzati solamente per lo svolgimento dell'incarico professionale ricevuto. In particolare il cliente attesta di essere stato informato circa:</p>
          <ul className="ml-8 list-disc">
            <li>le finalità e le modalità del trattamento cui sono destinati i dati;</li>
            <li>la natura obbligatoria o facoltativa del conferimento dei dati;</li>
            <li>le conseguenze di un eventuale rifiuto di rispondere;</li>
            <li>i soggetti o le categorie di soggetti ai quali i dati possono essere comunicati e l'ambito di diffusione dei dati medesimi;</li>
            <li>i diritti dell'interessato circa l'opposizione e la revoca del trattamento;</li>
            <li>i dati dell'eventuale Responsabile al trattamento dei dati.</li>
          </ul>

          <p className="text-center font-bold mt-4">Art. 13 - Risoluzione controversie</p>
          <p>Le parti convengono che ogni controversia che dovesse insorgere in relazione al presente contratto, comprese quelle relative alla sua validità, interpretazione, esecuzione e risoluzione, e degli atti che ne costituiscono emanazione, compresa ogni ragione di danni, potrà essere sottoposta, in via preventiva, alla Procedura di Conciliazione da parte del seguente Organismo di conciliazione MEDILAPET</p>

          <p className="text-center font-bold mt-4">Art. 14 - Elezione di Domicilio</p>
          <p>La parti eleggono domicilio presso l'indirizzo sopra esposto.</p>

          <p className="text-center font-bold mt-4">Art. 15 - Rinvio</p>
          <p>Per quanto non espressamente previsto dalla presente lettera di incarico, si fa esplicito rimando alle norme del Codice Civile che disciplinano il lavoro autonomo (art. 2229 e seguenti), alle altre norme anche speciali vigenti in materia, agli obblighi deontologici ed agli usi locali.</p>

          <p className="mt-6">Quanto sopra, è letto dalle parti, approvato in ogni suo articolo e viene sottoscritto in {formData.citta}, lì {new Date(formData.data).toLocaleDateString('it-IT')}</p>

          <div className="flex justify-between mt-12 mb-12">
            <div className="text-center">
              <p>Il Cliente</p>
              <div className="border-b border-black w-48 mt-8"></div>
            </div>
            <div className="text-center">
              <p>Il Professionista</p>
              <div className="border-b border-black w-48 mt-8"></div>
            </div>
          </div>

          <p className="text-xs text-justify">Ai sensi e per gli effetti degli articoli 1341 e 1342 cod civ si accettano espressamente gli articoli: 2) oggetto; 4) dichiarazioni del cliente; durata e recesso; 8) compensi; 9) esonero responsabilità; 13) risoluzioni controversie.</p>

          <div className="flex justify-between mt-12 mb-16">
            <div className="text-center">
              <p>Il Cliente</p>
              <div className="border-b border-black w-48 mt-8"></div>
            </div>
            <div className="text-center">
              <p>Il Professionista</p>
              <div className="border-b border-black w-48 mt-8"></div>
            </div>
          </div>

          {/* Page Break for Allegato A */}
          <div className="break-before-page pt-8">
            <h2 className="text-xl font-bold text-center mb-8">Allegato "A" - Compensi</h2>
            <p className="mb-4">Per i servizi descritti all'art. 2 viene concordato un compenso annuo così determinato:</p>
            
            <table className="w-full border-collapse border border-black text-sm mb-6">
              <tbody>
                <tr>
                  <td className="border border-black p-2">Redazione e deposito del bilancio al Registro Imprese</td>
                  <td className="border border-black p-2 w-24 text-center">Euro</td>
                  <td className="border border-black p-2 w-32 text-right">{formData.compensi.bilancio}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Redazione ed invio telematico della comunicazione e dichiarazioni IVA</td>
                  <td className="border border-black p-2 text-center">Euro</td>
                  <td className="border border-black p-2 text-right">{formData.compensi.iva}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Redazione ed invio telematico delle dichiarazioni dei redditi</td>
                  <td className="border border-black p-2 text-center">Euro</td>
                  <td className="border border-black p-2 text-right">{formData.compensi.redditi}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">Consulenza fiscale ed amministrativa</td>
                  <td className="border border-black p-2 text-center">Euro</td>
                  <td className="border border-black p-2 text-right">{formData.compensi.consulenza}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">COMPENSO FORFETTARIO ANNUALE</td>
                  <td className="border border-black p-2 text-center">Euro</td>
                  <td className="border border-black p-2 text-right">{formData.compensi.forfettario}</td>
                </tr>
                <tr>
                  <td className="border border-black p-2">NON DETERMINABILE</td>
                  <td className="border border-black p-2 text-center">Euro</td>
                  <td className="border border-black p-2 text-center font-bold">{formData.compensi.nonDeterminabile ? 'X' : ''}</td>
                </tr>
              </tbody>
            </table>

            <p className="mb-2">I compensi sopra descritti sono al netto di eventuali spese o anticipazioni che dovesse sostenere il Professionista.</p>
            <p className="mb-2">Per le prestazioni extra contrattuali rese presso la sede del Professionista la quantificazione sarà di euro 70,00 per ora o frazione d'ora.</p>
            <p className="mb-2">Nel caso venisse richiesto l'intervento fuori dalla sede dello Studio il conteggio orario inizierà dalla partenza dallo Studio e terminerà al rientro.</p>
            <p className="mb-2">Sarà dovuto il rimborso chilometrico da calcolare con riferimento alle tariffe ACI dell'anno per l'attività professionale svolta fuori dalla sede dello Studio.</p>
            <p className="mb-2">Gli importi sopra evidenziati hanno validità annuale, salvo quanto appresso specificato.</p>
            <p className="mb-2">Le competenze saranno oggetto di modifica sia a seguito di modifiche normative che comportino nuovi e maggiori oneri a carico dello Studio, sia per prestazioni professionali maggiori o minori che fossero richieste del Cliente, sia per effetto della svalutazione monetaria.</p>
            <p className="mb-6">Il cliente dichiara di aver preso visione dei compensi sopra descritti.</p>

            <p className="mb-12">{formData.citta}, lì {new Date(formData.data).toLocaleDateString('it-IT')}</p>

            <div className="flex justify-between">
              <div className="text-center">
                <p>Il Cliente</p>
                <div className="border-b border-black w-48 mt-8"></div>
              </div>
              <div className="text-center">
                <p>Il Professionista</p>
                <div className="border-b border-black w-48 mt-8"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
