import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

import { Department } from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';

@Component({
  selector: 'app-clinic-department-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // <--- Bắt buộc phải có dòng này để fix lỗi NG8002
    IonButton,
    IonSpinner,
    IonIcon
  ],
  templateUrl: './clinic-department-form.component.html',
  styleUrls: ['./clinic-department-form.component.scss'],
})
export class ClinicDepartmentFormComponent implements OnChanges {
  @Input() clinicId!: string;
  @Input() department: Department | null = null; // null = tạo mới

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  name = '';
  description = '';
  submitting = false;

  constructor(
    private deptService: DepartmentsService,
    private toastCtrl: ToastController
  ) {
    // Đăng ký icon 'close' để dùng trong HTML <ion-icon name="close">
    addIcons({ close });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['department']) {
      if (this.department) {
        this.name = this.department.departmentName;
        this.description = this.department.description || '';
      } else {
        this.name = '';
        this.description = '';
      }
    }
  }

  async onSubmit() {
    if (!this.name.trim()) {
      const t = await this.toastCtrl.create({
        message: 'Department name is required',
        duration: 1500,
        color: 'warning',
        position: 'top'
      });
      await t.present();
      return;
    }

    this.submitting = true;
    const payload = {
      clinicId: this.clinicId,
      departmentName: this.name.trim(),
      description: this.description.trim(),
    };

    const request$ = this.department
      ? this.deptService.update(this.department.id, payload)
      : this.deptService.create(payload);

    request$.subscribe({
      next: async () => {
        this.submitting = false;
        const t = await this.toastCtrl.create({
          message: this.department
            ? 'Department updated successfully'
            : 'Department created successfully',
          duration: 1500,
          color: 'success',
          position: 'top'
        });
        await t.present();
        this.saved.emit();
      },
      error: async (err) => {
        console.error(err);
        this.submitting = false;
        const t = await this.toastCtrl.create({
          message: 'Failed to save department',
          duration: 1500,
          color: 'danger',
          position: 'top'
        });
        await t.present();
      },
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
