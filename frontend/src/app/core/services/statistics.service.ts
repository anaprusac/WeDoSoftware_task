import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MonthlyStatistics } from '../models/statistics.model';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/statistics`;

  getMonthly(year: number, month: number): Observable<MonthlyStatistics> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<MonthlyStatistics>(this.baseUrl, { params });
  }
}
