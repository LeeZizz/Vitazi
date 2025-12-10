import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Department } from '../models/clinic.models';

export interface SaveDepartmentPayload {
  clinicId: string;
  departmentName: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private baseUrl = environment.apiUrl; // 'http://localhost:8080'

  constructor(private http: HttpClient) {}

  /** Lấy danh sách khoa theo clinic */
  getByClinic(clinicId: string): Observable<Department[]> {
    return this.http
      .get<ApiResponse<Department[]>>(
        `${this.baseUrl}/departments/getListDepartments/${clinicId}`,
        { withCredentials: true }
      )
      .pipe(map(res => res.result));
  }

  /** Tạo khoa mới */
  create(payload: SaveDepartmentPayload): Observable<Department> {
    return this.http
      .post<ApiResponse<Department>>(
        `${this.baseUrl}/departments/createDepartment`,
        payload,                                          // { clinicId, departmentName, description }
        { withCredentials: true }
      )
      .pipe(map(res => res.result));
  }

  /** Cập nhật khoa */
  update(id: string, payload: SaveDepartmentPayload): Observable<Department> {
    return this.http
      .put<ApiResponse<Department>>(
        `${this.baseUrl}/departments/updateDepartment/${id}`,
        payload,
        { withCredentials: true }
      )
      .pipe(map(res => res.result));
  }

  /** Xoá khoa */
  delete(departmentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/departments/deleteDepartment/${departmentId}`,
      { withCredentials: true }
    );
  }
}
