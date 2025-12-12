import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronBack, chevronForward, chevronDown, calendarOutline, medkitOutline, personOutline, timeOutline, mailOutline, callOutline, documentTextOutline, arrowForwardOutline, alertCircleOutline } from 'ionicons/icons';

import { BookingService } from '../../services/booking.service';
import { Department, WorkSchedule, BookingRequest } from '../../models/client-booking.models';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent,
    IonIcon
  ]
})
export class BookingFormComponent implements OnInit {
  departments: Department[] = [];
  schedules: WorkSchedule[] = [];

  socialAvatars: Array<{ src: string; alt: string }> = [];
  
  // Dropdown State
  isDepartmentOpen: boolean = false;
  selectedDepartment: Department | null = null;

  // Custom Month Picker State
  isMonthPickerOpen: boolean = false;
  pickerYear: number = new Date().getFullYear();
  pickerMonth: number = new Date().getMonth();
  monthsList = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

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
  isSubmitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ checkmarkCircle, chevronBack, chevronForward, chevronDown, calendarOutline, medkitOutline, personOutline, timeOutline, mailOutline, callOutline, documentTextOutline, arrowForwardOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.socialAvatars = this.createRandomSocialAvatars(4);
    this.setupDateConstraints(); // 1. Thiết lập giới hạn ngày tháng

    this.clinicIdFromUrl = this.route.snapshot.paramMap.get('clinicId') || '';
    if (this.clinicIdFromUrl) {
      this.loadDepartments();
    }

    // Tạo lịch cho tháng hiện tại
    this.generateDaysForMonth(new Date());
  }

  private createRandomSocialAvatars(count: number): Array<{ src: string; alt: string }> {
    // Danh sách ảnh đại diện người thật (sử dụng randomuser.me hoặc nguồn ảnh miễn phí)
    const realAvatars = [
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/46.jpg',
      'https://randomuser.me/api/portraits/women/17.jpg',
      'https://randomuser.me/api/portraits/men/85.jpg'
    ];

    const result: Array<{ src: string; alt: string }> = [];
    for (let i = 0; i < count; i++) {
      // Lấy ảnh tuần tự hoặc ngẫu nhiên từ danh sách
      const src = realAvatars[i % realAvatars.length];
      result.push({
        src: src,
        alt: `Khách hàng ${i + 1}`
      });
    }
    return result;
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

  toggleDepartmentDropdown() {
    this.isDepartmentOpen = !this.isDepartmentOpen;
  }

  selectDepartment(dept: Department) {
    this.selectedDepartment = dept;
    this.selectedDepartmentId = dept.id;
    this.isDepartmentOpen = false;
    this.loadSchedules();
  }

  // --- Custom Month Picker Methods ---
  toggleMonthPicker() {
    this.isMonthPickerOpen = !this.isMonthPickerOpen;
    if (this.isMonthPickerOpen) {
      // Sync picker with current view
      const currentDate = new Date(this.currentIsoDate);
      this.pickerYear = currentDate.getFullYear();
      this.pickerMonth = currentDate.getMonth();
    }
  }

  prevYear() {
    this.pickerYear--;
  }

  nextYear() {
    this.pickerYear++;
  }

  selectMonth(index: number) {
    this.pickerMonth = index;
    this.confirmMonthPicker();
  }

  confirmMonthPicker() {
    const newDate = new Date(this.pickerYear, this.pickerMonth, 1);
    // Adjust for timezone offset to keep the date correct when converting to ISO
    const offset = newDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(newDate.getTime() - offset)).toISOString().slice(0, -1);
    
    this.currentIsoDate = localISOTime;
    this.generateDaysForMonth(newDate);
    
    this.selectedDate = '';
    this.schedules = [];
    this.isMonthPickerOpen = false;
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
    this.isSubmitted = true;

    if (!this.selectedDepartmentId) {
      this.presentToast('Vui lòng chọn chuyên khoa!', 'warning');
      return;
    }
    if (!this.selectedDate) {
      this.presentToast('Vui lòng chọn ngày khám!', 'warning');
      return;
    }
    if (!this.selectedSchedule) {
      this.presentToast('Vui lòng chọn giờ khám!', 'warning');
      return;
    }

    // Validate Form
    if (!this.patientName.trim()) {
      this.presentToast('Vui lòng nhập họ tên!', 'warning');
      return;
    }
    if (!this.patientPhone.trim() || !this.isValidPhone(this.patientPhone)) {
      this.presentToast('Số điện thoại không hợp lệ!', 'warning');
      return;
    }
    if (!this.patientEmail.trim() || !this.isValidEmail(this.patientEmail)) {
      this.presentToast('Email không hợp lệ!', 'warning');
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

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
    return phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
