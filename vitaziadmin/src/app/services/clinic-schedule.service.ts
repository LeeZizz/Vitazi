import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ClinicMode,
  DaySchedule,
  SaveDayScheduleRequest,
  WorkSchedule,
  Shift
} from '../models/clinic.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClinicScheduleService {
  private readonly MODE_KEY = 'clinic_mode';
 // private baseUrl = `${environment.apiUrl}/work-schedules`;

  // State loại phòng khám đang chọn
  currentMode: ClinicMode | null;

  constructor(private http: HttpClient) {
    this.currentMode = this.loadInitialMode();
  }

  // --------- State mode ---------

  setMode(mode: ClinicMode) {
    this.currentMode = mode;
    localStorage.setItem(this.MODE_KEY, mode);
  }

  private loadInitialMode(): ClinicMode | null {
    const raw = localStorage.getItem(this.MODE_KEY) as ClinicMode | null;
    if (raw === ClinicMode.SPECIALTY || raw === ClinicMode.GENERAL) {
      return raw;
    }
    return null;
  }

//   /**
//    * Lấy lịch 1 ngày cho 1 phòng khám (và optional 1 khoa)
//    */
//   getDaySchedule(
//     clinicId: string,
//     date: string,
//     departmentId?: string | null
//   ): Observable<DaySchedule> {
//     const params: any = { clinicId, date };
//     if (departmentId) {
//       params.departmentId = departmentId;
//     }
//
//     return this.http
//       .get<WorkSchedule[]>(this.baseUrl, { params })
//       .pipe(
//         map((rows) => {
//           const shifts: Shift[] = rows.map((row) => ({
//             id: row.id,
//             startTime: row.start_time.substring(0, 5), // HH:mm
//             endTime: row.end_time.substring(0, 5),
//             capacity: row.capacity ?? undefined,
//             maxCapacity: row.max_capacity ?? undefined
//           }));
//
//           const schedule: DaySchedule = {
//             clinic_id: clinicId,
//             department_id: departmentId ?? null,
//             date,
//             shifts
//           };
//
//           return schedule;
//         })
//       );
//   }
//
//   /**
//    * Lưu lịch 1 ngày (tạo/cập nhật nhiều dòng trong work_schedules)
//    */
//   saveDaySchedule(schedule: DaySchedule): Observable<void> {
//     const payload: SaveDayScheduleRequest = {
//       clinic_id: schedule.clinic_id,
//       department_id: schedule.department_id ?? null,
//       date: schedule.date,
//       shifts: schedule.shifts.map((s) => ({
//         start_time:
//           s.startTime.length === 5 ? s.startTime + ':00' : s.startTime,
//         end_time: s.endTime.length === 5 ? s.endTime + ':00' : s.endTime,
//         capacity: s.capacity,
//         max_capacity: s.maxCapacity
//       }))
//     };
//
//     return this.http.post<void>(`${this.baseUrl}/bulk`, payload);
//   }

}
