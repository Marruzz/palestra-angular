export interface User {
  id: number;
  nome: string;
  cognome: string;
  data_nascita: string; 
  email?: string;
  codice_fiscale: string;
  created_at?: string;
  certificato_medico?: string; // Nome del file del certificato medico
  certificato_scadenza?: string; // Data di scadenza del certificato
}

export interface CreateUserRequest {
  nome: string;
  cognome: string;
  data_nascita: string;
  email?: string;
  codice_fiscale: string;
  certificato_medico?: string;
  certificato_scadenza?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}
