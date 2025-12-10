import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonButton,
  IonIcon, IonInput, IonTextarea, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { BookingService } from '../../services/booking.service';
import { Clinic, Department, WorkSchedule, BookingRequest } from '../../models/booking.models';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonButton, IonIcon, IonInput, IonTextarea]
})
export class BookingPage implements OnInit {
  // Data Lists
  clinics: Clinic[] = [];
  departments: Department[] = [];
  schedules: WorkSchedule[] = [];

  // Form Data (Selection)
  selectedClinicId: string = '';
  selectedDepartmentId: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0]; // Hôm nay YYYY-MM-DD
  selectedSchedule: WorkSchedule | null = null;

  // Form Data (Patient Info)
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

  // --- 1. Load Data ---
  loadClinics() {
    this.bookingService.getAllClinics().subscribe({
      next: (res) => this.clinics = res.result || [],
      error: (err) => console.error(err)
    });
  }

  onClinicChange() {
    // Reset data con
    this.departments = [];
    this.schedules = [];
    this.selectedDepartmentId = '';
    this.selectedSchedule = null;

    if (this.selectedClinicId) {
      this.bookingService.getDepartmentsByClinic(this.selectedClinicId).subscribe({
        next: (res) => this.departments = res.result || []
      });
    }
  }

  onDepartmentOrDateChange() {
    this.schedules = [];
    this.selectedSchedule = null;

    if (this.selectedClinicId && this.selectedDepartmentId && this.selectedDate) {
      // Cắt lấy YYYY-MM-DD nếu ion-datetime trả về full ISO
      const dateStr = this.selectedDate.split('T')[0];

      this.bookingService.getSchedules(this.selectedClinicId, this.selectedDepartmentId, dateStr).subscribe({
        next: (res) => {
          this.schedules = res.result || [];
        }
      });
    }
  }

  selectSchedule(sch: WorkSchedule) {
    this.selectedSchedule = sch;
  }

  // --- 2. Submit ---
  async onSubmit() {
    if (!this.selectedSchedule || !this.patientName || !this.patientPhone) {
      this.presentToast('Vui lòng điền đầy đủ thông tin!', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Đang xử lý...' });
    await loading.present();

    const payload: BookingRequest = {
      clinicId: this.selectedClinicId,
      departmentId: this.selectedDepartmentId,
      scheduleId: this.selectedSchedule.id,
      appointmentDate: this.selectedDate.split('T')[0],
      userName: this.patientName,
      userPhone: this.patientPhone,
      userEmail: this.patientEmail,
      description: this.description
    };

    this.bookingService.createAppointment(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.presentToast('Đặt lịch thành công!', 'success');
        // Reset form hoặc navigate về Home
      },
      error: async (err) => {
        await loading.dismiss();
        this.presentToast('Lỗi đặt lịch. Vui lòng thử lại.', 'danger');
        console.error(err);
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2000, color: color, position: 'top'
    });
    await toast.present();
  }

  // Helper hiển thị giờ
  formatTime(time: string) {
    return time.substring(0, 5); // 08:00:00 -> 08:00
  }
}
