import { Routes } from '@angular/router';
import { BookingFormComponent } from './component/booking-form/booking-form';

export const routes: Routes = [
  {
    path: '',
    component: BookingFormComponent,
    title: 'Đặt lịch khám bệnh' // Tiêu đề tab trình duyệt (Angular 14+)
  },

//   2. (Tùy chọn) Support trường hợp truy cập qua link có sẵn ID phòng khám
//    Ví dụ: người dùng click vào link được chia sẻ: domain.com/booking/clinic_123
//   {
//     path: 'booking/:clinicId',
//     component: BookingFormComponent
//   },

  // Redirect các đường dẫn không tồn tại về trang chủ
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
