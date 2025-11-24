import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface TimeSlot {
  id: number;
  start: string;
  end: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;     // "2025-11-21"
  weekday: string;  // "Thứ 2" ...
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

  constructor() {}

  getSchedules(
    clinicId: number,
    from: string,
    to: string
  ): Observable<DaySchedule[]> {

    // DỮ LIỆU GIẢ: mỗi khoa có lịch khác nhau 1 chút
    const baseSlotsMorning: TimeSlot[] = [
      { id: 1, start: '08:00', end: '09:00', available: true },
      { id: 2, start: '09:00', end: '10:00', available: true },
      { id: 3, start: '10:00', end: '11:00', available: false },
    ];

    const baseSlotsAfternoon: TimeSlot[] = [
      { id: 4, start: '13:00', end: '14:00', available: true },
      { id: 5, start: '14:00', end: '15:00', available: true },
      { id: 6, start: '15:00', end: '16:00', available: false },
    ];

    // tạo 3 ngày fake (bỏ qua from/to cho đơn giản)
    const fakeSchedulesClinic1: DaySchedule[] = [
      {
        date: '2025-11-21',
        weekday: 'Thứ 6',
        slots: baseSlotsMorning
      },
      {
        date: '2025-11-22',
        weekday: 'Thứ 7',
        slots: baseSlotsAfternoon
      },
      {
        date: '2025-11-23',
        weekday: 'Chủ nhật',
        slots: [...baseSlotsMorning, ...baseSlotsAfternoon]
      }
    ];

    const fakeSchedulesClinic2: DaySchedule[] = [
      {
        date: '2025-11-21',
        weekday: 'Thứ 6',
        slots: baseSlotsAfternoon
      },
      {
        date: '2025-11-22',
        weekday: 'Thứ 7',
        slots: [...baseSlotsMorning]
      }
    ];

    const fakeSchedulesClinic3: DaySchedule[] = [
      {
        date: '2025-11-21',
        weekday: 'Thứ 6',
        slots: [...baseSlotsMorning, { id: 7, start: '11:00', end: '12:00', available: true }]
      }
    ];

    let result: DaySchedule[];

    switch (clinicId) {
      case 1:
        result = fakeSchedulesClinic1;
        break;
      case 2:
        result = fakeSchedulesClinic2;
        break;
      case 3:
        result = fakeSchedulesClinic3;
        break;
      default:
        result = fakeSchedulesClinic1;
    }

    return of(result);
  }

  createBooking(payload: CreateBookingRequest): Observable<any> {
    console.log('FAKE BOOKING SENT:', payload);
    // giả lập API trả về success
    return of({
      success: true,
      bookingId: 123,
      message: 'Đặt lịch thành công (fake)'
    });
  }
}
