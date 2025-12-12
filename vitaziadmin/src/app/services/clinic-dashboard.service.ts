import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  DashboardCounts,
  AppointmentResponse
} from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicDashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 1. Get All Appointments (Trả về mảng)
  getAllAppointments(status?: string, page: number = 0, size: number = 10): Observable<AppointmentResponse[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<AppointmentResponse[]>>(
        `${this.baseUrl}/appointments/getAllAppointments`,
        { params, withCredentials: true }
      )
      .pipe(map((res) => res.result || []));
  }


  updateAppointmentStatus(id: string, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/appointments/updateStatus/${id}`,
      { status: status },
      { withCredentials: true }
    );
  }

  // 3. Update Schedule (Dời lịch) - Theo hình ảnh Postman
  updateAppointmentInfo(appointmentId: string, date: string, scheduleId: string): Observable<any> {
    const body = {
      appointmentDate: date, // "2025-12-14"
      scheduleId: scheduleId // ID ca làm việc mới
    };

    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/appointments/updateSchedule/${appointmentId}`,
      body,
      { withCredentials: true }
    );
  }

  getDashboardCounts(): Observable<DashboardCounts> {
    return this.http
      .get<ApiResponse<DashboardCounts>>(
        `${this.baseUrl}/notifications/getCountsByStatus`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }
}
