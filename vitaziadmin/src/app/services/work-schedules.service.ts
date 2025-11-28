import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaveSchedulesPayload, WorkSchedule } from '../models/clinic.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WorkSchedulesService {
  private baseUrl = `${environment.apiUrl}/work-schedules`;

  constructor(private http: HttpClient) {}

  // Lấy lịch 1 ngày
  getByDate(
    clinicId: string,
    date: string,
    departmentId?: string | null
  ): Observable<WorkSchedule[]> {
    const params = new URLSearchParams({
      clinicId,
      date
    });
    if (departmentId) {
      params.append('departmentId', departmentId);
    }
    return this.http.get<WorkSchedule[]>(`${this.baseUrl}?${params.toString()}`);
  }

  // Lưu nhiều ca trong 1 ngày
  saveForDate(payload: SaveSchedulesPayload): Observable<void> {
    // backend xử lý tạo nhiều dòng trong bảng work_schedules
    return this.http.post<void>(`${this.baseUrl}/bulk`, payload);
  }
}
