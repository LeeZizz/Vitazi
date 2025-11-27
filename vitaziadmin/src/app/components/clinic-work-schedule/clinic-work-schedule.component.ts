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
import {
  IonDatetime
} from '@ionic/angular/standalone';

import {
  ClinicType,
  Department,
  WorkShiftInput,
  SaveSchedulesPayload
} from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';
import { WorkSchedulesService } from '../../services/work-schedules.service';

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

  /** MODE: 'SPECIALTY' (chuyên khoa) hay 'GENERAL' (đa khoa) */
  @Input() mode: ClinicType = 'SPECIALTY';

  /** departmentId hiện chọn (dùng khi đa khoa) */
  @Input() departmentId: string | null = null;

  /** Có cho phép chọn khoa từ dropdown hay không */
  @Input() allowDepartmentSelect = true;

  /** Emit khi lưu lịch thành công */
  @Output() saved = new EventEmitter<void>();

  departments: Department[] = [];

  selectedDate: string = new Date().toISOString().substring(0, 10);
  shifts: WorkShiftInput[] = [{ startTime: '09:00', endTime: '11:00' }];

  loading = false;

  constructor(
    private departmentsService: DepartmentsService,
    private workSchedulesService: WorkSchedulesService
  ) {}

  ngOnInit() {
    if (this.mode === 'GENERAL' && this.allowDepartmentSelect) {
      this.loadDepartments();
    }
    this.loadSchedulesForDate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['departmentId'] && !changes['departmentId'].firstChange) ||
      (changes['clinicId'] && !changes['clinicId'].firstChange)
    ) {
      this.loadSchedulesForDate();
    }
  }

  private loadDepartments() {
    this.departmentsService
      .getByClinic(this.clinicId)
      .subscribe((depts) => (this.departments = depts));
  }

  onDateChange(ev: any) {
    this.selectedDate = ev.detail.value.substring(0, 10);
    this.loadSchedulesForDate();
  }

  onDepartmentChange() {
    this.loadSchedulesForDate();
  }

  private loadSchedulesForDate() {
    if (!this.clinicId) return;
    if (this.mode === 'GENERAL' && !this.departmentId) return;

    this.loading = true;
    this.workSchedulesService
      .getByDate(
        this.clinicId,
        this.selectedDate,
        this.mode === 'GENERAL' ? this.departmentId : undefined
      )
      .subscribe({
        next: (schedules) => {
          if (!schedules || !schedules.length) {
            this.shifts = [{ startTime: '09:00', endTime: '11:00' }];
          } else {
            this.shifts = schedules.map((s) => ({
              startTime: s.start_time.substring(0, 5),
              endTime: s.end_time.substring(0, 5),
              capacity: s.capacity,
              maxCapacity: s.max_capacity
            }));
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  addShift() {
    this.shifts.push({
      startTime: '09:00',
      endTime: '10:00'
    });
  }

  removeShift(index: number) {
    this.shifts.splice(index, 1);
  }

  save() {
    if (this.mode === 'GENERAL' && !this.departmentId) return;

    const payload: SaveSchedulesPayload = {
      clinicId: this.clinicId,
      departmentId: this.mode === 'GENERAL' ? this.departmentId! : null,
      date: this.selectedDate,
      shifts: this.shifts
    };

    this.workSchedulesService.saveForDate(payload).subscribe(() => {
      this.saved.emit();
    });
  }
}
