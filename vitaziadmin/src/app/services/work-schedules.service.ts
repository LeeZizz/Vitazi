// src/app/services/work-schedules.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import {
  SaveSchedulesPayload,
  WorkScheduleDto,
  WorkShiftInput
} from '../models/clinic.models';

interface WorkScheduleApiDto {
  id: string;
  clinicId: string;
  departmentId: string | null;
  capacity: number;
  maxCapacity: number;
  isActive: boolean;
  startTime: string;
  endTime: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

@Injectable({ providedIn: 'root' })
export class WorkSchedulesService {
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getByDate(
    clinicId: string,
    date: string,
    departmentId?: string
  ): Observable<WorkScheduleDto[]> {
    let params = new HttpParams().set('clinicId', clinicId);
    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }

    console.log('[WorkSchedulesService] listSchedules params =', params.toString());

    return this.http
      .get<ApiResponse<WorkScheduleApiDto[]>>(
        `${this.baseUrl}/schedules/listSchedules`,
        { params, withCredentials: true }
      )
      .pipe(
        tap((res) =>
          console.log('[WorkSchedulesService] listSchedules response =', res)
        ),
        map((res) => res.result || []),
        map((list) => list.filter((item) => item.date === date)),
        map((list) => list.map((item) => this.mapFromApi(item)))
      );
  }

  /** Tạo 1 hoặc nhiều ca (ở component hiện giờ luôn truyền 1 ca) */
  saveForDate(payload: SaveSchedulesPayload): Observable<WorkScheduleDto[]> {
    const { clinicId, departmentId, date, shifts } = payload;

    if (!shifts || !shifts.length) {
      console.log('[WorkSchedulesService] saveForDate: no shifts');
      return of([]);
    }

    const requests = shifts.map((shift, idx) => {
      const body = {
        clinicId,
        departmentId,
        capacity: shift.capacity ?? 0,
        maxCapacity: shift.maxCapacity ?? 0,
        startTime: this.toBackendTime(shift.startTime),
        endTime: this.toBackendTime(shift.endTime),
        date
      };

      console.log(`[WorkSchedulesService] createSchedule body[${idx}] =`, body);

      return this.http
        .post<ApiResponse<WorkScheduleApiDto>>(
          `${this.baseUrl}/schedules/createSchedule`,
          body,
          { withCredentials: true }
        )
        .pipe(
          tap((res) =>
            console.log(
              `[WorkSchedulesService] createSchedule response[${idx}] =`,
              res
            )
          ),
          map((res) => this.mapFromApi(res.result))
        );
    });

    return forkJoin(requests);
  }

  /** Cập nhật 1 ca */
  updateSchedule(
    scheduleId: string,
    clinicId: string,
    date: string,
    departmentId: string | null,
    shift: WorkShiftInput
  ): Observable<WorkScheduleDto> {
    const body = {
      clinicId,
      departmentId,
      capacity: shift.capacity ?? 0,
      maxCapacity: shift.maxCapacity ?? 0,
      startTime: this.toBackendTime(shift.startTime),
      endTime: this.toBackendTime(shift.endTime),
      date
    };

    console.log('[WorkSchedulesService] updateSchedule body =', body);

    return this.http
      .put<ApiResponse<WorkScheduleApiDto>>(
        `${this.baseUrl}/schedules/update/${scheduleId}`,
        body,
        { withCredentials: true }
      )
      .pipe(
        tap((res) =>
          console.log('[WorkSchedulesService] updateSchedule response =', res)
        ),
        map((res) => this.mapFromApi(res.result))
      );
  }

  /** Xóa 1 ca */
  deleteSchedule(scheduleId: string): Observable<void> {
    console.log('[WorkSchedulesService] deleteSchedule id =', scheduleId);

    return this.http
      .delete<ApiResponse<WorkScheduleApiDto>>(
        `${this.baseUrl}/schedules/delete/${scheduleId}`,
        { withCredentials: true }
      )
      .pipe(
        tap((res) =>
          console.log('[WorkSchedulesService] deleteSchedule response =', res)
        ),
        map(() => void 0)
      );
  }

  private toBackendTime(t: string): string {
    if (!t) return t;
    return t.length === 5 ? `${t}:00` : t;
  }

  private mapFromApi(api: WorkScheduleApiDto): WorkScheduleDto {
    return {
      id: api.id,
      clinic_id: api.clinicId,
      department_id: api.departmentId,
      capacity: api.capacity,
      max_capacity: api.maxCapacity,
      is_active: api.isActive,
      start_time: api.startTime,
      end_time: api.endTime,
      date: api.date,
      created_at: api.createdAt,
      updated_at: api.updatedAt
    };
  }
}
