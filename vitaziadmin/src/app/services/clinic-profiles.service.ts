import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ClinicProfile } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicProfileService {
  private baseUrl = environment.apiUrl; // vd: http://localhost:8080

  constructor(private http: HttpClient) {}

  /**
   * Tạo phòng khám đa khoa: POST /clinics/general
   * Backend đang lấy info từ token nên body có thể để {}.
   */
  createGeneralClinic(): Observable<ClinicProfile> {
    return this.http
      .post<ApiResponse<ClinicProfile>>(`${this.baseUrl}/clinics/general`, {})
      .pipe(map(res => res.result));
  }

  // Sau này nếu có /clinics/specialized thì thêm hàm tương tự
}
