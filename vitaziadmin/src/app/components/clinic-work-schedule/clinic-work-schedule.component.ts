import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonDatetime, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, addOutline, saveOutline, alertCircleOutline, checkmarkCircleOutline, informationCircleOutline } from 'ionicons/icons';
import { forkJoin } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import {
  ClinicType,
  Department,
  WorkShiftInput,
  SaveSchedulesPayload
} from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';
import { WorkSchedulesService } from '../../services/work-schedules.service';

/** Mở rộng interface để hỗ trợ validate UI */
interface ShiftView extends WorkShiftInput {
  id?: string;
  isValid?: boolean; // True: hợp lệ, False: hiện lỗi đỏ
  errorMsg?: string; // Nội dung lỗi hiển thị
}

@Component({
  selector: 'app-clinic-work-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, IonDatetime, IonIcon],
  templateUrl: './clinic-work-schedule.component.html',
  styleUrls: ['./clinic-work-schedule.component.scss'],
  // ANIMATION: Hiệu ứng xuất hiện mượt mà cho danh sách
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px)' }),
          stagger(50, [
            animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('200ms ease-out', style({ opacity: 0, height: 0, margin: 0, transform: 'scale(0.9)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class ClinicWorkScheduleComponent implements OnInit, OnChanges {
  @Input() clinicId!: string;
  @Input() mode: ClinicType = 'SPECIALTY';
  @Input() departmentId: string | null = null;
  @Input() allowDepartmentSelect = true;
  @Output() saved = new EventEmitter<void>();

  departments: Department[] = [];

  // Mặc định lấy ngày hôm nay
  selectedDate: string = new Date().toISOString().substring(0, 10);

  // Dữ liệu cho Dropdown
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
    // Đăng ký icon sử dụng trong HTML
    addIcons({
      trashOutline,
      addOutline,
      saveOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      informationCircleOutline
    });
  }

  // ---------------------------------------------------
  // LIFECYCLE & INIT
  // ---------------------------------------------------
  ngOnInit() {
    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    const baseYear = this.selectedYear;
    // Tạo danh sách năm: Năm ngoái, năm nay, 2 năm tới
    this.years = [baseYear - 1, baseYear, baseYear + 1, baseYear + 2];

    this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clinicId'] && !changes['clinicId'].firstChange) {
      this.loadDepartments();
    }
    if (changes['departmentId'] && !changes['departmentId'].firstChange) {
      this.loadSchedulesForDate();
    }
  }

  // ---------------------------------------------------
  // DATA LOADING
  // ---------------------------------------------------
  private loadDepartments() {
    if (!this.clinicId) return;

    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (depts) => {
        this.departments = depts || [];

        // Nếu chưa có departmentId (lần đầu vào), tự chọn cái đầu tiên
        if (!this.departmentId && this.departments.length) {
          this.departmentId = this.departments[0].id;
        }
        this.loadSchedulesForDate();
      },
      error: (err) => console.error('Lỗi tải danh sách khoa', err)
    });
  }

  /** Xử lý khi đổi Tháng/Năm từ dropdown */
  onMonthOrYearChange() {
    // Tạo ngày mùng 1 của tháng/năm đã chọn để cập nhật Calendar
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1, 12); // giờ 12 để tránh lệch múi giờ
    this.selectedDate = d.toISOString().substring(0, 10);
    this.loadSchedulesForDate();
  }

  /** Xử lý khi click chọn ngày trên Calendar */
  onDateChange(ev: any) {
    if (!ev?.detail?.value) return;
    this.selectedDate = ev.detail.value.substring(0, 10);

    // Cập nhật lại dropdown tháng/năm cho khớp với ngày vừa chọn
    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    this.loadSchedulesForDate();
  }

  onDepartmentChange() {
    this.loadSchedulesForDate();
  }

  private loadSchedulesForDate() {
    if (!this.clinicId || !this.departmentId) return;

    this.loading = true;
    this.workSchedulesService
      .getByDate(this.clinicId, this.selectedDate, this.departmentId)
      .subscribe({
        next: (schedules) => {
          // Map dữ liệu từ DB sang View
          this.shifts = (schedules || []).map((s) => ({
            id: s.id,
            startTime: s.start_time.substring(0, 5),
            endTime: s.end_time.substring(0, 5),
            capacity: s.capacity,
            maxCapacity: s.max_capacity ?? 5,
            isValid: true // Mặc định dữ liệu DB là hợp lệ
          }));

          this.deletedShiftIds = [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi tải lịch làm việc', err);
          this.loading = false;
          this.presentToast('Không tải được dữ liệu lịch.', 'danger');
        }
      });
  }

  // ---------------------------------------------------
  // USER ACTIONS (ADD, REMOVE, VALIDATE)
  // ---------------------------------------------------

  addShift() {
    // Tạo ca mới TRỐNG theo yêu cầu (không tự tính giờ)
    const s: ShiftView = {
      startTime: '',
      endTime: '',
      maxCapacity: 5,
      isValid: true // Chưa đỏ vội, đợi user nhập
    };
    this.shifts.push(s);
  }

  removeShift(index: number) {
    const removed = this.shifts[index];

    // Nếu ca đã có ID (đã lưu trong DB), đưa vào danh sách cần xóa
    if (removed && removed.id) {
      this.deletedShiftIds.push(removed.id);
    }

    this.shifts.splice(index, 1);
  }

  /** Kiểm tra logic: Giờ Bắt đầu < Giờ Kết thúc */
  validateShift(shift: ShiftView) {
    // Reset trạng thái
    shift.isValid = true;
    shift.errorMsg = undefined;

    // Chỉ kiểm tra khi đã nhập đủ cả 2
    if (shift.startTime && shift.endTime) {
      if (shift.startTime >= shift.endTime) {
        shift.isValid = false;
        shift.errorMsg = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
      }
    }
  }

  // ---------------------------------------------------
  // SAVE LOGIC
  // ---------------------------------------------------
  async save() {
    if (!this.departmentId) {
      this.presentToast('Vui lòng chọn Khoa trước khi lưu.', 'warning');
      return;
    }

    // 1. VALIDATION TOÀN BỘ
    let hasError = false;
    let hasEmpty = false;

    this.shifts.forEach(s => {
      if (!s.startTime || !s.endTime) {
        s.isValid = false;
        hasEmpty = true;
      } else if (s.startTime >= s.endTime) {
        s.isValid = false;
        s.errorMsg = 'Giờ không hợp lệ';
        hasError = true;
      }
    });

    if (hasEmpty) {
      this.presentToast('Vui lòng nhập đầy đủ giờ Bắt đầu và Kết thúc.', 'danger');
      return;
    }
    if (hasError) {
      this.presentToast('Có ca làm việc bị sai giờ. Vui lòng kiểm tra lại.', 'danger');
      return;
    }

    // 2. PREPARE REQUESTS
    const deptId = this.departmentId;
    const newShifts = this.shifts.filter((s) => !s.id);
    const existingShifts = this.shifts.filter((s) => !!s.id) as ShiftView[];

    const ops = [];

    // DELETE requests
    for (const id of this.deletedShiftIds) {
      ops.push(this.workSchedulesService.deleteSchedule(id));
    }

    // UPDATE requests
    for (const s of existingShifts) {
      ops.push(
        this.workSchedulesService.updateSchedule(
          s.id!,
          this.clinicId,
          this.selectedDate,
          deptId,
          {
            startTime: s.startTime,
            endTime: s.endTime,
            capacity: s.capacity ?? 0,
            maxCapacity: s.maxCapacity ?? 0
          }
        )
      );
    }

    // CREATE request (batch)
    if (newShifts.length) {
      const payload: SaveSchedulesPayload = {
        clinicId: this.clinicId,
        departmentId: deptId,
        date: this.selectedDate,
        shifts: newShifts.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          capacity: s.capacity ?? 0,
          maxCapacity: s.maxCapacity ?? 0
        }))
      };
      ops.push(this.workSchedulesService.saveForDate(payload));
    }

    // Nếu không có thay đổi gì
    if (ops.length === 0) {
      this.presentToast('Không có thay đổi nào để lưu.', 'warning');
      return;
    }

    // 3. EXECUTE
    this.loading = true;
    forkJoin(ops).subscribe({
      next: async () => {
        // Reset danh sách xóa và tải lại dữ liệu mới nhất từ DB
        this.deletedShiftIds = [];
        this.loadSchedulesForDate();

        this.loading = false;
        this.saved.emit(); // Bắn event ra ngoài (nếu cần parent component biết)
        await this.presentToast('Lưu lịch làm việc thành công!', 'success');
      },
      error: async (err) => {
        console.error('Save error', err);
        this.loading = false;
        await this.presentToast('Đã xảy ra lỗi khi lưu. Vui lòng thử lại.', 'danger');
      }
    });
  }

  // ---------------------------------------------------
  // HELPER: TOAST NOTIFICATION
  // ---------------------------------------------------
  async presentToast(message: string, type: 'success' | 'danger' | 'warning') {
    let iconName = 'information-circle-outline';
    let cssClass = 'toast-info';

    if (type === 'success') {
      iconName = 'checkmark-circle-outline';
      cssClass = 'toast-success';
    } else if (type === 'danger') {
      iconName = 'alert-circle-outline';
      cssClass = 'toast-error';
    }

    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top', // Hiển thị trên cùng để dễ thấy trên mobile
      color: type,
      icon: iconName,
      buttons: [{ text: 'Đóng', role: 'cancel' }]
    });

    await toast.present();
  }
}
