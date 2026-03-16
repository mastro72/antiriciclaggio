import { Building2, User, Factory, FolderOpen, Zap, BarChart, CheckSquare, FileText, Lock, Bot, BookOpen } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }: { currentView: string, setCurrentView: (v: string) => void }) {
  const sections = [
    {
      title: 'Identificazione',
      items: [
        { id: 'anagrafica', icon: <Building2 size={18} />, label: 'Anagrafica Studio' },
        { id: 'cliente-pf', icon: <User size={18} />, label: 'Pers. Fisica / Ditta Indiv.' },
        { id: 'cliente-pg', icon: <Factory size={18} />, label: 'Soggetto Collettivo' },
        { id: 'fascicolo', icon: <FolderOpen size={18} />, label: 'Fascicolo Cliente', badge: '!' },
      ]
    },
    {
      title: 'Valutazione Rischio',
      items: [
        { id: 'valutazione2025', icon: <Zap size={18} />, label: 'Criteri 2025' },
      ]
    },
    {
      title: 'Studio',
      items: [
        { id: 'autovaluta', icon: <BarChart size={18} />, label: 'Autovalutazione Studio' },
        { id: 'checklist', icon: <CheckSquare size={18} />, label: 'Check List Adempimenti' },
      ]
    },
    {
      title: 'Documenti',
      items: [
        { id: 'mandato', icon: <FileText size={18} />, label: 'Mandato Professionale' },
        { id: 'scritture', icon: <BookOpen size={18} />, label: 'Tenuta Scritture Contabili' },
        { id: 'privacy', icon: <Lock size={18} />, label: 'Informativa Privacy' },
        { id: 'ia', icon: <Bot size={18} />, label: 'Informativa IA' },
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r border-warm-gray bg-white py-6">
      {sections.map((sec, i) => (
        <div key={i} className="mb-4 px-4">
          <div className="mb-2 border-b border-warm-gray px-2 pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-500">
            {sec.title}
          </div>
          {sec.items.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                currentView === item.id
                  ? 'bg-navy font-medium text-white'
                  : 'text-slate-600 hover:bg-cream hover:text-slate-900'
              }`}
            >
              <span className="flex w-5 justify-center">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  currentView === item.id ? 'bg-white/30 text-white' : 'bg-gold text-navy'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
