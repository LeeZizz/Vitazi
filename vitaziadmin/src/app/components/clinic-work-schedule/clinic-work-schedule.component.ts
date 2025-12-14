import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonDatetime, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, saveOutline, alertCircleOutline, timeOutline } from 'ionicons/icons';
import { forkJoin, lastValueFrom } from 'rxjs';

import { ClinicType, Department, WorkShiftInput, SaveSchedulesPayload } from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';
import { WorkSchedulesService } from '../../services/work-schedules.service';

export interface ShiftView extends WorkShiftInput {
  isValid?: boolean;
  errorMsg?: string;
  id?: string;
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
  @Input() mode: ClinicType = 'SPECIALTY';
  @Input() allowDepartmentSelect = true;
  @Output() saved = new EventEmitter<void>();

  departments: Department[] = [];
  selectedDate: string = ''; // Sẽ được set trong ngOnInit
  minDate: string = '';

  months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1 }));
  years: number[] = [];
  selectedMonth!: number;
  selectedYear!: number;

  shifts: ShiftView[] = [];
  deletedShiftIds: string[] = [];
  loading = false;

  constructor(
    private departmentsService: DepartmentsService,
    private workSchedulesService: WorkSchedulesService,
    private toastController: ToastController
  ) {
    addIcons({ trashOutline, addOutline, saveOutline, alertCircleOutline, timeOutline });
  }

  ngOnInit() {
    const today = new Date();

    // Tính ngày mai (Today + 1)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Chuyển đổi sang Local Time để lấy chuỗi YYYY-MM-DD chính xác
    const localTomorrow = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000));
    this.minDate = localTomorrow.toISOString().split('T')[0];

    // Mặc định chọn ngày minDate (ngày mai)
    this.selectedDate = this.minDate;

    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();
    const baseYear = this.selectedYear;
    this.years = [baseYear - 1, baseYear, baseYear + 1, baseYear + 2];

    this.loadDepartments();
  }

  private loadDepartments() {
    if (!this.clinicId) return;
    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (depts) => {
        this.departments = depts || [];
        if (!this.departmentId && this.departments.length) {
          this.departmentId = this.departments[0].id;
        }
        this.loadScheduleData();
      }
    });
  }

  loadScheduleData() {
    if (!this.clinicId || (this.allowDepartmentSelect && !this.departmentId)) return;

    this.loading = true;
    this.deletedShiftIds = [];

    this.workSchedulesService.getAllSchedulesByDate(this.clinicId, this.departmentId!, 0, 100)
      .subscribe({
        next: (res) => {
          const allItems = res.result?.content || [];
          const shiftsForDate = allItems.filter((s: any) => s.date === this.selectedDate);

          if (shiftsForDate.length > 0) {
            this.shifts = shiftsForDate.map((s: any) => ({
              id: s.id,
              startTime: s.startTime ? s.startTime.substring(0, 5) : '',
              endTime: s.endTime ? s.endTime.substring(0, 5) : '',
              maxCapacity: s.maxCapacity,
              capacity: s.capacity,
              isValid: true
            }));
          } else {
            this.resetForm();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi tải lịch:', err);
          this.loading = false;
          this.resetForm();
        }
      });
  }

  onDepartmentChange() { this.loadScheduleData(); }

  onMonthOrYearChange() {
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1, 12);
    // Nếu ngày mùng 1 của tháng chọn nhỏ hơn minDate, thì vẫn phải dùng minDate nếu đang ở tháng hiện tại
    // Tuy nhiên logic đơn giản là cứ set ngày mùng 1, user chọn lại ngày sau
    this.selectedDate = d.toISOString().substring(0, 10);

    // Nếu ngày được chọn < minDate, reset về minDate để đảm bảo không sửa quá khứ
    if (this.selectedDate < this.minDate) {
        this.selectedDate = this.minDate;
    }

    this.loadScheduleData();
  }

  onDateChange(ev: any) {
    if (!ev?.detail?.value) return;
    const val = Array.isArray(ev.detail.value) ? ev.detail.value[0] : ev.detail.value;
    this.selectedDate = val.substring(0, 10);

    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    this.loadScheduleData();
  }

  resetForm() {
    this.shifts = [];
    this.deletedShiftIds = [];
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
    const shift = this.shifts[index];
    if (shift.id) {
      this.deletedShiftIds.push(shift.id);
    }
    this.shifts.splice(index, 1);
  }

  validateShift(shift: ShiftView) {
    shift.isValid = true;
    shift.errorMsg = undefined;

    if (!shift.startTime || !shift.endTime) return;

    if (shift.startTime >= shift.endTime) {
      shift.isValid = false;
      shift.errorMsg = 'Giờ kết thúc phải sau giờ bắt đầu';
    }
  }

  private checkOverlap(shifts: ShiftView[]): boolean {
    const sortedShifts = [...shifts].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const current = sortedShifts[i];
      const next = sortedShifts[i + 1];

      if (next.startTime < current.endTime) {
        const originalCurrent = shifts.find(s => s === current);
        const originalNext = shifts.find(s => s === next);
        if (originalCurrent) {
          originalCurrent.isValid = false;
          originalCurrent.errorMsg = `Xung đột thời gian với ca ${next.startTime}`;
        }
        if (originalNext) {
          originalNext.isValid = false;
          originalNext.errorMsg = `Xung đột thời gian với ca ${current.startTime}`;
        }
        return true;
      }
    }
    return false;
  }

  async save() {
    // 1. Kiểm tra ngày hợp lệ (Phải từ ngày mai trở đi)
    if (this.selectedDate < this.minDate) {
      this.presentToast('Chỉ có thể tạo hoặc chỉnh sửa lịch làm việc từ ngày mai trở đi.', 'warning');
      return;
    }

    if (!this.departmentId) {
      this.presentToast('Vui lòng chọn Khoa/Phòng ban.', 'warning');
      return;
    }

    const validShifts = this.shifts.filter(s => s.startTime && s.endTime);
    if (validShifts.length === 0 && this.deletedShiftIds.length === 0) {
      this.presentToast('Bạn chưa nhập thông tin ca làm việc nào.', 'warning');
      return;
    }

    this.shifts.forEach(s => { s.isValid = true; s.errorMsg = undefined; });

    let hasError = false;
    validShifts.forEach(s => {
      this.validateShift(s);
      if (s.isValid === false) hasError = true;
    });

    if (hasError) {
        this.presentToast('Vui lòng kiểm tra lại giờ bắt đầu và kết thúc.', 'danger');
        return;
    }

    if (this.checkOverlap(validShifts)) {
      this.presentToast('Các ca làm việc đang bị trùng thời gian. Vui lòng kiểm tra lại.', 'danger');
      return;
    }

    this.loading = true;

    try {
      // 1. XÓA
      if (this.deletedShiftIds.length > 0) {
        const deleteObservables = this.deletedShiftIds.map(id =>
          this.workSchedulesService.deleteSchedule(id)
        );
        await lastValueFrom(forkJoin(deleteObservables));
      }

      // 2. TÁCH DANH SÁCH
      const shiftsToUpdate = validShifts.filter(s => s.id);
      const shiftsToCreate = validShifts.filter(s => !s.id);

      // 3. CẬP NHẬT
      if (shiftsToUpdate.length > 0) {
        const updateTasks = shiftsToUpdate.map(s =>
            this.workSchedulesService.updateSchedule(
              s.id!,
              {
                startTime: s.startTime,
                endTime: s.endTime,
                capacity: s.capacity,
                maxCapacity: s.maxCapacity
              },
              this.selectedDate,
              true
            )
        );
        await lastValueFrom(forkJoin(updateTasks));
      }

      // 4. TẠO MỚI
      if (shiftsToCreate.length > 0) {
        const payload: SaveSchedulesPayload = {
          clinicId: this.clinicId,
          departmentId: this.departmentId,
          date: this.selectedDate,
          shifts: shiftsToCreate.map(s => ({
            startTime: s.startTime,
            endTime: s.endTime,
            capacity: 0,
            maxCapacity: s.maxCapacity ?? 10
          }))
        };
        await lastValueFrom(this.workSchedulesService.saveForDate(payload));
      }

      this.loading = false;
      this.saved.emit();
      await this.presentToast('Cập nhật lịch làm việc thành công!', 'success');
      this.loadScheduleData();

    } catch (err: any) {
      console.error('Save error', err);
      this.loading = false;
      const backendCode = err.error?.code;
      let userMessage = 'Đã xảy ra lỗi khi lưu lịch.';

      switch (backendCode) {
        case 1009:
            userMessage = 'Không thể giảm số lượng tối đa thấp hơn số bệnh nhân đã đặt hẹn.';
            break;
        case 1011:
            userMessage = 'Khung giờ này bị trùng lặp với một lịch làm việc đã tồn tại trong hệ thống.';
            break;
        case 1012:
            userMessage = 'Không thể xóa hoặc sửa đổi ca này vì đã có bệnh nhân đặt lịch.';
            break;
        default:
            userMessage = err.error?.message || 'Lỗi hệ thống không xác định. Vui lòng thử lại sau.';
      }
      await this.presentToast(userMessage, 'danger');
    }
  }

  async presentToast(message: string, type: 'success' | 'danger' | 'warning') {
    let color = 'medium';
    if (type === 'success') color = 'success';
    if (type === 'danger') color = 'danger';
    if (type === 'warning') color = 'warning';

    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: color,
      icon: type === 'danger' ? 'alert-circle-outline' : undefined
    });
    await toast.present();
  }
}
