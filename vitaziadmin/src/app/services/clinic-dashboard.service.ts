import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  AppointmentResponse,
  DashboardCounts,
  NotificationResponse
} from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicDashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ================= NOTIFICATIONS (TAB CHỜ XỬ LÝ) =================

  /** Gọi: /notifications/getAllNotifications?status=... */
  getNotifications(status?: string): Observable<NotificationResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<NotificationResponse[]>>(
        `${this.baseUrl}/notifications/getAllNotifications`,
        { params, withCredentials: true }
      )
      .pipe(map((res) => res.result || []));
  }

  /** Gọi: /notifications/getCountsByStatus */
  getNotificationCounts(): Observable<DashboardCounts> {
    return this.http
      .get<ApiResponse<DashboardCounts>>(
        `${this.baseUrl}/notifications/getCountsByStatus`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }

  /** Gọi: /notifications/updateStatus/{id} */
  updateNotificationStatus(id: string, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/notifications/updateStatus/${id}`,
      { status }, // Body: UpdateStatusRequest
      { withCredentials: true }
    );
  }

  // ================= APPOINTMENTS (TAB ĐÃ XÁC NHẬN / ĐÃ HỦY) =================

  /** Gọi: /appointments/getAllAppointments?status=... */
  getAllAppointments(status?: string): Observable<AppointmentResponse[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<AppointmentResponse[]>>(
        `${this.baseUrl}/appointments/getAllAppointments`,
        { params, withCredentials: true }
      )
      .pipe(map((res) => res.result || []));
  }

  /** Gọi: /appointments/updateStatus/{id} */
  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/appointments/updateStatus/${id}`,
      { status }, // Body: UpdateStatusRequest
      { withCredentials: true }
    );
  }
}
