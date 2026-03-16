import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, FileText, User, Shield, BookOpen, AlertCircle, Upload, Download, Trash2, HardDrive } from 'lucide-react';
import { AppState } from '../store';
import { set, get, del } from 'idb-keyval';

export default function Fascicolo({ state, currentClienteId, setView }: { state: AppState, currentClienteId: string | null, setView: (v: string) => void }) {
  const cliente = state.clienti.find(c => c.id === currentClienteId);

  const items = [
    { label: 'Copia del documento di riconoscimento', note: 'Ai sensi D.P.R. 445/2000: carta d\'identità, passaporto, patente, ecc. Deve essere munito di fotografia e timbro.' },
    { label: 'Fotocopia codice fiscale', note: '' },
    { label: 'Fotocopia partita IVA', note: '' },
    { label: 'Visura camerale', note: 'Consigliata per ditte individuali, opportuna per soggetti diversi dalle persone fisiche.' },
    { label: 'Verbale CdA di nomina (se applicabile)', note: '' },
    { label: 'Scheda per l\'adeguata verifica della clientela', note: 'Scheda di identificazione compilata e firmata.' },
    { label: 'Scheda di valutazione del rischio (ANTIRIC)', note: 'Criteri 2025 o precedenti, a seconda della data di apertura del rapporto.' },
    { label: 'Documentazione sul titolare effettivo', note: 'Art. 19 co.2 D.Lgs. 231/2007. Possibile consultazione pubblici registri.' },
    { label: 'Documentazione per obblighi semplificati/rafforzati', note: 'Art. 25 e 28 D.Lgs. 231/2007 ove applicabili.' },
    { label: 'Eventuale attestazione verifica da terzi', note: 'Art. 30 D.Lgs. 231/2007.' },
    { label: 'Copia del mandato professionale', note: 'Per individuare data inizio e oggetto della prestazione. In caso di mandato verbale: e-mail di conferma.' },
    { label: 'Dichiarazione del cliente sul titolare effettivo', note: 'Art. 21 D.Lgs. 231/2007.' },
    { label: 'Dichiarazione sullo scopo e natura dell\'operazione', note: 'Art. 18 lett. c) D.Lgs. 231/2007.' },
    { label: 'Dichiarazione sui mezzi economici e finanziari', note: 'Da richiedersi se i mezzi sembrano inadeguati all\'operazione.' },
    { label: 'Scheda per controllo periodico utilizzo contante', note: 'Cadenza legata al rischio cliente individuato nella scheda di valutazione.' },
    { label: 'Documenti delle prestazioni professionali svolte', note: 'Possono essere conservati separatamente ed esibiti su richiesta.' },
    { label: 'Documentazione sulla cessazione del rapporto', note: 'Lettera di revoca/rinuncia, cancellazione IVA/CCIAA, ecc.' },
    { label: 'Ogni altra documentazione utile ai fini AML', note: 'Motivazioni di scelte fatte, es. perché non si è proceduto a SOS.' },
  ];

  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [files, setFiles] = useState<Record<number, { name: string, type: string }>>({});
  const [dirHandle, setDirHandle] = useState<any>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Verify permission for the directory handle
  const verifyPermission = async (handle: any) => {
    const options = { mode: 'readwrite' };
    if ((await handle.queryPermission(options)) === 'granted') {
      return true;
    }
    if ((await handle.requestPermission(options)) === 'granted') {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const initDir = async () => {
      try {
        const handle = await get('workspace_dir');
        if (handle) {
          // We don't request permission immediately on load to avoid annoying popups,
          // we just set the handle. We will request permission when the user tries to read/write.
          setDirHandle(handle);
        }
      } catch (e) {
        console.error("Error loading directory handle", e);
      }
    };
    initDir();
  }, []);

  useEffect(() => {
    if (!currentClienteId) return;
    try {
      const saved = localStorage.getItem(`fascicolo_checks_${currentClienteId}`);
      if (saved) setChecks(JSON.parse(saved));
      else setChecks({});
    } catch {}

    // Load file metadata
    const loadFiles = async () => {
      const loadedFiles: Record<number, { name: string, type: string }> = {};
      for (let i = 0; i < items.length; i++) {
        const fileData = await get(`file_${currentClienteId}_${i}`);
        if (fileData) {
          loadedFiles[i] = { name: fileData.name, type: fileData.type };
        }
      }
      setFiles(loadedFiles);
    };
    loadFiles();
  }, [currentClienteId]);

  const selectDirectory = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      await set('workspace_dir', handle);
      setDirHandle(handle);
    } catch (err: any) {
      console.error("Directory selection cancelled or failed", err);
      if (err.name === 'SecurityError' || err.message.includes('Cross origin sub frames')) {
        alert("Per motivi di sicurezza del browser, non è possibile selezionare una cartella locale mentre l'app è in questa modalità di anteprima.\n\nPer favore, APRI L'APP IN UNA NUOVA SCHEDA (cliccando sull'icona in alto a destra) per poter selezionare la cartella di salvataggio sul tuo disco C:\\.");
      }
    }
  };

  const toggleCheck = (i: number) => {
    if (!currentClienteId) return;
    const newChecks = { ...checks, [i]: !checks[i] };
    setChecks(newChecks);
    localStorage.setItem(`fascicolo_checks_${currentClienteId}`, JSON.stringify(newChecks));
  };

  const handleFileUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentClienteId || !e.target.files || e.target.files.length === 0 || !cliente) return;
    
    if (!dirHandle) {
      alert("Per favore, seleziona prima la cartella di lavoro locale in alto.");
      return;
    }

    const hasPermission = await verifyPermission(dirHandle);
    if (!hasPermission) {
      alert("Permesso negato per accedere alla cartella.");
      return;
    }

    const file = e.target.files[0];
    
    // Format filename: [numeroCliente]_[label].[ext]
    const ext = file.name.split('.').pop() || '';
    const safeLabel = items[i].label.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const numCliente = cliente.numeroCliente || 'NOCLIENTNUM';
    const numClientePadded = String(cliente.numeroCliente || 0).padStart(5, '0');
    const fileName = `${numCliente}_${safeLabel}.${ext}`;
    
    try {
      // Get or create client subfolder
      const clientDirHandle = await dirHandle.getDirectoryHandle(numClientePadded, { create: true });
      
      // Write to local file system in the subfolder
      const fileHandle = await clientDirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file);
      await writable.close();

      // Store metadata in IndexedDB
      await set(`file_${currentClienteId}_${i}`, {
        name: fileName,
        type: file.type
      });
      
      setFiles(prev => ({ ...prev, [i]: { name: fileName, type: file.type } }));
      
      // Automatically check the item when a file is uploaded
      if (!checks[i]) {
        toggleCheck(i);
      }
    } catch (err) {
      console.error("Error writing file", err);
      alert("Errore durante il salvataggio del file nella cartella locale. Assicurati di aver concesso i permessi.");
    }
  };

  const handleFileDownload = async (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentClienteId || !cliente || !dirHandle) {
      if (!dirHandle) alert("Seleziona prima la cartella di lavoro locale.");
      return;
    }
    
    const hasPermission = await verifyPermission(dirHandle);
    if (!hasPermission) return;

    const fileData = await get(`file_${currentClienteId}_${i}`);
    if (!fileData) return;
    
    try {
      const numClientePadded = String(cliente.numeroCliente || 0).padStart(5, '0');
      const clientDirHandle = await dirHandle.getDirectoryHandle(numClientePadded, { create: false });
      const fileHandle = await clientDirHandle.getFileHandle(fileData.name);
      const file = await fileHandle.getFile();
      
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.name;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error reading file", err);
      alert("Impossibile trovare il file nella cartella locale. Potrebbe essere stato spostato o eliminato.");
    }
  };

  const handleFileDelete = async (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentClienteId || !dirHandle || !cliente) return;
    
    if (confirm('Sei sicuro di voler eliminare questo file dalla cartella locale?')) {
      const hasPermission = await verifyPermission(dirHandle);
      if (!hasPermission) return;

      const fileData = await get(`file_${currentClienteId}_${i}`);
      if (fileData) {
        try {
          const numClientePadded = String(cliente.numeroCliente || 0).padStart(5, '0');
          const clientDirHandle = await dirHandle.getDirectoryHandle(numClientePadded, { create: false });
          await clientDirHandle.removeEntry(fileData.name);
        } catch (err) {
          console.error("Error deleting file from local folder", err);
          // Continue to delete metadata even if file is already gone
        }
      }

      await del(`file_${currentClienteId}_${i}`);
      const newFiles = { ...files };
      delete newFiles[i];
      setFiles(newFiles);
    }
  };

  if (!cliente) {
    return (
      <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-full text-center">
        <div className="rounded-full bg-warm-gray p-6 mb-4">
          <FolderOpen size={48} className="text-slate-400" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-navy mb-2">Nessun Cliente Selezionato</h2>
        <p className="text-slate-500 mb-6 max-w-md">Per visualizzare o gestire il fascicolo, seleziona un cliente dal registro clienti.</p>
        <button className="btn btn-primary" onClick={() => setView('clienti')}>Vai al Registro Clienti</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-7 flex items-start justify-between border-b-2 border-warm-gray pb-5">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-navy">Fascicolo Cliente</h2>
          <p className="mt-1.5 text-lg font-medium text-slate-700">
            {cliente.numeroCliente && <span className="font-mono text-navy bg-warm-gray px-2 py-0.5 rounded text-sm mr-2">#{cliente.numeroCliente}</span>}
            {cliente.nome} 
            <span className="text-sm font-normal text-slate-500 ml-2">({cliente.tipo === 'pf' ? 'Persona Fisica' : 'Soggetto Collettivo'})</span>
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => setView('clienti')}>Torna ai Clienti</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
            <span className="text-lg">⚠️</span>
            <p>I documenti devono essere conservati per <strong>10 anni</strong> dalla cessazione del rapporto professionale (Art. 31 D.Lgs. 231/2007).</p>
          </div>

          <div className="card border-navy/20 bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy flex items-center gap-2">
                  <HardDrive size={18} />
                  Cartella di Lavoro Locale
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {dirHandle ? `Cartella selezionata: ${dirHandle.name}` : 'Seleziona una cartella sul tuo PC (es. C:\\Fascicoli) per salvare i documenti.'}
                </p>
              </div>
              <button 
                onClick={selectDirectory}
                className="btn btn-secondary text-sm"
              >
                {dirHandle ? 'Cambia Cartella' : 'Seleziona Cartella'}
              </button>
            </div>
            {window.self !== window.top && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>⚠️ Attenzione:</strong> Sei nella modalità anteprima. Per motivi di sicurezza del browser, la selezione della cartella locale è bloccata. 
                <strong> Clicca sull'icona "Apri in una nuova scheda" (in alto a destra)</strong> per utilizzare questa funzione e salvare i file sul tuo disco C:\.
              </div>
            )}
            {!dirHandle && window.self === window.top && (
              <p className="text-xs text-red-600 mt-3 font-medium">
                * Devi selezionare una cartella per poter caricare i file.
              </p>
            )}
          </div>

          <div className="card">
            <div className="card-title"><div className="ct-icon"><FolderOpen size={18} /></div> Documenti Obbligatori</div>
            <div className="space-y-2">
              {items.map((item, i) => {
                const checked = checks[i] || false;
                return (
                  <div 
                    key={i} 
                    className={`flex flex-col gap-2 rounded-lg border-2 p-3 transition-colors ${
                      checked ? 'border-green-500 bg-green-50' : 'border-warm-gray bg-white hover:border-navy'
                    }`}
                  >
                    <div className="flex cursor-pointer items-start gap-3" onClick={() => toggleCheck(i)}>
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => {}} 
                        className="mt-0.5 h-4 w-4 shrink-0 accent-green-600" 
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{item.label}</div>
                        {item.note && <div className="mt-1 text-xs text-slate-500">{item.note}</div>}
                      </div>
                    </div>
                    
                    <div className="ml-7 flex items-center gap-2 mt-1">
                      {files[i] ? (
                        <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 rounded px-2 py-1 shadow-sm w-full justify-between">
                          <span className="truncate max-w-[200px] text-slate-600" title={files[i].name}>{files[i].name}</span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => handleFileDownload(i, e)}
                              className="p-1 text-navy hover:bg-slate-100 rounded transition-colors"
                              title="Scarica file"
                            >
                              <Download size={14} />
                            </button>
                            <button 
                              onClick={(e) => handleFileDelete(i, e)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Elimina file"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={el => fileInputRefs.current[i] = el}
                            onChange={(e) => handleFileUpload(i, e)}
                          />
                          <button 
                            onClick={(e) => { e.stopPropagation(); fileInputRefs.current[i]?.click(); }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-navy hover:text-gold transition-colors"
                          >
                            <Upload size={14} />
                            Carica file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card bg-navy text-white">
            <h3 className="font-serif text-xl font-semibold mb-4 text-gold">Generazione Documenti</h3>
            <p className="text-sm text-white/70 mb-6">Accedi rapidamente ai moduli per generare la documentazione necessaria per questo cliente.</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => setView(cliente.tipo === 'pf' ? 'cliente-pf' : 'cliente-pg')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <User size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Scheda Identificazione</div>
                  <div className="text-xs text-white/60">Adeguata verifica clientela</div>
                </div>
              </button>

              <button 
                onClick={() => setView('mandato')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <FileText size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Mandato Professionale</div>
                  <div className="text-xs text-white/60">Incarico e compensi</div>
                </div>
              </button>

              <button 
                onClick={() => setView('privacy')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <Shield size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Informativa Privacy</div>
                  <div className="text-xs text-white/60">Trattamento dati personali</div>
                </div>
              </button>

              <button 
                onClick={() => setView('valutazione2025')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <AlertCircle size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Valutazione Rischio</div>
                  <div className="text-xs text-white/60">Criteri 2025</div>
                </div>
              </button>

              <button 
                onClick={() => setView('ia')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <AlertCircle size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Informativa IA</div>
                  <div className="text-xs text-white/60">Utilizzo strumenti IA</div>
                </div>
              </button>

              <button 
                onClick={() => setView('scritture')}
                className="w-full flex items-center gap-3 rounded-lg bg-white/10 p-3 text-left hover:bg-white/20 transition-colors"
              >
                <BookOpen size={18} className="text-gold" />
                <div>
                  <div className="font-medium text-sm">Tenuta Scritture</div>
                  <div className="text-xs text-white/60">Dichiarazione contabile</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
