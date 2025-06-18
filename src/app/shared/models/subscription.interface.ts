export interface Subscription {
  id: number;
  id_utente: number;
  id_corso: number;
  data_inizio: string; // ISO date string
  durata_mesi: number;
  data_fine?: string; // ISO date string (generated column)
  // Populated fields from joins
  utente_nome?: string;
  utente_cognome?: string;
  corso_nome?: string;
}

export interface CreateSubscriptionRequest {
  id_utente: number;
  id_corso: number;
  data_inizio: string;
  durata_mesi: number;
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  id: number;
}
