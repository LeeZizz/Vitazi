import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Department } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private baseUrl = environment.apiUrl; // http://localhost:8080

  constructor(private http: HttpClient) {}

  /** Lấy danh sách khoa theo clinic */
  getByClinic(clinicId: string): Observable<Department[]> {
    return this.http
      .get<ApiResponse<Department[]>>(
        `${this.baseUrl}/departments/getListDepartments/${clinicId}`
      )
      .pipe(map((res) => res.result));
  }

  /** Xoá khoa – tùy endpoint backend */
  delete(departmentId: string): Observable<void> {
    // Nếu backend anh đặt kiểu /departments/deleteDepartment/{id} thì sửa lại cho đúng.
    return this.http.delete<void>(
      `${this.baseUrl}/departments/deleteDepartment/${departmentId}`
    );
  }
}
