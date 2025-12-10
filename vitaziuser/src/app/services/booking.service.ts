import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, WorkSchedule, Clinic, Department, BookingRequest } from '../models/client-booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Nếu localhost bị lỗi connection refused, hãy đổi thành 'http://127.0.0.1:8080'
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<ApiResponse<Clinic[]>>(`${this.apiUrl}/clinics/getAllClinics`)
      .pipe(map(res => res.result || []));
  }

  getDepartmentsByClinic(clinicId: string): Observable<Department[]> {
    return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/departments/getListDepartments/${clinicId}`)
      .pipe(map(res => res.result || []));
  }

  getSchedules(clinicId: string, departmentId: string, date: string): Observable<WorkSchedule[]> {
    const params = new HttpParams()
      .set('clinicId', clinicId)
      .set('departmentId', departmentId)
      .set('date', date); // Format: YYYY-MM-DD

    return this.http.get<ApiResponse<WorkSchedule[]>>(`${this.apiUrl}/schedules/listActiveSchedules`, { params })
      .pipe(map(res => res.result || []));
  }

  createAppointment(payload: BookingRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/appointments/createAppointment`, payload);
  }
}
