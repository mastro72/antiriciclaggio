import { useState, useEffect } from 'react';

export interface Studio {
  denominazione?: string;
  citta?: string;
  indirizzo?: string;
  piva?: string;
  cf?: string;
  tel?: string;
  email?: string;
  pec?: string;
  web?: string;
  lrNome?: string;
  lrLuogo?: string;
  lrData?: string;
  lrCf?: string;
  assoc?: string;
  niscrizione?: string;
}

export interface Cliente {
  id: string;
  numeroCliente?: string;
  tipo: 'pf' | 'pg';
  nome: string;
  cf: string;
  piva?: string;
  prestazione: string;
  riskLevel: number;
  dataRegistrazione: string;
  dataInizio?: string;
  note?: string;
}

export interface AppState {
  studio: Studio;
  clienti: Cliente[];
  autovaluta: any;
}

const defaultState: AppState = {
  studio: {},
  clienti: [],
  autovaluta: {}
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('antiric_app');
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem('antiric_app', JSON.stringify(state));
  }, [state]);

  const updateStudio = (studio: Studio) => setState(s => ({ ...s, studio }));
  const addCliente = (cliente: Cliente) => setState(s => ({ ...s, clienti: [...s.clienti, cliente] }));

  return { state, updateStudio, addCliente };
}
