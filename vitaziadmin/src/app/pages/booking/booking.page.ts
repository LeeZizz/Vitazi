import { Component, OnInit } from '@angular/core';
import { IonContent, IonToast, IonIcon, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

import { ClinicType } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicWorkScheduleComponent } from '../../components/clinic-work-schedule/clinic-work-schedule.component';
import { ClinicScheduleListComponent } from '../../components/clinic-schedule-list/clinic-schedule-list.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [IonContent, IonToast, CommonModule, ClinicWorkScheduleComponent, ClinicScheduleListComponent, IonIcon],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss']
})
export class BookingPage implements OnInit {
  clinicId: string | null = null;
  mode: ClinicType = 'SPECIALTY';
  viewMode: 'LIST' | 'EDIT' = 'LIST'; // State quản lý hiển thị

  constructor(private clinicSchedule: ClinicScheduleService) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.clinicId = this.clinicSchedule.currentClinicId;
    this.mode = this.clinicSchedule.currentMode ?? 'SPECIALTY';
  }

  // Chuyển sang chế độ chỉnh sửa
  switchToEdit() {
    this.viewMode = 'EDIT';
  }

  // Quay lại danh sách
  switchToList() {
    this.viewMode = 'LIST';
  }

  // Khi component con lưu thành công
  onSaved() {
    this.viewMode = 'LIST';
    // Có thể thêm logic reload data list tại đây nếu cần (thường component List dùng onChanges hoặc init lại)
  }
}
