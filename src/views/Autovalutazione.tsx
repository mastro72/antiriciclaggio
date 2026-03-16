import { useState } from 'react';
import { BarChart, Building2, AlertTriangle, Lock, Info, Printer, Save } from 'lucide-react';

const factorTooltips: Record<string, Record<number, string>> = {
  "Tipologia clientela": {
    1: "Prevalenza di clientela stabile, storicamente conosciuta, operante in settori a basso rischio.",
    2: "Clientela mista, prevalentemente stabile ma con alcune attività in settori a rischio medio.",
    3: "Presenza significativa di clientela occasionale, strutture societarie complesse o settori a rischio elevato.",
    4: "Prevalenza di clientela occasionale, PEP (Persone Politicamente Esposte), o operante in settori ad altissimo rischio."
  },
  "Area geografica di operatività": {
    1: "Operatività prevalentemente locale o in aree a basso rischio di criminalità.",
    2: "Operatività nazionale in aree a rischio medio.",
    3: "Operatività in aree ad alto rischio di criminalità organizzata o con controparti in paesi a rischio.",
    4: "Forte operatività con paesi terzi ad alto rischio (es. paradisi fiscali, paesi non cooperativi)."
  },
  "Canali distributivi": {
    1: "Rapporti instaurati esclusivamente con incontro diretto e personale con il cliente.",
    2: "Rapporti instaurati prevalentemente di persona, con rari casi di identificazione a distanza.",
    3: "Uso frequente di canali telematici o identificazione a distanza senza adeguate garanzie.",
    4: "Prevalenza di rapporti a distanza, uso di intermediari non soggetti a obblighi AML."
  },
  "Servizi professionali offerti": {
    1: "Servizi standardizzati a basso rischio (es. tenuta contabilità ordinaria, dichiarazioni redditi semplici).",
    2: "Servizi di consulenza generale, assistenza fiscale e tributaria di media complessità.",
    3: "Operazioni straordinarie, costituzione di trust, pianificazione fiscale internazionale.",
    4: "Gestione di patrimoni, operazioni immobiliari complesse, creazione di società anonime."
  },
  "Formazione": {
    1: "Formazione AML costante, documentata e aggiornata per tutto il personale.",
    2: "Formazione AML periodica ma non sistematica.",
    3: "Formazione AML carente o limitata solo ad alcune figure dello studio.",
    4: "Assenza totale di formazione in materia di Antiriciclaggio."
  },
  "Organizzazione adempimenti adeguata verifica": {
    1: "Procedure interne formalizzate, software dedicato, controlli sistematici.",
    2: "Procedure standard applicate correttamente ma con strumenti prevalentemente manuali.",
    3: "Procedure informali, controlli saltuari, fascicoli cliente spesso incompleti.",
    4: "Assenza di procedure, adeguata verifica non effettuata o gravemente lacunosa."
  },
  "Conservazione documenti, dati e informazioni": {
    1: "Archivio informatico sicuro, backup regolari, rispetto rigoroso dei 10 anni.",
    2: "Archivio cartaceo/informatico ordinato ma con sistemi di sicurezza base.",
    3: "Archiviazione disordinata, difficoltà nel reperire i documenti in tempi brevi.",
    4: "Mancata conservazione dei documenti o grave rischio di perdita/distruzione."
  },
  "Segnalazione operazioni sospette e comunicazione violazioni uso contante": {
    1: "Procedure chiare per l'individuazione e l'inoltro delle SOS, personale consapevole.",
    2: "Conoscenza base degli obblighi di segnalazione, ma assenza di procedure formalizzate.",
    3: "Scarsa consapevolezza degli indicatori di anomalia, difficoltà nell'individuare operazioni sospette.",
    4: "Totale ignoranza degli obblighi di SOS o deliberata volontà di non segnalare."
  }
};

export default function Autovalutazione() {
  const [rVals, setRVals] = useState<number[]>([0,0,0,0]);
  const [vVals, setVVals] = useState<number[]>([0,0,0,0]);

  const setR = (idx: number, val: number) => {
    const newR = [...rVals];
    newR[idx] = val;
    setRVals(newR);
  };

  const setV = (idx: number, val: number) => {
    const newV = [...vVals];
    newV[idx] = val;
    setVVals(newV);
  };

  const a = rVals.filter(v=>v>0).length > 0 ? rVals.filter(v=>v>0).reduce((a,b)=>a+b,0) / rVals.filter(v=>v>0).length : 0;
  const b = vVals.filter(v=>v>0).length > 0 ? vVals.filter(v=>v>0).reduce((a,b)=>a+b,0) / vVals.filter(v=>v>0).length : 0;
  const residuo = (a > 0 && b > 0) ? (a + b) / 2 : 0;

  let verdict = '—';
  let color = 'rgba(255,255,255,0.15)';
  if (residuo > 0) {
    if (residuo <= 1.5) { verdict = 'BASSO'; color = 'var(--color-green-600)'; }
    else if (residuo <= 2.5) { verdict = 'MEDIO'; color = '#e8b824'; }
    else { verdict = 'ALTO'; color = 'var(--color-red-600)'; }
  }

  const handleSave = async () => {
    try {
      const { saveGeneratedDocument } = await import('../utils/fs');
      const success = await saveGeneratedDocument(null, 'Autovalutazione_Rischio_Studio', 'print-autovalutazione');
      if (success) {
        alert('Autovalutazione salvata con successo nella cartella di lavoro locale!');
      }
    } catch (err) {
      console.error(err);
      alert('Impossibile generare il file PDF nella cartella locale.');
    }
  };

  return (
    <div className="animate-in fade-in duration-300 print:m-0 print:p-0" id="print-autovalutazione">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5 print:hidden">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Autovalutazione del Rischio Studio</h2>
          <p className="mt-1.5 text-sm text-slate-500">Artt. 15 e 16, D.Lgs. 231/2007 — Valutazione rischio inerente e vulnerabilità</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          <button className="btn btn-gold" onClick={handleSave}><Save size={16} /> Salva PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="card">
            <div className="card-title"><div className="ct-icon"><AlertTriangle size={18} /></div> I — Rischio Inerente</div>
            <RiskFactor label="Tipologia clientela" val={rVals[0]} onChange={(v) => setR(0, v)} />
            <RiskFactor label="Area geografica di operatività" val={rVals[1]} onChange={(v) => setR(1, v)} />
            <RiskFactor label="Canali distributivi" val={rVals[2]} onChange={(v) => setR(2, v)} />
            <RiskFactor label="Servizi professionali offerti" val={rVals[3]} onChange={(v) => setR(3, v)} />
          </div>

          <div className="card">
            <div className="card-title"><div className="ct-icon"><Lock size={18} /></div> II — Vulnerabilità</div>
            <RiskFactor label="Formazione" val={vVals[0]} onChange={(v) => setV(0, v)} />
            <RiskFactor label="Organizzazione adempimenti adeguata verifica" val={vVals[1]} onChange={(v) => setV(1, v)} />
            <RiskFactor label="Conservazione documenti, dati e informazioni" val={vVals[2]} onChange={(v) => setV(2, v)} />
            <RiskFactor label="Segnalazione operazioni sospette e comunicazione violazioni uso contante" val={vVals[3]} onChange={(v) => setV(3, v)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-navy p-6 text-center text-white sticky top-24">
            <div className="mb-2 text-xs tracking-widest text-white/60">RISCHIO INERENTE (A)</div>
            <div className="font-serif text-3xl font-bold text-gold mb-4">{a > 0 ? a.toFixed(2) : '—'}</div>
            
            <div className="mb-2 text-xs tracking-widest text-white/60">VULNERABILITÀ (B)</div>
            <div className="font-serif text-3xl font-bold text-gold mb-4">{b > 0 ? b.toFixed(2) : '—'}</div>
            
            <div className="h-px bg-white/20 my-4" />
            
            <div className="mb-2 text-xs tracking-widest text-white/60">RISCHIO RESIDUO</div>
            <div className="font-serif text-5xl font-bold text-gold">{residuo > 0 ? residuo.toFixed(2) : '—'}</div>
            
            <div className="mt-4 inline-block rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: color }}>
              {residuo > 0 ? `Rischio ${verdict}` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskFactor({ label, val, onChange }: any) {
  const tooltips = factorTooltips[label] || {};

  return (
    <div className="mb-4 rounded-xl border-2 border-warm-gray bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="group relative">
          <Info size={16} className="text-slate-400 cursor-help" />
          <div className="absolute right-0 bottom-full mb-2 hidden w-64 rounded-lg bg-navy p-3 text-xs text-white shadow-lg group-hover:block z-10">
            <div className="font-semibold text-gold mb-1">Criteri di valutazione:</div>
            <ul className="space-y-1.5">
              <li><span className="font-bold text-green-400">1:</span> {tooltips[1]}</li>
              <li><span className="font-bold text-yellow-400">2:</span> {tooltips[2]}</li>
              <li><span className="font-bold text-orange-400">3:</span> {tooltips[3]}</li>
              <li><span className="font-bold text-red-400">4:</span> {tooltips[4]}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {[1,2,3,4].map(v => (
          <div 
            key={v}
            onClick={() => onChange(v)}
            title={tooltips[v]}
            className={`group relative h-4 flex-1 cursor-pointer rounded-full transition-colors ${
              val >= v 
                ? (val === 1 ? 'bg-green-500' : val === 2 ? 'bg-yellow-400' : val === 3 ? 'bg-orange-500' : 'bg-red-500')
                : 'bg-warm-gray hover:bg-slate-300'
            }`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-48 rounded bg-slate-800 p-2 text-xs text-white shadow-lg group-hover:block z-10 pointer-events-none">
              <div className="font-bold mb-1">Livello {v}</div>
              {tooltips[v]}
            </div>
          </div>
        ))}
        <div className="w-12 text-center text-sm font-bold text-slate-500">{val > 0 ? val : '-'}</div>
      </div>
    </div>
  );
}
