import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { BookingService } from '../../services/booking.service';
import { Clinic, Department, WorkSchedule, BookingRequest } from '../../models/client-booking.models';

@Component({
  selector: 'app-booking-form',
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonButton, IonInput, IonTextarea, IonSelect, IonSelectOption
  ]
})
export class BookingFormComponent implements OnInit {
  clinics: Clinic[] = [];
  departments: Department[] = [];
  schedules: WorkSchedule[] = [];

  // Danh sách ngày hiển thị trên thanh ngang
  weekDays: any[] = [];

  selectedClinicId: string = '';
  selectedDepartmentId: string = '';
  selectedDate: string = ''; // YYYY-MM-DD
  selectedSchedule: WorkSchedule | null = null;

  // Form input
  patientName: string = '';
  patientPhone: string = '';
  patientEmail: string = '';
  description: string = '';

  constructor(
    private bookingService: BookingService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.generateWeekDays(); // 1. Tạo ngày
    this.loadClinics();      // 2. Tải phòng khám
  }

  // Tạo danh sách 7 ngày từ hôm nay
  generateWeekDays() {
    const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      this.weekDays.push({
        dayName: days[d.getDay()], // Thứ 2...
        dayNumber: d.getDate(),    // 11, 12...
        displayMonth: `Tháng ${d.getMonth() + 1}`,
        // Format YYYY-MM-DD để gửi API (Lưu ý múi giờ)
        fullDate: d.toLocaleDateString('en-CA')
      });
    }
    // Mặc định chọn ngày đầu tiên
    this.selectedDate = this.weekDays[0].fullDate;
  }

  loadClinics() {
    this.bookingService.getAllClinics().subscribe({
      next: (data) => this.clinics = data,
      error: (e) => console.error(e)
    });
  }

  onClinicChange() {
    this.departments = [];
    this.selectedDepartmentId = '';
    this.schedules = [];
    if (this.selectedClinicId) {
      this.bookingService.getDepartmentsByClinic(this.selectedClinicId).subscribe(data => this.departments = data);
    }
  }

  // Khi người dùng chọn ngày trên thanh ngang
  selectDate(day: any) {
    this.selectedDate = day.fullDate;
    this.loadSchedules();
  }

  onDepartmentChange() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.schedules = [];
    this.selectedSchedule = null;

    if (this.selectedClinicId && this.selectedDepartmentId && this.selectedDate) {
      console.log('Calling API with:', this.selectedDate);
      this.bookingService.getSchedules(this.selectedClinicId, this.selectedDepartmentId, this.selectedDate)
        .subscribe({
          next: (data) => this.schedules = data,
          error: (err) => console.error('Lỗi tải lịch', err)
        });
    }
  }

  selectTimeSlot(sch: WorkSchedule) {
    this.selectedSchedule = sch;
  }

  async onSubmit() {
    if (!this.selectedSchedule || !this.patientName || !this.patientPhone) {
      this.presentToast('Vui lòng nhập đủ thông tin!', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Đang đặt lịch...' });
    await loading.present();

    const payload: BookingRequest = {
      clinicId: this.selectedClinicId,
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
        this.presentToast('Đặt lịch thành công!', 'success');
        this.patientName = ''; this.patientPhone = ''; // Reset form
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('Lỗi đặt lịch!', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color: color, position: 'top' });
    toast.present();
  }

  formatTime(time: string) {
    return time ? time.substring(0, 5) : '';
  }
}
