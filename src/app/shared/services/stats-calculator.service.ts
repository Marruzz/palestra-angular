import { Injectable } from '@angular/core';
import { CalculatedStats } from './stats.service';

@Injectable({
  providedIn: 'root',
})
export class StatsCalculatorService {
  constructor() {}

  getUsersPercentage(stats: CalculatedStats | null): number {
    if (!stats?.totale_utenti) return 0;
    return Math.min((stats.totale_utenti / 2500) * 100, 100);
  }

  getActiveSubscriptionsPercentage(stats: CalculatedStats | null): number {
    if (!stats?.abbonamenti_attivi || !stats?.totale_utenti) return 0;
    return Math.min(
      (stats.abbonamenti_attivi / stats.totale_utenti) * 100,
      100
    );
  }

  getTodayAccessesPercentage(stats: CalculatedStats | null): number {
    if (!stats?.accessi_oggi || !stats?.totale_utenti) return 0;

    return Math.min((stats.accessi_oggi / stats.totale_utenti) * 100, 100);
  }

  getWeekAccessesPercentage(stats: CalculatedStats | null): number {
    if (!stats?.accessi_settimana || !stats?.totale_utenti) return 0;

    const weeklyMax = stats.totale_utenti * 7;
    return Math.min((stats.accessi_settimana / weeklyMax) * 100, 100);
  }

  getMonthAccessesPercentage(stats: CalculatedStats | null): number {
    if (!stats?.accessi_mese || !stats?.totale_utenti) return 0;

    const monthlyMax = stats.totale_utenti * 30;
    return Math.min((stats.accessi_mese / monthlyMax) * 100, 100);
  }

  getYearAccessesPercentage(stats: CalculatedStats | null): number {
    if (!stats?.accessi_anno || !stats?.totale_utenti) return 0;

    const yearlyMax = stats.totale_utenti * 365;
    return Math.min((stats.accessi_anno / yearlyMax) * 100, 100);
  }

  getAllTimeAccessesPercentage(): number {
    return 100;
  }

  getTodayUsersPercentage(stats: CalculatedStats | null): number {
    if (!stats?.utenti_entrati_oggi || !stats?.accessi_oggi) return 0;
    return Math.min(
      (stats.utenti_entrati_oggi / stats.accessi_oggi) * 100,
      100
    );
  }

  getActiveCoursesPercentage(stats: CalculatedStats | null): number {
    if (!stats?.corsi_attivi) return 0;
    return Math.min((stats.corsi_attivi / 20) * 100, 100);
  }

  getTotalSubscriptionsPercentage(stats: CalculatedStats | null): number {
    if (!stats?.totale_abbonamenti || !stats?.totale_utenti) return 0;
    return Math.min(
      (stats.totale_abbonamenti / stats.totale_utenti) * 100,
      100
    );
  }

  getAverageAgePercentage(stats: CalculatedStats | null): number {
    if (!stats?.eta_media_utenti) return 0;
    return Math.min((stats.eta_media_utenti / 80) * 100, 100);
  }

  getTopCoursePercentage(): number {
    return 95;
  }

  getBottomCoursePercentage(): number {
    return 25;
  }

  getPeakTimePercentage(stats: CalculatedStats | null): number {
    if (!stats?.tempo_medio_entrata) return 0;
    const timeString = stats.tempo_medio_entrata;
    const hour = parseInt(timeString.split(':')[0]);

    if (hour < 6) return 20;
    if (hour > 22) return 20;
    return Math.min(((hour - 6) / 16) * 100, 100);
  }

  getAverageCourseDurationPercentage(stats: CalculatedStats | null): number {
    if (!stats?.durata_media_corso) return 0;
    return Math.min((stats.durata_media_corso / 365) * 100, 100);
  }

  getProgressPercentage(value: number, total: number): number {
    return Math.min(((value || 0) / Math.max(total || 1, 1)) * 100, 100);
  }

  getUserProgressPercentage(
    value: number,
    stats: CalculatedStats | null
  ): number {
    return this.getProgressPercentage(value, stats?.totale_utenti || 1);
  }
}
