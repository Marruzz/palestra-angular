export interface Access {
  id: number;
  id_utente: number;
  data_ora: string; // ISO datetime string
  // Populated fields from joins
  utente_nome?: string;
  utente_cognome?: string;
}

export interface CreateAccessRequest {
  id_utente: number;
  data_ora?: string;
}
