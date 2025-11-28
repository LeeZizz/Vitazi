import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClinicProfile } from '../models/clinic.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClinicProfilesService {
  private baseUrl = `${environment.apiUrl}/clinic-profiles`;

  constructor(private http: HttpClient) {}

  getById(id: string): Observable<ClinicProfile> {
    return this.http.get<ClinicProfile>(`${this.baseUrl}/${id}`);
  }
}
