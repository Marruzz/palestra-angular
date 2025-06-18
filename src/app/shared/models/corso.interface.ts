export interface Corso {
  id: number;
  nome_corso: string;
  descrizione?: string;
  durata_mesi_default?: number;
}

export interface CreateCorsoRequest {
  nome_corso: string;
  descrizione?: string;
  durata_mesi_default?: number;
}
