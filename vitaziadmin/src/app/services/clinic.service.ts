import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, ClinicProfile } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private baseUrl = environment.apiUrl; // vd: http://localhost:8080

  constructor(private http: HttpClient) {}

  /** Tạo phòng khám ĐA KHOA */
  createGeneralClinic(): Observable<ClinicProfile> {
    return this.http
      .post<ApiResponse<ClinicProfile>>(
        `${this.baseUrl}/clinics/general`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => res.result));
  }

  /** Tạo phòng khám CHUYÊN KHOA */
  createSpecializedClinic(): Observable<ClinicProfile> {
    return this.http
      .post<ApiResponse<ClinicProfile>>(
        `${this.baseUrl}/clinics/specialized`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => res.result));
  }
}
