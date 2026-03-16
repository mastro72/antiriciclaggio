import { useState } from 'react';
import { Scale, LayoutDashboard, Users, Search, ClipboardCheck, CheckSquare } from 'lucide-react';
import { useAppState } from './store';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Clienti from './views/Clienti';
import Anagrafica from './views/Anagrafica';
import ClientePF from './views/ClientePF';
import ClientePG from './views/ClientePG';
import Fascicolo from './views/Fascicolo';
import Valutazione2025 from './views/Valutazione2025';
import Autovalutazione from './views/Autovalutazione';
import Checklist from './views/Checklist';
import Mandato from './views/Mandato';
import Privacy from './views/Privacy';
import InformativaIA from './views/InformativaIA';
import DichiarazioneScritture from './views/DichiarazioneScritture';

export default function App() {
  const { state, updateStudio, addCliente } = useAppState();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentClienteId, setCurrentClienteId] = useState<string | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard state={state} setView={setCurrentView} />;
      case 'clienti': return <Clienti state={state} setView={setCurrentView} setCurrentClienteId={setCurrentClienteId} />;
      case 'anagrafica': return <Anagrafica studio={state.studio} updateStudio={updateStudio} />;
      case 'cliente-pf': return <ClientePF addCliente={addCliente} setView={setCurrentView} studio={state.studio} currentClienteId={currentClienteId} state={state} />;
      case 'cliente-pg': return <ClientePG addCliente={addCliente} setView={setCurrentView} studio={state.studio} currentClienteId={currentClienteId} state={state} />;
      case 'fascicolo': return <Fascicolo state={state} currentClienteId={currentClienteId} setView={setCurrentView} />;
      case 'valutazione2025': return <Valutazione2025 state={state} currentClienteId={currentClienteId} setView={setCurrentView} />;
      case 'autovaluta': return <Autovalutazione />;
      case 'checklist': return <Checklist />;
      case 'mandato': return <Mandato studio={state.studio} currentClienteId={currentClienteId} state={state} setView={setCurrentView} />;
      case 'privacy': return <Privacy studio={state.studio} currentClienteId={currentClienteId} state={state} setView={setCurrentView} />;
      case 'ia': return <InformativaIA studio={state.studio} currentClienteId={currentClienteId} state={state} setView={setCurrentView} />;
      case 'scritture': return <DichiarazioneScritture studio={state.studio} currentClienteId={currentClienteId} state={state} setView={setCurrentView} />;
      default: return <Dashboard state={state} setView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-cream text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy text-white shadow-lg print:hidden">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-xl">
              <Scale size={24} className="text-navy" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-wide text-white">Antiriciclaggio & Privacy</h1>
              <p className="text-xs tracking-widest text-gold-light uppercase mt-0.5">Gestione Studio Professionale · D.Lgs. 231/2007</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <NavBtn active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavBtn active={currentView === 'clienti'} onClick={() => setCurrentView('clienti')} icon={<Users size={18} />} label="Clienti" />
            <NavBtn active={currentView === 'valutazione2025'} onClick={() => setCurrentView('valutazione2025')} icon={<Search size={18} />} label="Valutazione" />
            <NavBtn active={currentView === 'autovaluta'} onClick={() => setCurrentView('autovaluta')} icon={<ClipboardCheck size={18} />} label="Autovalutazione" />
            <NavBtn active={currentView === 'checklist'} onClick={() => setCurrentView('checklist')} icon={<CheckSquare size={18} />} label="Check List" />
          </nav>
        </div>
      </header>

      <div className="flex h-[calc(100vh-68px)] print:h-auto">
        <div className="print:hidden">
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
        <main className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-gold text-navy font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
