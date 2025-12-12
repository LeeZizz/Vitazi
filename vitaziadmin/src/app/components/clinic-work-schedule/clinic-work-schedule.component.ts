import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonDatetime, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, saveOutline, alertCircleOutline } from 'ionicons/icons';

import { ClinicType, Department, WorkShiftInput, SaveSchedulesPayload } from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';
import { WorkSchedulesService } from '../../services/work-schedules.service';

export interface ShiftView extends WorkShiftInput {
  isValid?: boolean;
  errorMsg?: string;
}

@Component({
  selector: 'app-clinic-work-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, IonDatetime, IonIcon],
  templateUrl: './clinic-work-schedule.component.html',
  styleUrls: ['./clinic-work-schedule.component.scss']
})
export class ClinicWorkScheduleComponent implements OnInit {
  @Input() clinicId!: string;
  @Input() departmentId: string | null = null;

  // FIX ERROR NG8002: Thêm lại Input mode để nhận giá trị từ booking.page.html
  @Input() mode: ClinicType = 'SPECIALTY';

  @Input() allowDepartmentSelect = true;
  @Output() saved = new EventEmitter<void>();

  departments: Department[] = [];
  selectedDate: string = new Date().toISOString().substring(0, 10);

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));
  years: number[] = [];
  selectedMonth!: number;
  selectedYear!: number;

  shifts: ShiftView[] = [];
  loading = false;

  constructor(
    private departmentsService: DepartmentsService,
    private workSchedulesService: WorkSchedulesService,
    private toastController: ToastController
  ) {
    addIcons({ trashOutline, addOutline, saveOutline, alertCircleOutline });
  }

  ngOnInit() {
    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();
    const baseYear = this.selectedYear;
    this.years = [baseYear - 1, baseYear, baseYear + 1, baseYear + 2];

    this.loadDepartments();
    this.addShift();
  }

  private loadDepartments() {
    if (!this.clinicId) return;
    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (depts) => {
        this.departments = depts || [];
        if (!this.departmentId && this.departments.length) {
          this.departmentId = this.departments[0].id;
        }
      }
    });
  }

  // FIX ERROR TS2551: Thêm hàm xử lý khi đổi khoa
  onDepartmentChange() {
    // Vì đang ở chế độ tạo mới, khi đổi khoa ta không cần load lại lịch cũ.
    // Tuy nhiên, có thể reset form để tránh người dùng nhập nhầm cho khoa cũ.
    // Hoặc giữ nguyên nếu muốn giữ lại dữ liệu đang nhập.
    console.log('Đã đổi sang khoa:', this.departmentId);
  }

  onMonthOrYearChange() {
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1, 12);
    this.selectedDate = d.toISOString().substring(0, 10);
    this.resetForm();
  }

  onDateChange(ev: any) {
    if (!ev?.detail?.value) return;
    this.selectedDate = ev.detail.value.substring(0, 10);

    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    this.resetForm();
  }

  resetForm() {
    this.shifts = [];
    this.addShift();
  }

  addShift() {
    this.shifts.push({
      startTime: '',
      endTime: '',
      maxCapacity: 10,
      isValid: true
    });
  }

  removeShift(index: number) {
    this.shifts.splice(index, 1);
  }

  validateShift(shift: ShiftView) {
    shift.isValid = true;
    shift.errorMsg = undefined;
    if (shift.startTime && shift.endTime) {
      if (shift.startTime >= shift.endTime) {
        shift.isValid = false;
        shift.errorMsg = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
      }
    }
  }

  async save() {
    if (!this.departmentId) {
      this.presentToast('Vui lòng chọn Khoa.', 'warning');
      return;
    }

    const validShifts = this.shifts.filter(s => s.startTime && s.endTime);

    if (validShifts.length === 0) {
      this.presentToast('Vui lòng nhập ít nhất 1 ca làm việc.', 'warning');
      return;
    }

    let hasError = false;
    validShifts.forEach(s => {
      if (s.startTime >= s.endTime) {
        s.isValid = false;
        hasError = true;
      }
    });

    if (hasError) {
      this.presentToast('Có ca làm việc bị sai giờ.', 'danger');
      return;
    }

    const payload: SaveSchedulesPayload = {
      clinicId: this.clinicId,
      departmentId: this.departmentId,
      date: this.selectedDate,
      shifts: validShifts.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        capacity: 0,
        maxCapacity: s.maxCapacity ?? 10
      }))
    };

    this.loading = true;

    this.workSchedulesService.saveForDate(payload).subscribe({
      next: async () => {
        this.loading = false;
        this.saved.emit();
        await this.presentToast('Đã thêm lịch làm việc thành công!', 'success');
        this.resetForm();
      },
      error: async (err) => {
        console.error('Save error', err);
        this.loading = false;
        await this.presentToast('Lỗi khi lưu lịch.', 'danger');
      }
    });
  }

  async presentToast(message: string, type: 'success' | 'danger' | 'warning') {
    let color = 'medium';
    if (type === 'success') color = 'success';
    if (type === 'danger') color = 'danger';
    if (type === 'warning') color = 'warning';

    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }
}
