import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonDatetime } from '@ionic/angular/standalone';
import { forkJoin } from 'rxjs';

import {
  ClinicType,
  Department,
  WorkShiftInput,
  SaveSchedulesPayload
} from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';
import { WorkSchedulesService } from '../../services/work-schedules.service';

/** Ca hiển thị trên UI – có thể có id nếu là ca đã tồn tại trong DB */
interface ShiftView extends WorkShiftInput {
  id?: string;
}

@Component({
  selector: 'app-clinic-work-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, IonDatetime],
  templateUrl: './clinic-work-schedule.component.html',
  styleUrls: ['./clinic-work-schedule.component.scss']
})
export class ClinicWorkScheduleComponent implements OnInit, OnChanges {
  /** ID phòng khám – bắt buộc */
  @Input() clinicId!: string;

  /** 'SPECIALTY' (chuyên khoa) hoặc 'GENERAL' (đa khoa) */
  @Input() mode: ClinicType = 'SPECIALTY';

  /** departmentId hiện chọn – dùng cho cả chuyên khoa và đa khoa */
  @Input() departmentId: string | null = null;

  /** Có cho phép user chọn khoa từ dropdown hay không */
  @Input() allowDepartmentSelect = true;

  /** Emit khi lưu lịch thành công */
  @Output() saved = new EventEmitter<void>();

  /** Danh sách khoa của phòng khám */
  departments: Department[] = [];

  /** Ngày đang chọn – dạng 'YYYY-MM-DD' */
  selectedDate: string = new Date().toISOString().substring(0, 10);

  /** Dropdown tháng/năm */
  months = [
    { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 },
    { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 },
    { value: 9 }, { value: 10 }, { value: 11 }, { value: 12 }
  ];
  years: number[] = [];
  selectedMonth!: number;
  selectedYear!: number;

  /** Tất cả ca hiển thị trên UI (cả cũ và mới) */
  shifts: ShiftView[] = [];

  /** Lưu danh sách id ca đã xóa trên UI, sẽ gửi DELETE khi bấm Lưu */
  deletedShiftIds: string[] = [];

  loading = false;

  constructor(
    private departmentsService: DepartmentsService,
    private workSchedulesService: WorkSchedulesService
  ) {}

  // ---------------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------------
  ngOnInit() {
    console.log(
      '[ClinicWorkSchedule] ngOnInit clinicId=',
      this.clinicId,
      'mode=',
      this.mode,
      'departmentId(input)=',
      this.departmentId
    );

    // Khởi tạo dropdown tháng/năm theo selectedDate
    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    const baseYear = this.selectedYear;
    this.years = [];
    for (let y = baseYear - 1; y <= baseYear + 2; y++) {
      this.years.push(y);
    }

    // Luôn load danh sách khoa cho cả chuyên khoa & đa khoa,
    // để luôn có departmentId gửi xuống backend.
    this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clinicId'] && !changes['clinicId'].firstChange) {
      console.log(
        '[ClinicWorkSchedule] clinicId changed to',
        this.clinicId
      );
      this.loadDepartments();
    }

    if (changes['departmentId'] && !changes['departmentId'].firstChange) {
      console.log(
        '[ClinicWorkSchedule] departmentId input changed to',
        this.departmentId
      );
      this.loadSchedulesForDate();
    }
  }

  // ---------------------------------------------------
  // LOAD KHOA + LỊCH
  // ---------------------------------------------------
  /** Load tất cả khoa của phòng khám, auto chọn khoa đầu tiên nếu chưa có */
  private loadDepartments() {
    if (!this.clinicId) return;

    console.log(
      '[ClinicWorkSchedule] loadDepartments clinicId=',
      this.clinicId
    );

    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (depts) => {
        this.departments = depts || [];
        console.log('[ClinicWorkSchedule] departments loaded:', this.departments);

        // Nếu departmentId chưa có mà backend trả về >= 1 khoa
        if (!this.departmentId && this.departments.length) {
          this.departmentId = this.departments[0].id;
          console.log(
            '[ClinicWorkSchedule] auto set departmentId=',
            this.departmentId
          );
        }

        this.loadSchedulesForDate();
      },
      error: (err) => {
        console.error('[ClinicWorkSchedule] loadDepartments error', err);
      }
    });
  }

  /** Khi đổi tháng hoặc năm từ dropdown */
  onMonthOrYearChange() {
    const d = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    this.selectedDate = d.toISOString().substring(0, 10);
    console.log(
      '[ClinicWorkSchedule] onMonthOrYearChange -> selectedDate=',
      this.selectedDate
    );
    this.loadSchedulesForDate();
  }

  /** Khi chọn ngày trên ion-datetime */
  onDateChange(ev: any) {
    if (!ev?.detail?.value) return;
    this.selectedDate = ev.detail.value.substring(0, 10);

    const d = new Date(this.selectedDate);
    this.selectedMonth = d.getMonth() + 1;
    this.selectedYear = d.getFullYear();

    console.log('[ClinicWorkSchedule] onDateChange -> selectedDate=', this.selectedDate);
    this.loadSchedulesForDate();
  }

  /** Khi chọn khoa trong dropdown */
  onDepartmentChange() {
    console.log(
      '[ClinicWorkSchedule] onDepartmentChange departmentId=',
      this.departmentId
    );
    this.loadSchedulesForDate();
  }

  /** Load lịch làm việc cho clinic + department + date */
  private loadSchedulesForDate() {
    if (!this.clinicId) {
      console.warn('[ClinicWorkSchedule] loadSchedulesForDate: missing clinicId');
      return;
    }
    if (!this.departmentId) {
      console.warn(
        '[ClinicWorkSchedule] loadSchedulesForDate: missing departmentId (cần kiểm tra backend đã có khoa cho phòng khám chưa)'
      );
      return;
    }

    console.log(
      '[ClinicWorkSchedule] loadSchedulesForDate clinicId=',
      this.clinicId,
      'date=',
      this.selectedDate,
      'departmentId=',
      this.departmentId
    );

    this.loading = true;
    this.workSchedulesService
      .getByDate(this.clinicId, this.selectedDate, this.departmentId)
      .subscribe({
        next: (schedules) => {
          console.log(
            '[ClinicWorkSchedule] getByDate result=',
            schedules
          );

          this.shifts = (schedules || []).map((s) => ({
            id: s.id,
            startTime: s.start_time.substring(0, 5),
            endTime: s.end_time.substring(0, 5),
            capacity: s.capacity,
            maxCapacity: s.max_capacity ?? 5
          }));

          this.deletedShiftIds = [];
          this.loading = false;
        },
        error: (err) => {
          console.error('[ClinicWorkSchedule] getByDate error', err);
          this.loading = false;
        }
      });
  }

  // ---------------------------------------------------
  // THAO TÁC LIST CA
  // ---------------------------------------------------
  addShift() {
    const s: ShiftView = {
      startTime: '09:00',
      endTime: '11:00',
      maxCapacity: 5
    };
    this.shifts.push(s);
    console.log('[ClinicWorkSchedule] addShift', s);
  }

  removeShift(index: number) {
    const removed = this.shifts[index];
    console.log('[ClinicWorkSchedule] removeShift index=', index, 'shift=', removed);

    if (removed && removed.id) {
      this.deletedShiftIds.push(removed.id);
    }
    this.shifts.splice(index, 1);
  }

  // ---------------------------------------------------
  // LƯU: CREATE + UPDATE + DELETE
  // ---------------------------------------------------
  save() {
    if (!this.departmentId) {
      console.warn(
        '[ClinicWorkSchedule] save: departmentId is null -> không gửi được lên backend'
      );
      return;
    }

    const deptId = this.departmentId;
    const newShifts = this.shifts.filter((s) => !s.id);
    const existingShifts = this.shifts.filter((s) => !!s.id) as ShiftView[];

    console.log('[ClinicWorkSchedule] save() start', {
      selectedDate: this.selectedDate,
      deptId,
      newShifts,
      existingShifts,
      deletedShiftIds: this.deletedShiftIds
    });

    const ops = [];

    // XÓA các ca bị remove
    for (const id of this.deletedShiftIds) {
      ops.push(this.workSchedulesService.deleteSchedule(id));
    }

    // UPDATE các ca đã tồn tại
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

    // CREATE các ca mới
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

      console.log('[ClinicWorkSchedule] save() new shift payload', payload);
      ops.push(this.workSchedulesService.saveForDate(payload));
    }

    if (!ops.length) {
      console.log('[ClinicWorkSchedule] save() no changes -> skip');
      return;
    }

    this.loading = true;
    forkJoin(ops).subscribe({
      next: (results) => {
        console.log('[ClinicWorkSchedule] save() success results=', results);

        // Sau khi tạo/cập nhật/xóa xong, reload danh sách ca từ DB
        this.deletedShiftIds = [];
        this.loadSchedulesForDate();

        this.loading = false;
        this.saved.emit(); // BookingPage show IonToast "Lưu ca làm việc thành công"
      },
      error: (err) => {
        console.error('[ClinicWorkSchedule] save() error', err);
        this.loading = false;
      }
    });
  }
}
