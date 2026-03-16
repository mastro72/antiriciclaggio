import { useState, useEffect } from 'react';
import { CheckSquare, Printer } from 'lucide-react';

export default function Checklist() {
  const sections = [
    { title: 'Adempimenti dell\'Intermediario Fiscale', items: [
      'Viene rilasciato l\'impegno alla trasmissione telematica delle dichiarazioni dei redditi',
      'Esiste un prospetto avanzamento lavori nella fase di compilazione dichiarazioni',
      'Esiste un prospetto avanzamento lavori nella fase di invio telematico',
      'Viene effettuato lo scarico periodico delle ricevute Entratel',
      'In caso di dichiarazioni scartate, si provvede al reinvio entro 5 giorni',
      'Viene consegnata al cliente copia della dichiarazione inviata',
      'Viene consegnata al cliente copia della ricevuta di invio',
    ]},
    { title: 'Privacy — GDPR 2016/679', items: [
      'È stata predisposta l\'informativa privacy per i clienti',
      'Sono stati nominati gli incaricati al trattamento dei dati',
      'È stato redatto il documento di valutazione rischi privacy (DPS)',
      'I dati sono conservati secondo i termini di legge',
      'Esiste procedura per la gestione delle richieste di accesso/cancellazione',
      'È presente accordo di contitolarità (se applicabile)',
    ]},
    { title: 'Antiriciclaggio — D.Lgs. 231/2007', items: [
      'È stata effettuata la registrazione di tutti i clienti con obblighi AML',
      'Sono presenti le schede di identificazione per tutti i clienti',
      'È stata effettuata la valutazione del rischio per ciascun cliente',
      'Il fascicolo di ogni cliente è completo e aggiornato',
      'È stato redatto il documento di autovalutazione del rischio studio',
      'I collaboratori sono stati formati in materia antiriciclaggio',
      'Esiste procedura interna per rilevazione operazioni sospette',
      'Sono stati aggiornati i dati dei titolari effettivi',
      'Sono state effettuate le verifiche periodiche secondo scadenza',
    ]},
    { title: 'Intelligenza Artificiale — L. 132/2025', items: [
      'È stata predisposta l\'informativa sull\'utilizzo di strumenti IA',
      'L\'informativa IA è stata consegnata ai clienti',
      'Sono stati identificati gli strumenti IA utilizzati (tipo, provenienza)',
    ]},
  ];

  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('checklist_state');
      if (saved) setChecks(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleCheck = (key: string) => {
    const newChecks = { ...checks, [key]: !checks[key] };
    setChecks(newChecks);
    localStorage.setItem('checklist_state', JSON.stringify(newChecks));
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Check List Adempimenti Studio</h2>
          <p className="mt-1.5 text-sm text-slate-500">Verifica adempimenti Intermediario Fiscale, Privacy e Antiriciclaggio</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Esporta</button>
      </div>

      {sections.map((sec, si) => (
        <div key={si} className="card">
          <div className="card-title"><div className="ct-icon"><CheckSquare size={18} /></div> {sec.title}</div>
          <div className="space-y-2">
            {sec.items.map((item, ii) => {
              const key = `check_${si}_${ii}`;
              const checked = checks[key] || false;
              return (
                <div 
                  key={ii} 
                  onClick={() => toggleCheck(key)}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-colors ${
                    checked ? 'border-green-500 bg-green-50' : 'border-warm-gray bg-white hover:border-navy'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={checked} 
                    onChange={() => {}} 
                    className="mt-0.5 h-4 w-4 shrink-0 accent-green-600" 
                  />
                  <div className="text-sm leading-snug text-slate-700">{item}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
