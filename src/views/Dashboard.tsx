import { AppState } from '../store';
import { Printer, Plus, Users, AlertTriangle, BookOpen } from 'lucide-react';

export default function Dashboard({ state, setView }: { state: AppState, setView: (v: string) => void }) {
  const clienti = state.clienti || [];
  const total = clienti.length;
  const alto = clienti.filter(c => c.riskLevel >= 4).length;
  const medio = clienti.filter(c => c.riskLevel === 3).length;
  const basso = clienti.filter(c => c.riskLevel <= 2).length;

  const riskLabel = (lv: number) => ['','Basso','Medio-Basso','Medio-Alto','Alto'][lv] || 'n.d.';

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Dashboard Studio</h2>
          <p className="mt-1.5 text-sm text-slate-500">Panoramica degli adempimenti antiriciclaggio e privacy. D.Lgs. 231/2007 — Regolamento UE 2016/679</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => window.print()}><Printer size={16} /> Stampa</button>
          <button className="btn btn-primary" onClick={() => setView('cliente-pf')}><Plus size={16} /> Nuovo Cliente</button>
        </div>
      </div>

      <div className="mb-7 grid grid-cols-4 gap-4">
        <StatCard label="Clienti Totali" value={total} sub="nel registro" color="bg-gold" pct={total > 0 ? 100 : 0} />
        <StatCard label="Rischio Alto" value={alto} sub="da monitorare" color="bg-red-600" textClass="text-red-600" pct={total ? (alto/total)*100 : 0} />
        <StatCard label="Rischio Medio" value={medio} sub="controllo ordinario" color="bg-orange-500" textClass="text-orange-500" pct={total ? (medio/total)*100 : 0} />
        <StatCard label="Rischio Basso" value={basso} sub="adeguata verifica base" color="bg-green-600" textClass="text-green-600" pct={total ? (basso/total)*100 : 0} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="card">
          <div className="card-title"><div className="ct-icon"><Users size={18} /></div> Ultimi Clienti Registrati</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-warm-gray bg-cream text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Rischio</th>
                  <th className="p-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {clienti.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500">
                      Nessun cliente ancora registrato. <button onClick={() => setView('cliente-pf')} className="text-navy underline">Aggiungi il primo →</button>
                    </td>
                  </tr>
                ) : (
                  clienti.slice(-5).reverse().map(c => (
                    <tr key={c.id} className="border-b border-warm-gray hover:bg-cream">
                      <td className="p-3 font-medium">{c.nome}</td>
                      <td className="p-3 text-xs text-slate-500">{c.tipo === 'pf' ? 'Pers. Fisica' : 'Sogg. Collettivo'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.riskLevel >= 4 ? 'bg-red-100 text-red-700' :
                          c.riskLevel === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {riskLabel(c.riskLevel)}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{c.dataRegistrazione}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><div className="ct-icon"><AlertTriangle size={18} /></div> Adempimenti in Scadenza</div>
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-blue-50 p-3.5 text-sm text-blue-900">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>La verifica periodica è dovuta con cadenza correlata al profilo di rischio: annuale per clienti ad alto rischio, biennale per rischio medio, quadriennale per rischio basso (Art. 18, D.Lgs. 231/2007).</p>
          </div>
          <div className="p-5 text-center text-sm text-slate-500">
            Nessuna scadenza prossima
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><div className="ct-icon"><BookOpen size={18} /></div> Riferimenti Normativi</div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border-l-4 border-navy bg-cream p-3.5">
            <strong className="block mb-1">D.Lgs. 231/2007</strong>
            <span className="text-slate-500 text-xs">Normativa antiriciclaggio principale. Obblighi di adeguata verifica, conservazione, segnalazione.</span>
          </div>
          <div className="rounded-lg border-l-4 border-gold bg-cream p-3.5">
            <strong className="block mb-1">Regolamento UE 2016/679</strong>
            <span className="text-slate-500 text-xs">GDPR. Protezione dati personali, diritti dell'interessato, obblighi titolare del trattamento.</span>
          </div>
          <div className="rounded-lg border-l-4 border-green-600 bg-cream p-3.5">
            <strong className="block mb-1">L. 23/9/2025, n.132</strong>
            <span className="text-slate-500 text-xs">Informativa obbligatoria sull'utilizzo di strumenti di Intelligenza Artificiale nelle prestazioni.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, textClass = "text-navy", pct }: any) {
  return (
    <div className="card !mb-0 !p-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`font-serif text-4xl font-bold leading-none ${textClass}`}>{value}</div>
      <div className="mt-1.5 text-xs text-slate-500">{sub}</div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-warm-gray">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
