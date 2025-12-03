// src/app/services/work-schedules.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  SaveSchedulesPayload,
  WorkScheduleDto
} from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class WorkSchedulesService {
  // Fake database trong FE
  private schedules: WorkScheduleDto[] = [
    // Ví dụ: phòng khám chuyên khoa CLINIC_SPEC_1
    {
      id: 'WS1',
      clinic_id: 'CLINIC_SPEC_1',
      department_id: null,
      date: '2025-12-01',
      start_time: '08:00:00',
      end_time: '11:00:00',
      capacity: 10,
      max_capacity: 20,
      is_active: true,
      created_at: '2025-12-01T00:00:00',
      updated_at: '2025-12-01T00:00:00'
    },
    {
      id: 'WS2',
      clinic_id: 'CLINIC_SPEC_1',
      department_id: null,
      date: '2025-12-01',
      start_time: '13:30:00',
      end_time: '16:30:00',
      capacity: 10,
      max_capacity: 20,
      is_active: true,
      created_at: '2025-12-01T00:00:00',
      updated_at: '2025-12-01T00:00:00'
    },

    // Ví dụ phòng khám đa khoa CLINIC_GEN_1, khoa id = DEPT_1
    {
      id: 'WS3',
      clinic_id: 'CLINIC_GEN_1',
      department_id: 'DEPT_1',
      date: '2025-12-01',
      start_time: '08:00:00',
      end_time: '12:00:00',
      capacity: 15,
      max_capacity: 30,
      is_active: true,
      created_at: '2025-12-01T00:00:00',
      updated_at: '2025-12-01T00:00:00'
    }
  ];

  private nextId = 100;

  constructor() {}

  /**
   * Lấy lịch theo ngày cho 1 phòng khám (và option 1 khoa)
   */
  getByDate(
    clinicId: string,
    date: string,
    departmentId?: string
  ): Observable<WorkScheduleDto[]> {
    const result = this.schedules.filter((s) => {
      if (s.clinic_id !== clinicId) return false;
      if (s.date !== date) return false;

      // nếu có departmentId thì lọc đúng khoa, ngược lại là chuyên khoa (department_id null)
      if (departmentId) {
        return s.department_id === departmentId;
      } else {
        return !s.department_id;
      }
    });

    // delay 300ms cho giống gọi API
    return of(result).pipe(delay(300));
  }

  /**
   * Lưu lịch 1 ngày (ghi đè toàn bộ ca của ngày đó)
   */
  saveForDate(payload: SaveSchedulesPayload): Observable<void> {
    const { clinicId, departmentId, date, shifts } = payload;

    // Xoá hết lịch cũ của ngày đó
    this.schedules = this.schedules.filter(
      (s) =>
        !(
          s.clinic_id === clinicId &&
          s.date === date &&
          (s.department_id || null) === (departmentId || null)
        )
    );

    // Thêm các ca mới
    shifts.forEach((shift) => {
      this.schedules.push({
        id: 'WS' + this.nextId++,
        clinic_id: clinicId,
        department_id: departmentId,
        date,
        start_time:
          shift.startTime.length === 5
            ? shift.startTime + ':00'
            : shift.startTime,
        end_time:
          shift.endTime.length === 5 ? shift.endTime + ':00' : shift.endTime,
        capacity: shift.capacity ?? 10,
        max_capacity: shift.maxCapacity ?? 20,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    return of(void 0).pipe(delay(300));
  }
}
