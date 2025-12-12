import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonToggle, IonInfiniteScroll, IonInfiniteScrollContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, chevronDownOutline } from 'ionicons/icons';

import { WorkSchedulesService } from '../../services/work-schedules.service';
import { DepartmentsService } from '../../services/departments.service';
import { Department } from '../../models/clinic.models';

interface ScheduleGroup {
  date: string;
  schedules: any[];
}

@Component({
  selector: 'app-clinic-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonToggle, IonInfiniteScroll, IonInfiniteScrollContent, IonIcon],
  templateUrl: './clinic-schedule-list.component.html',
  styleUrls: ['./clinic-schedule-list.component.scss']
})
export class ClinicScheduleListComponent implements OnInit, OnChanges {
  @Input() clinicId!: string;
  @Input() initialDepartmentId: string | null = null;
  @Output() editRequested = new EventEmitter<void>();

  departments: Department[] = [];
  selectedDepartmentId: string = '';

  scheduleGroups: ScheduleGroup[] = [];
  page = 0;
  size = 6; // Theo yêu cầu
  loading = false;
  hasMoreData = true;

  constructor(
    private workSchedulesService: WorkSchedulesService,
        private departmentsService: DepartmentsService,
        private toastController: ToastController
  ) {
    addIcons({ timeOutline, chevronDownOutline });
  }

  ngOnInit() {
    if (this.clinicId) this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges): void {
     if (changes['clinicId'] && !changes['clinicId'].firstChange) {
       this.loadDepartments();
     }
  }

onToggleStatus(shift: any, event: any) {
    const newStatus = event.detail.checked;
    const originalStatus = !newStatus; // Lưu trạng thái cũ để revert nếu lỗi

    // Gọi API Update
    this.workSchedulesService.updateSchedule(
      shift.id,
      {
        startTime: shift.startTime,
        endTime: shift.endTime,
        capacity: shift.capacity,
        maxCapacity: shift.maxCapacity
      },
      shift.date,
      newStatus // Truyền trạng thái mới
    ).subscribe({
      next: (updatedShift) => {
        // Cập nhật lại data trong list để đồng bộ (nếu cần)
        shift.isActive = updatedShift.is_active;
        this.presentToast(`Đã ${newStatus ? 'bật' : 'tắt'} ca làm việc thành công`, 'success');
      },
      error: (err) => {
        console.error('Lỗi cập nhật trạng thái:', err);

        // Revert lại UI nếu API lỗi
        shift.isActive = originalStatus;
        // Note: Do ion-toggle 2 chiều binding, việc revert này đôi khi cần trick nhỏ với ChangeDetectorRef
        // hoặc đơn giản là thông báo lỗi để user load lại
        this.presentToast('Không thể cập nhật trạng thái. Vui lòng thử lại.', 'danger');

        // Trick: set timeout để đảo ngược lại toggle trên UI nếu muốn mượt
        event.target.checked = originalStatus;
      }
    });
  }

  async presentToast(msg: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  loadDepartments() {
    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (res) => {
        this.departments = res || [];
        // Chọn khoa mặc định
        if (this.initialDepartmentId) {
          this.selectedDepartmentId = this.initialDepartmentId;
        } else if (this.departments.length > 0) {
          this.selectedDepartmentId = this.departments[0].id;
        }

        if (this.selectedDepartmentId) {
          this.loadData(true);
        }
      }
    });
  }

  onDepartmentChange() {
    this.loadData(true);
  }

  loadData(reset: boolean = false, event?: any) {
    if (reset) {
      this.page = 0;
      this.scheduleGroups = [];
      this.hasMoreData = true;
    }

    if (!this.clinicId || !this.selectedDepartmentId) {
      if (event) event.target.complete();
      return;
    }

    this.loading = true;

    // Gọi API listAllSchedules
    this.workSchedulesService.listAllSchedules(
      this.clinicId,
      this.selectedDepartmentId,
      this.page,
      this.size
    ).subscribe({
      next: (res) => {
        const newData = res.result?.content || [];
        this.groupDataByDate(newData);

        // Check phân trang
        if (newData.length < this.size) {
          this.hasMoreData = false;
        } else {
          this.page++;
        }

        this.loading = false;
        if (event) event.target.complete();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  private groupDataByDate(schedules: any[]) {
    schedules.forEach(item => {
      const dateKey = item.date; // backend trả về yyyy-MM-dd
      let group = this.scheduleGroups.find(g => g.date === dateKey);
      if (group) {
        group.schedules.push(item);
      } else {
        this.scheduleGroups.push({ date: dateKey, schedules: [item] });
      }
    });
    // Sort
    this.scheduleGroups.sort((a, b) => a.date.localeCompare(b.date));
  }

  onEditClick() {
    this.editRequested.emit();
  }
}
