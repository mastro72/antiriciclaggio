import { get } from 'idb-keyval';
import html2pdf from 'html2pdf.js';

export const getClientDirHandle = async (numeroCliente?: string | number | null) => {
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

  if (numeroCliente === undefined || numeroCliente === null || numeroCliente === '') {
    return dirHandle;
  }

  const numStr = String(numeroCliente || 0).padStart(5, '0');
  const clientDirHandle = await dirHandle.getDirectoryHandle(numStr, { create: true });
  return clientDirHandle;
};

export const saveGeneratedDocument = async (
  numeroCliente: string | number | null | undefined, 
  documentName: string, 
  elementId: string
) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) throw new Error("Elemento documento non trovato");

    // Temporarily make the element visible if it's hidden
    const wasHidden = element.classList.contains('hidden');
    if (wasHidden) {
      element.classList.remove('hidden');
      element.classList.add('block');
    }

    // Generate PDF blob
    const fileName = (numeroCliente === undefined || numeroCliente === null || numeroCliente === '') 
      ? `${documentName}.pdf` 
      : `${String(numeroCliente || 0).padStart(5, '0')}_${documentName}.pdf`;
    const opt = {
      margin:       10,
      filename:     fileName,
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

    // Try to write to local file system
    try {
      const clientDir = await getClientDirHandle(numeroCliente);
      const fileHandle = await clientDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      return true; // Success local save
    } catch (fsErr: any) {
      console.warn("Impossibile salvare nella cartella locale, fallback al download standard:", fsErr);
      
      // Fallback: standard browser download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (fsErr.message.includes("Cartella di lavoro non selezionata")) {
        alert("Documento scaricato. (Nota: per salvare automaticamente nella cartella del cliente, seleziona la cartella di lavoro nel Fascicolo).");
      } else if (fsErr.name === 'SecurityError' || fsErr.message.includes('Cross origin sub frames')) {
        alert("Documento scaricato. (Nota: per salvare automaticamente nella cartella del cliente, apri l'app in una nuova scheda).");
      } else {
        alert("Documento scaricato. (Errore salvataggio locale: " + fsErr.message + ")");
      }
      return true; // Success download
    }
  } catch (err: any) {
    console.error("Error generating document", err);
    alert(err.message || "Errore durante la generazione del documento.");
    return false;
  }
};
