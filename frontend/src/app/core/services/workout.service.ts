import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateWorkoutRequest, Workout } from '../models/workout.model';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/workouts`;

  create(request: CreateWorkoutRequest): Observable<Workout> {
    return this.http.post<Workout>(this.baseUrl, request);
  }

  getRecent(limit?: number): Observable<Workout[]> {
    const params = limit ? new HttpParams().set('limit', limit) : undefined;
    return this.http.get<Workout[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Workout> {
    return this.http.get<Workout>(`${this.baseUrl}/${id}`);
  }

  getByDate(date: string): Observable<Workout[]> {
    return this.http.get<Workout[]>(`${this.baseUrl}/by-date`, { params: new HttpParams().set('date', date) });
  }

  /** Distinct "yyyy-MM-dd" dates in the month that have workouts. */
  getCalendarDays(year: number, month: number): Observable<string[]> {
    const params = new HttpParams().set('year', year).set('month', month);
    return this.http.get<string[]>(`${this.baseUrl}/calendar`, { params });
  }
}
