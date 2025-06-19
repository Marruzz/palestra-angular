import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


export interface RawUser {
  id: number;
  nome: string;
  cognome: string;
  email?: string;
  data_nascita: string;
  codice_fiscale: string;
}

export interface RawAccesso {
  id: number;
  id_utente: number;
  data_accesso: string;
  orario_entrata: string;
  orario_uscita?: string;
  nome_utente?: string;
  cognome_utente?: string;
}

export interface RawAbbonamento {
  id: number;
  id_utente: number;
  id_corso: number;
  data_inizio: string;
  durata_mesi: number;
  attivo: boolean;
  nome_corso?: string;
}

export interface RawCorso {
  id: number;
  nome_corso: string;
  descrizione?: string;
  durata_mesi_default?: number;
}


export interface CalculatedStats {
  totale_utenti: number;
  utenti_entrati_oggi: number;
  abbonamenti_attivi: number;
  accessi_oggi: number;
  accessi_settimana: number;
  accessi_mese: number;
  accessi_anno: number;
  accessi_sempre: number;
  corsi_attivi: number;
  corso_top: string;
  corso_bottom: string;
  durata_corso_top: number;
  durata_corso_bottom: number;
  totale_abbonamenti: number;
  eta_media_utenti: number;
  tempo_medio_entrata: string;
  durata_media_corso: number;
  ultimi_accessi: {
    nome: string;
    cognome: string;
    ultimo_accesso: string;
    totale_accessi_oggi: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}
  private getRawData(): Observable<{
    users: RawUser[];
    accessi: RawAccesso[];
    abbonamenti: RawAbbonamento[];
    corsi: RawCorso[];
  }> {
    return forkJoin({
      users: this.http
        .get<RawUser[]>(`${this.apiUrl}/dashboard/Utenti`)
        .pipe(catchError(() => of([]))),
      accessi: this.http
        .get<RawAccesso[]>(`${this.apiUrl}/dashboard/Ingressi`)
        .pipe(catchError(() => of([]))),
      abbonamenti: this.http
        .get<RawAbbonamento[]>(`${this.apiUrl}/dashboard/Abbonamenti`)
        .pipe(catchError(() => of([]))),
      corsi: this.http
        .get<{ success: boolean; data: RawCorso[] } | RawCorso[]>(
          `${this.apiUrl}/dashboard/Corsi`
        )
        .pipe(
          map((response) => {

            if (
              response &&
              typeof response === 'object' &&
              'data' in response &&
              Array.isArray(response.data)
            ) {
              return response.data;
            }

            if (Array.isArray(response)) {
              return response;
            }

            return [];
          }),
          catchError(() => of([]))
        ),
    });
  }
  calculateStats(): Observable<CalculatedStats> {
    return this.getRawData().pipe(
      map(({ users, accessi, abbonamenti, corsi }) => {

        const validUsers = Array.isArray(users) ? users : [];
        const validAccessi = Array.isArray(accessi) ? accessi : [];
        const validAbbonamenti = Array.isArray(abbonamenti) ? abbonamenti : [];
        const validCorsi = Array.isArray(corsi) ? corsi : [];

        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        const oneYearAgo = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        const totale_utenti = validUsers.length;

        const todayString = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const accessiOggi = validAccessi.filter((a) => {
          return a.data_accesso === todayString;
        });

        const utentiUniciOggi = new Set(accessiOggi.map((a) => a.id_utente));
        const utenti_entrati_oggi = utentiUniciOggi.size;
        const abbonamenti_attivi = validAbbonamenti.filter((a) =>
          Boolean(a.attivo)
        ).length;


        const accessi_oggi = accessiOggi.length;
        const oneWeekAgoString = `${oneWeekAgo.getFullYear()}-${String(
          oneWeekAgo.getMonth() + 1
        ).padStart(2, '0')}-${String(oneWeekAgo.getDate()).padStart(2, '0')}`;

        const accessi_settimana = validAccessi.filter((a) => {
          return a.data_accesso >= oneWeekAgoString;
        }).length;


        const oneMonthAgoString = `${oneMonthAgo.getFullYear()}-${String(
          oneMonthAgo.getMonth() + 1
        ).padStart(2, '0')}-${String(oneMonthAgo.getDate()).padStart(2, '0')}`;
        const accessi_mese = validAccessi.filter((a) => {
          return a.data_accesso >= oneMonthAgoString;
        }).length;


        const oneYearAgoString = `${oneYearAgo.getFullYear()}-${String(
          oneYearAgo.getMonth() + 1
        ).padStart(2, '0')}-${String(oneYearAgo.getDate()).padStart(2, '0')}`;
        const accessi_anno = validAccessi.filter((a) => {
          return a.data_accesso >= oneYearAgoString;
        }).length;
        const accessi_sempre = validAccessi.length;


        const corsi_attivi = validCorsi.length;


        const totale_abbonamenti = validAbbonamenti.length;
        const eta_media_utenti = this.calculateAverageAge(validUsers);
        const corsoStats = this.calculateCourseStats(
          validAbbonamenti,
          validCorsi
        );
        const corso_top = corsoStats.mostPopular;
        const corso_bottom = corsoStats.leastPopular;
        const durata_corso_top = corsoStats.mostPopularDuration;
        const durata_corso_bottom = corsoStats.leastPopularDuration;


        const tempo_medio_entrata =
          this.calculateAverageEntryTime(validAccessi);


        const durata_media_corso =
          this.calculateAverageCourseLength(validAbbonamenti);


        const ultimi_accessi = this.getRecentAccesses(validAccessi, validUsers);

        const calculatedStats = {
          totale_utenti,
          utenti_entrati_oggi,
          abbonamenti_attivi,
          accessi_oggi,
          accessi_settimana,
          accessi_mese,
          accessi_anno,
          accessi_sempre,
          corsi_attivi,
          totale_abbonamenti,
          eta_media_utenti,
          corso_top,
          durata_corso_top,
          corso_bottom,
          durata_corso_bottom,
          tempo_medio_entrata,
          durata_media_corso,
          ultimi_accessi,
        };

        return calculatedStats;
      }),
      catchError((error) => {
        return of(this.getDefaultStats());
      })
    );
  }

  private calculateAverageAge(users: RawUser[]): number {
    if (users.length === 0) return 0;

    const now = new Date();
    const totalAge = users.reduce((sum, user) => {
      const birthDate = new Date(user.data_nascita);
      const age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();


      const adjustedAge =
        monthDiff < 0 ||
        (monthDiff === 0 && now.getDate() < birthDate.getDate())
          ? age - 1
          : age;

      return sum + Math.max(0, adjustedAge);
    }, 0);

    return Math.round(totalAge / users.length);
  }
  private calculateCourseStats(
    abbonamenti: RawAbbonamento[],
    corsi: RawCorso[]
  ): {
    mostPopular: string;
    leastPopular: string;
    mostPopularDuration: number;
    leastPopularDuration: number;
  } {

    if (!Array.isArray(corsi) || corsi.length === 0) {
      return {
        mostPopular: 'N/A',
        leastPopular: 'N/A',
        mostPopularDuration: 0,
        leastPopularDuration: 0,
      };
    }


    const courseSubscriptionCount = new Map<number, number>();


    corsi.forEach((corso) => courseSubscriptionCount.set(corso.id, 0));


    const abbonamentiAttivi = abbonamenti.filter((a) => Boolean(a.attivo));

    abbonamentiAttivi.forEach((abbonamento) => {
      const currentCount =
        courseSubscriptionCount.get(abbonamento.id_corso) || 0;
      courseSubscriptionCount.set(abbonamento.id_corso, currentCount + 1);
    });


    let maxCount = -1;
    let minCount = Infinity;
    let mostPopularId = -1;
    let leastPopularId = -1;

    courseSubscriptionCount.forEach((count, courseId) => {
      if (count > maxCount) {
        maxCount = count;
        mostPopularId = courseId;
      }
      if (count < minCount) {
        minCount = count;
        leastPopularId = courseId;
      }
    });

    const mostPopularCourse = corsi.find((c) => c.id === mostPopularId);
    const leastPopularCourse = corsi.find((c) => c.id === leastPopularId);

    const mostPopularCourseName =
      mostPopularCourse?.nome_corso || 'Corso non trovato';
    const leastPopularCourseName =
      leastPopularCourse?.nome_corso || 'Corso non trovato';


    const mostPopularDuration = mostPopularCourse?.durata_mesi_default || 0;
    const leastPopularDuration = leastPopularCourse?.durata_mesi_default || 0;

    return {
      mostPopular: mostPopularCourseName,
      leastPopular: leastPopularCourseName,
      mostPopularDuration: mostPopularDuration,
      leastPopularDuration: leastPopularDuration,
    };
  }

  private calculateAverageEntryTime(accessi: RawAccesso[]): string {
    if (accessi.length === 0) return 'N/A';

    const accessiConOrario = accessi.filter((a) => a.orario_entrata);
    if (accessiConOrario.length === 0) return 'N/A';

    const totalMinutes = accessiConOrario.reduce((sum, accesso) => {
      const [hours, minutes] = accesso.orario_entrata.split(':').map(Number);
      return sum + (hours * 60 + minutes);
    }, 0);

    const averageMinutes = Math.round(totalMinutes / accessiConOrario.length);
    const hours = Math.floor(averageMinutes / 60);
    const mins = averageMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Calcola la durata media dei corsi
   */
  private calculateAverageCourseLength(abbonamenti: RawAbbonamento[]): number {
    if (abbonamenti.length === 0) return 0;

    const totalDuration = abbonamenti.reduce((sum, abbonamento) => {
      return sum + (abbonamento.durata_mesi || 0);
    }, 0);


    return Math.round((totalDuration / abbonamenti.length) * 30);
  }

  /**
   * Ottiene gli ultimi accessi
   */
  private getRecentAccesses(
    accessi: RawAccesso[],
    users: RawUser[]
  ): {
    nome: string;
    cognome: string;
    ultimo_accesso: string;
    totale_accessi_oggi: number;
  }[] {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;


    const userAccesses = new Map<number, RawAccesso[]>();
    accessi.forEach((accesso) => {
      const userId = accesso.id_utente;
      if (!userAccesses.has(userId)) {
        userAccesses.set(userId, []);
      }
      userAccesses.get(userId)!.push(accesso);
    });

    const recentAccesses = Array.from(userAccesses.entries())
      .map(([userId, userAccessList]) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return null;


        const sortedAccesses = userAccessList.sort(
          (a, b) =>
            new Date(
              b.data_accesso + ' ' + (b.orario_entrata || '00:00')
            ).getTime() -
            new Date(
              a.data_accesso + ' ' + (a.orario_entrata || '00:00')
            ).getTime()
        );

        const ultimoAccesso = sortedAccesses[0];


        const accessiOggi = userAccessList.filter(
          (a) => a.data_accesso === todayStr
        ).length;

        return {
          nome: user.nome,
          cognome: user.cognome,
          ultimo_accesso:
            ultimoAccesso.data_accesso +
            ' ' +
            (ultimoAccesso.orario_entrata || ''),
          totale_accessi_oggi: accessiOggi,
        };
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b!.ultimo_accesso).getTime() -
          new Date(a!.ultimo_accesso).getTime()
      )
      .slice(0, 5) as {
      nome: string;
      cognome: string;
      ultimo_accesso: string;
      totale_accessi_oggi: number;
    }[];

    return recentAccesses;
  }

  private getDefaultStats(): CalculatedStats {
    return {
      totale_utenti: 0,
      utenti_entrati_oggi: 0,
      abbonamenti_attivi: 0,
      accessi_oggi: 0,
      accessi_settimana: 0,
      accessi_mese: 0,
      accessi_anno: 0,
      accessi_sempre: 0,
      corsi_attivi: 0,
      totale_abbonamenti: 0,
      eta_media_utenti: 0,
      corso_top: 'N/A',
      durata_corso_top: 0,
      corso_bottom: 'N/A',
      durata_corso_bottom: 0,
      tempo_medio_entrata: 'N/A',
      durata_media_corso: 0,
      ultimi_accessi: [],
    };
  }
}
