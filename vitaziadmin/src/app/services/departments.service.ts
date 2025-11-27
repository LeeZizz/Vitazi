import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/clinic.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private baseUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  getByClinic(clinicId: string): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}?clinicId=${clinicId}`);
  }

  getById(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`);
  }

  create(clinicId: string, dto: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, {
      clinic_id: clinicId,
      ...dto
    });
  }

  update(id: string, dto: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
