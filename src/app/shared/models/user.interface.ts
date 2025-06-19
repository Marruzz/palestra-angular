export interface User {
  id: number;
  nome: string;
  cognome: string;
  data_nascita: string; 
  email?: string;
  codice_fiscale: string;
  created_at?: string;
}

export interface CreateUserRequest {
  nome: string;
  cognome: string;
  data_nascita: string;
  email?: string;
  codice_fiscale: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}
