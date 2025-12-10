import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  DashboardCounts,
  NotificationResponse,
  Page
} from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicDashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** * Lấy danh sách thông báo theo trạng thái & phân trang
   * Dùng cho CẢ 3 TAB
   */
  getNotifications(status?: string, page: number = 0, size: number = 10): Observable<Page<NotificationResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (status) params = params.set('status', status);

    return this.http
      .get<ApiResponse<Page<NotificationResponse>>>(
        `${this.baseUrl}/notifications/getAllNotifications`,
        { params, withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }

  /** Lấy số lượng thống kê */
  getNotificationCounts(): Observable<DashboardCounts> {
    return this.http
      .get<ApiResponse<DashboardCounts>>(
        `${this.baseUrl}/notifications/getCountsByStatus`,
        { withCredentials: true }
      )
      .pipe(map((res) => res.result));
  }

  /** Cập nhật trạng thái thông báo */
  updateNotificationStatus(id: string, status: string): Observable<any> {
    return this.http.put<ApiResponse<any>>(
      `${this.baseUrl}/notifications/updateStatus/${id}`,
      { status },
      { withCredentials: true }
    );
  }
}
