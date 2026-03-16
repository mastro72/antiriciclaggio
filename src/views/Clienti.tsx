import { AppState } from '../store';
import { Users, Plus, FolderOpen } from 'lucide-react';

export default function Clienti({ state, setView, setCurrentClienteId }: { state: AppState, setView: (v: string) => void, setCurrentClienteId: (id: string) => void }) {
  const clienti = state.clienti || [];
  const riskLabel = (lv: number) => ['','Basso','Medio-Basso','Medio-Alto','Alto'][lv] || 'n.d.';

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Registro Clienti</h2>
          <p className="mt-1.5 text-sm text-slate-500">Elenco completo dei clienti con profilo di rischio antiriciclaggio</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => { setCurrentClienteId(''); setView('cliente-pg'); }}><Plus size={16} /> Soggetto Collettivo</button>
          <button className="btn btn-primary" onClick={() => { setCurrentClienteId(''); setView('cliente-pf'); }}><Plus size={16} /> Persona Fisica</button>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-warm-gray bg-cream text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-4">N. Cliente</th>
              <th className="p-4">Cliente / Denominazione</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Cod. Fiscale</th>
              <th className="p-4">Rischio</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clienti.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  Nessun cliente registrato
                </td>
              </tr>
            ) : (
              clienti.map(c => (
                <tr key={c.id} className="border-b border-warm-gray hover:bg-cream">
                  <td className="p-4 font-mono text-xs text-slate-600">{c.numeroCliente || '—'}</td>
                  <td className="p-4">
                    <div className="font-medium text-navy">{c.nome}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{c.tipo === 'pf' ? 'Pers. Fisica' : 'Collettivo'}</td>
                  <td className="p-4 font-mono text-xs text-slate-600">{c.cf || '—'}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.riskLevel >= 4 ? 'bg-red-100 text-red-700' :
                      c.riskLevel === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {riskLabel(c.riskLevel)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{c.dataRegistrazione}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setCurrentClienteId(c.id); setView('fascicolo'); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy/90 transition-colors"
                    >
                      <FolderOpen size={14} />
                      Fascicolo
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
