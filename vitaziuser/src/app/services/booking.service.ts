import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ApiResponse,
  BookingRequest,
  Clinic,
  Department,
  WorkSchedule
} from '../models/client-booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080'; // Hoặc lấy từ environment.apiUrl

  constructor(private http: HttpClient) { }

  /** 1. Lấy danh sách tất cả phòng khám */
  getAllClinics(): Observable<Clinic[]> {
    return this.http
      .get<ApiResponse<Clinic[]>>(`${this.apiUrl}/clinics/getAllClinics`)
      .pipe(map(res => res.result || []));
  }

  /** 2. Lấy danh sách khoa theo ID phòng khám */
  getDepartmentsByClinic(clinicId: string): Observable<Department[]> {
    return this.http
      .get<ApiResponse<Department[]>>(`${this.apiUrl}/departments/getListDepartments/${clinicId}`)
      .pipe(map(res => res.result || []));
  }

  /** * 3. Lấy danh sách ca làm việc (Lọc theo Clinic + Dept + Date)
   * Backend cần có API lọc, ví dụ: /schedules/getListWorkSchedule?clinicId=...
   */
  getSchedules(clinicId: string, departmentId: string, date: string): Observable<WorkSchedule[]> {
    let params = new HttpParams()
      .set('clinicId', clinicId)
      .set('departmentId', departmentId)
      .set('date', date); // YYYY-MM-DD

    return this.http
      .get<ApiResponse<WorkSchedule[]>>(`${this.apiUrl}/schedules/listSchedules`, { params })
      .pipe(map(res => res.result || []));
  }

  /** 4. Gửi yêu cầu đặt lịch (POST) */
  createAppointment(payload: BookingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/appointments/createAppointment`,
      payload
    );
  }
}
