import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonInput,
  IonTextarea, IonButton, IonIcon,
  ToastController, LoadingController
} from '@ionic/angular/standalone';

// Import Services & Models
import { BookingService } from '../../services/booking.service';
import {
  Clinic, Department, WorkSchedule, BookingRequest
} from '../../models/client-booking.models';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // Khai báo các component UI dùng trong HTML
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime,
    IonButton, IonIcon, IonInput, IonTextarea
  ]
})
export class BookingFormComponent implements OnInit {
  // --- Dữ liệu nguồn ---
  clinics: Clinic[] = [];
  departments: Department[] = [];
  schedules: WorkSchedule[] = [];

  // --- Dữ liệu ng-model (Selection) ---
  selectedClinicId: string = '';
  selectedDepartmentId: string = '';
  // Mặc định lấy ngày hôm nay YYYY-MM-DD
  selectedDate: string = new Date().toISOString();
  selectedSchedule: WorkSchedule | null = null;

  // --- Dữ liệu ng-model (Form nhập liệu) ---
  patientName: string = '';
  patientPhone: string = '';
  patientEmail: string = '';
  description: string = '';

  constructor(
    private bookingService: BookingService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadClinics();
  }

  // 1. Tải danh sách phòng khám khi vào trang
  loadClinics() {
    this.bookingService.getAllClinics().subscribe({
          next: (data: Clinic[]) => {
            this.clinics = data;
          },
          error: (err: any) => console.error('Lỗi tải phòng khám:', err)
        });
  }

  // 2. Khi người dùng đổi Phòng khám
  onClinicChange() {
    // Reset các lựa chọn cấp dưới
    this.departments = [];
    this.schedules = [];
    this.selectedDepartmentId = '';
    this.selectedSchedule = null;

    if (this.selectedClinicId) {
      this.bookingService.getDepartmentsByClinic(this.selectedClinicId).subscribe({
        next: (data) => {
          this.departments = data;
        },
        error: (err) => console.error('Lỗi tải khoa:', err)
      });
    }
  }

  // 3. Khi người dùng đổi Khoa hoặc Ngày -> Tải lịch làm việc
  onDepartmentOrDateChange() {
    this.schedules = [];
    this.selectedSchedule = null;

    if (this.selectedClinicId && this.selectedDepartmentId && this.selectedDate) {
      // Cắt chuỗi ISO để lấy YYYY-MM-DD (ion-datetime trả về full ISO string)
      const dateStr = this.selectedDate.split('T')[0];

      this.bookingService.getSchedules(this.selectedClinicId, this.selectedDepartmentId, dateStr)
        .subscribe({
          next: (data) => {
            this.schedules = data;
          },
          error: (err) => console.error('Lỗi tải lịch:', err)
        });
    }
  }

  // 4. Chọn một ca cụ thể (trên giao diện)
  selectSchedule(sch: WorkSchedule) {
    this.selectedSchedule = sch;
  }

  // 5. Gửi form
  async onSubmit() {
    // Validate cơ bản
    if (!this.selectedSchedule) {
      this.presentToast('Vui lòng chọn ca khám!', 'warning');
      return;
    }
    if (!this.patientName.trim() || !this.patientPhone.trim()) {
      this.presentToast('Vui lòng nhập họ tên và số điện thoại!', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Đang đặt lịch...' });
    await loading.present();

    // Chuẩn bị payload đúng format backend yêu cầu
    const payload: BookingRequest = {
      clinicId: this.selectedClinicId,
      departmentId: this.selectedDepartmentId,
      scheduleId: this.selectedSchedule.id,
      appointmentDate: this.selectedDate.split('T')[0], // YYYY-MM-DD
      userName: this.patientName,
      userPhone: this.patientPhone,
      userEmail: this.patientEmail,
      description: this.description
    };

    this.bookingService.createAppointment(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.presentToast('Đặt lịch thành công!', 'success');
        this.resetForm();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('Đặt lịch thất bại. Vui lòng thử lại.', 'danger');
      }
    });
  }

  resetForm() {
    // Giữ lại Clinic/Dept/Date để user đỡ phải chọn lại nếu muốn đặt tiếp
    this.selectedSchedule = null;
    this.patientName = '';
    this.patientPhone = '';
    this.patientEmail = '';
    this.description = '';
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  // Helper: Format giờ hiển thị (08:00:00 -> 08:00)
  formatTime(time: string): string {
    if (!time) return '';
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
}
