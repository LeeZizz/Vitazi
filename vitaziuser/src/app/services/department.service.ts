import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  startTime?: string;
  endTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor() {}

  getDepartments(): Observable<Department[]> {
    // DỮ LIỆU GIẢ
    const fakeDepartments: Department[] = [
      {
        id: 1,
        name: 'Khoa Tai Mũi Họng',
        description: 'Khám và điều trị các bệnh lý tai, mũi, họng.',
        imageUrl: 'https://via.placeholder.com/120x80?text=TMH',
        startTime: '08:00 AM',
        endTime: '16:30 PM'
      },
      {
        id: 2,
        name: 'Khoa Răng Hàm Mặt',
        description: 'Khám răng miệng, niềng răng, phẫu thuật hàm mặt.',
        imageUrl: 'https://via.placeholder.com/120x80?text=RHM',
        startTime: '08:00 AM',
        endTime: '17:00 PM'
      },
      {
        id: 3,
        name: 'Khoa Cơ Xương Khớp',
        description: 'Điều trị bệnh lý cơ, xương, khớp.',
        imageUrl: 'https://via.placeholder.com/120x80?text=CSK',
        startTime: '07:30 AM',
        endTime: '16:00 PM'
      }
    ];

    // trả về Observable như gọi API thật
    return of(fakeDepartments);
  }
}
