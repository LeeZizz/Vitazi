import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
  ToastController, LoadingController, IonModal, IonDatetime, IonDatetimeButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronBack, chevronForward, calendarOutline } from 'ionicons/icons';

import { BookingService } from '../../services/booking.service';
import { Department, WorkSchedule, BookingRequest } from '../../models/client-booking.models';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonModal, IonDatetime, IonDatetimeButton, IonIcon
  ]
})
export class BookingFormComponent implements OnInit {
  departments: Department[] = [];
  schedules: WorkSchedule[] = [];

  // Dữ liệu ngày
  allDaysOfMonth: any[] = []; // Tất cả ngày hợp lệ trong tháng
  visibleDays: any[] = [];    // 7 ngày đang hiển thị
  startIndex: number = 0;     // Vị trí bắt đầu phân trang
  pageSize: number = 7;       // Số ngày hiển thị mỗi trang

  // Date Picker configs
  minDate: string = '';
  maxDate: string = '';

  clinicIdFromUrl: string = '';
  selectedDepartmentId: string = '';
  selectedDate: string = '';
  selectedSchedule: WorkSchedule | null = null;

  currentIsoDate: string = new Date().toISOString(); // Ngày đang chọn trong DatePicker
  displayMonthYear: string = '';

  patientName: string = '';
  patientPhone: string = '';
  patientEmail: string = '';
  description: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ checkmarkCircle, chevronBack, chevronForward, calendarOutline });
  }

  ngOnInit() {
    this.setupDateConstraints(); // 1. Thiết lập giới hạn ngày tháng

    this.clinicIdFromUrl = this.route.snapshot.paramMap.get('clinicId') || '';
    if (this.clinicIdFromUrl) {
      this.loadDepartments();
    }

    // Tạo lịch cho tháng hiện tại
    this.generateDaysForMonth(new Date());
  }

  // Cấu hình DatePicker: Không cho chọn quá khứ, cho phép chọn 5 năm tới
  setupDateConstraints() {
    const today = new Date();
    this.minDate = today.toISOString(); // Chặn ngày quá khứ

    const future = new Date();
    future.setFullYear(today.getFullYear() + 5); // Thêm 5 năm
    this.maxDate = future.toISOString();
  }

  loadDepartments() {
    this.bookingService.getDepartmentsByClinic(this.clinicIdFromUrl).subscribe({
      next: (data) => {
        this.departments = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error(e)
    });
  }

  onDepartmentChange(event: any) {
    this.selectedDepartmentId = event.detail.value;
    this.loadSchedules();
  }

  onMonthChange(event: any) {
    const dateString = event.detail.value;
    const date = new Date(dateString);
    this.generateDaysForMonth(date);

    this.selectedDate = '';
    this.schedules = [];
  }

  generateDaysForMonth(dateObj: Date) {
    this.allDaysOfMonth = [];
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();

    this.displayMonthYear = dateObj.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysMap = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    // Lấy ngày hiện tại (xóa giờ phút giây để so sánh chính xác)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);

      // LOGIC: Nếu ngày tạo ra < ngày hôm nay -> BỎ QUA
      if (d < today) {
        continue;
      }

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const fullDate = `${yyyy}-${mm}-${dd}`;

      this.allDaysOfMonth.push({
        dayName: daysMap[d.getDay()],
        dayNumber: i,
        displayMonth: `Tháng ${month + 1}`,
        fullDate: fullDate
      });
    }

    // Reset phân trang về trang đầu tiên
    this.startIndex = 0;
    this.updateVisibleDays();

    // Tự động chọn ngày đầu tiên trong danh sách hợp lệ
    if (this.allDaysOfMonth.length > 0) {
       this.selectDate(this.allDaysOfMonth[0]);
    }
  }

  // Hàm cắt mảng để hiển thị 7 ngày
  updateVisibleDays() {
    this.visibleDays = this.allDaysOfMonth.slice(this.startIndex, this.startIndex + this.pageSize);
    this.cdr.detectChanges();
  }

  nextPage() {
    if (this.startIndex + this.pageSize < this.allDaysOfMonth.length) {
      this.startIndex += this.pageSize;
      this.updateVisibleDays();
    }
  }

  prevPage() {
    if (this.startIndex - this.pageSize >= 0) {
      this.startIndex -= this.pageSize;
      this.updateVisibleDays();
    }
  }

  selectDate(day: any) {
    this.selectedDate = day.fullDate;
    this.loadSchedules();
  }

  loadSchedules() {
    this.schedules = [];
    this.selectedSchedule = null;

    if (this.clinicIdFromUrl && this.selectedDepartmentId && this.selectedDate) {
      this.bookingService.getSchedules(this.clinicIdFromUrl, this.selectedDepartmentId, this.selectedDate)
        .subscribe({
          next: (data) => {
            this.schedules = data;
            this.cdr.detectChanges();
          },
          error: (err) => console.error(err)
        });
    }
  }

  selectTimeSlot(sch: WorkSchedule) {
    this.selectedSchedule = sch;
  }

  async onSubmit() {
    if (!this.selectedSchedule) {
      this.presentToast('Vui lòng chọn lịch khám!', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Đang xử lý...' });
    await loading.present();

    const payload: BookingRequest = {
      clinicId: this.clinicIdFromUrl,
      departmentId: this.selectedDepartmentId,
      scheduleId: this.selectedSchedule.id,
      appointmentDate: this.selectedDate,
      userName: this.patientName,
      userPhone: this.patientPhone,
      userEmail: this.patientEmail,
      description: this.description
    };

    this.bookingService.createAppointment(payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Đặt lịch thành công!', 'success-custom');
      },
      error: async (err) => {
        await loading.dismiss();
        this.presentToast('Lỗi đặt lịch, vui lòng thử lại', 'danger');
      }
    });
  }

  async presentToast(msg: string, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      cssClass: cssClass,
      icon: cssClass === 'success-custom' ? 'checkmark-circle' : undefined
    });
    toast.present();
  }

  formatTime(time: string) {
    return time ? time.substring(0, 5) : '';
  }
}
