import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimeSlot {
  id: number;
  start: string;
  end: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;     // "2025-11-17"
  weekday: string;  // "Thứ 2"
  slots: TimeSlot[];
}

export interface CreateBookingRequest {
  slotId: number;
  fullName: string;
  phone: string;
  email?: string;
  reason?: string;
  receiveNotify: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private baseUrl = 'https://api.your-domain.com'; // sửa thành URL backend thật

  constructor(private http: HttpClient) {}

  getSchedules(
    clinicId: number,
    from: string,
    to: string
  ): Observable<DaySchedule[]> {
    return this.http.get<DaySchedule[]>(
      `${this.baseUrl}/api/schedules`,
      { params: { clinicId, from, to } }
    );
  }

  createBooking(payload: CreateBookingRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/bookings`, payload);
  }
}
