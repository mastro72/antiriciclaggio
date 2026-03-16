import { get } from 'idb-keyval';
import html2pdf from 'html2pdf.js';

export const getClientDirHandle = async (numeroCliente: string | number) => {
  const dirHandle = await get('workspace_dir');
  if (!dirHandle) {
    throw new Error("Cartella di lavoro non selezionata. Vai nel Fascicolo per selezionarla.");
  }
  
  const options = { mode: 'readwrite' };
  if ((await dirHandle.queryPermission(options)) !== 'granted') {
    if ((await dirHandle.requestPermission(options)) !== 'granted') {
      throw new Error("Permesso negato per accedere alla cartella di lavoro.");
    }
  }

  const numStr = String(numeroCliente || 0).padStart(5, '0');
  const clientDirHandle = await dirHandle.getDirectoryHandle(numStr, { create: true });
  return clientDirHandle;
};

export const saveGeneratedDocument = async (
  numeroCliente: string | number, 
  documentName: string, 
  elementId: string
) => {
  try {
    const clientDir = await getClientDirHandle(numeroCliente);
    
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Elemento documento non trovato");

    // Temporarily make the element visible if it's hidden
    const wasHidden = element.classList.contains('hidden');
    if (wasHidden) {
      element.classList.remove('hidden');
      element.classList.add('block');
    }

    // Generate PDF blob
    const opt = {
      margin:       10,
      filename:     `${documentName}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

    // Restore original visibility
    if (wasHidden) {
      element.classList.add('hidden');
      element.classList.remove('block');
    }

    // Write to local file system
    const fileName = `${String(numeroCliente || 0).padStart(5, '0')}_${documentName}.pdf`;
    const fileHandle = await clientDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(pdfBlob);
    await writable.close();

    return true;
  } catch (err: any) {
    console.error("Error saving generated document", err);
    if (err.name === 'SecurityError' || err.message.includes('Cross origin sub frames')) {
      alert("Per motivi di sicurezza del browser, non è possibile salvare file locali mentre l'app è in modalità anteprima.\n\nPer favore, APRI L'APP IN UNA NUOVA SCHEDA.");
    } else {
      alert(err.message || "Errore durante il salvataggio del documento.");
    }
    return false;
  }
};
