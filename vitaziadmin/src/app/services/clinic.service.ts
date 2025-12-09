import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  ClinicProfile,
  ClinicSummary,
  ClinicType,
  OwnerInformation
} from '../models/clinic.models';

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
        { withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }

  /** Tạo phòng khám CHUYÊN KHOA */
  createSpecializedClinic(): Observable<ClinicProfile> {
    return this.http
      .post<ApiResponse<ClinicProfile>>(
        `${this.baseUrl}/clinics/specialized`,
        {},
        { withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }

  /** Lấy tất cả phòng khám của user đang đăng nhập */
  getMyClinics(): Observable<ClinicSummary[]> {
    return this.http
      .get<ApiResponse<any[]>>(
        `${this.baseUrl}/clinics/getAllClinics`,
        { withCredentials: true }
      )
      .pipe(
        tap((res) =>
          console.log('[ClinicService] getMyClinics response =', res)
        ),
        map((res) =>
          (res.result || []).map((c) => ({
            id: c.id,
            clinicName: c.clinicName,
            clinicType: c.clinicType === 'SPECIALIZED' ? 'SPECIALTY' : 'GENERAL',

            oauthEmail: c.oauthEmail,
            oauthSub: c.oauthSub
          }) as ClinicSummary)
        )
      );
  }



  checkClinicExists(): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(
        `${this.baseUrl}/clinics/check`,
        { withCredentials: true }
      )
      .pipe(map(res => !!res.result));
  }

  getOwnerInformation(): Observable<OwnerInformation> {
      return this.http
        .get<ApiResponse<OwnerInformation>>(
          `${this.baseUrl}/ownerInformation`,
          { withCredentials: true }
        )
        .pipe(map((res) => res.result));
    }

}
