import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Thêm import này


import {
  SaveSchedulesPayload,
  WorkScheduleDto,
  WorkShiftInput,
  UpdateScheduleBody,
  ApiResponse
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

@Injectable({ providedIn: 'root' })
export class WorkSchedulesService {
  // private readonly baseUrl = 'http://localhost:8080';
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listAllSchedules(
      clinicId: string,
      departmentId: string,
      page: number = 0,
      size: number = 6 // Mặc định size = 6 như request
    ): Observable<ApiResponse<any>> {
      let params = new HttpParams()
        .set('clinicId', clinicId)
        .set('page', page.toString())
        .set('size', size.toString());

      // Backend yêu cầu departmentId (dựa trên URL bạn gửi), nên bắt buộc truyền
      if (departmentId) {
        params = params.set('departmentId', departmentId);
      }

      return this.http.get<ApiResponse<any>>(
        `${this.baseUrl}/schedules/listAllSchedules`,
        { params, withCredentials: true }
      );
    }

    /**
     * POST: Tạo mới danh sách ca (Lưu ca)
     */
    saveForDate(payload: SaveSchedulesPayload): Observable<any[]> {
      const { clinicId, departmentId, date, shifts } = payload;
      if (!shifts || !shifts.length) return of([]);

      const requests = shifts.map((shift) => {
        const body = {
          clinicId,
          departmentId,
          capacity: shift.capacity ?? 0,
          maxCapacity: shift.maxCapacity ?? 10,
          startTime: this.toBackendTime(shift.startTime),
          endTime: this.toBackendTime(shift.endTime),
          date
        };

        // Gọi API createSchedule
        return this.http
          .post<ApiResponse<any>>(`${this.baseUrl}/schedules/createSchedule`, body, { withCredentials: true })
          .pipe(map((res) => res.result));
      });

      return forkJoin(requests);
    }

  getAllSchedulesByDate(
      clinicId: string,
      departmentId: string,
      page: number = 0,
      size: number = 10
    ): Observable<ApiResponse<any>> {
      let params = new HttpParams()
        .set('clinicId', clinicId)
        .set('page', page.toString())
        .set('size', size.toString());

      if (departmentId) {
        params = params.set('departmentId', departmentId);
      }

      return this.http.get<ApiResponse<any>>(
        `${this.baseUrl}/schedules/listAllSchedules`,
        { params, withCredentials: true }
      );
    }

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

  /** Cập nhật 1 ca */
  updateSchedule(
      scheduleId: string,
      shift: WorkShiftInput, // Chứa capacity, maxCapacity, startTime, endTime
      date: string,
      isActive: boolean 
    ): Observable<WorkScheduleDto> {

      const body: UpdateScheduleBody = {
        capacity: shift.capacity ?? 0,
        maxCapacity: shift.maxCapacity ?? 10,
        startTime: this.toBackendTime(shift.startTime),
        endTime: this.toBackendTime(shift.endTime),
        isActive: isActive,
        date: date
      };

      return this.http
        .put<ApiResponse<any>>(
          `${this.baseUrl}/schedules/update/${scheduleId}`,
          body,
          { withCredentials: true }
        )
        .pipe(map((res) => this.mapFromApi(res.result)));
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
