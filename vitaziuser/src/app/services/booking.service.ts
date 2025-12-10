import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BookingRequest, Clinic, Department, WorkSchedule } from '../models/booking.models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // 1. Lấy danh sách phòng khám
  getAllClinics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clinics/getAllClinic`);
  }

  // 2. Lấy danh sách khoa theo phòng khám
  getDepartmentsByClinic(clinicId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/departments/getListDepartments/${clinicId}`);
  }

  // 3. Lấy lịch làm việc theo Khoa và Ngày
  getSchedules(clinicId: string, departmentId: string, date: string): Observable<any> {
    // API giả định: /work-schedules/filter?clinicId=...&departmentId=...&date=...
    let params = new HttpParams()
      .set('clinicId', clinicId)
      .set('departmentId', departmentId)
      .set('date', date);

    return this.http.get(`${this.apiUrl}/work-schedules/filter`, { params });
  }

  // 4. Tạo lịch khám (POST)
  createAppointment(payload: BookingRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/createAppointment`, payload);
  }
}
