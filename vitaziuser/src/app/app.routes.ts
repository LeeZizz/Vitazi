import { Routes } from '@angular/router';
import { DepartmentListComponent } from './component/department-list/department-list.component';
import { BookingFormComponent } from './component/booking-form/booking-form';

export const routes: Routes = [
  // Trang chủ: hiện list các khoa bệnh
  { path: '', component: DepartmentListComponent },

  // Đặt lịch theo khoa: /booking/:clinicId
  { path: 'booking/:clinicId', component: BookingFormComponent },

  // Nếu muốn, có thể thêm wildcard
  // { path: '**', redirectTo: '', pathMatch: 'full' },
];
