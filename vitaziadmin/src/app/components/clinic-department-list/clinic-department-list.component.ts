import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { add, close } from 'ionicons/icons';

import { Department } from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';

@Component({
  selector: 'app-clinic-department-list',
  standalone: true,
  imports: [CommonModule, IonIcon, IonSpinner],
  templateUrl: './clinic-department-list.component.html',
  styleUrls: ['./clinic-department-list.component.scss'],
})
export class ClinicDepartmentListComponent implements OnInit {
  @Input() clinicId!: string;
  @Input() showHeader = true;

  @Output() createRequested = new EventEmitter<void>();
  @Output() editRequested = new EventEmitter<Department>();
  @Output() deleted = new EventEmitter<Department>();

  departments: Department[] = [];
  loading = false;

  addIcon = add;
  closeIcon = close;

  constructor(
    private departmentsService: DepartmentsService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    if (this.clinicId) {
      this.loadDepartments();
    }
  }

  reload() {
    if (this.clinicId) {
      this.loadDepartments();
    }
  }

  private loadDepartments() {
    this.loading = true;
    this.departmentsService.getByClinic(this.clinicId).subscribe({
      next: (depts) => {
        this.departments = depts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  // nút +
  onCreateClick() {
    console.log('List: onCreateClick');
    this.createRequested.emit();
  }

  // nút "Chỉnh sửa"
  onEditClick(dept: Department) {
    this.editRequested.emit(dept);
  }

  async onDeleteClick(dept: Department) {
    const alert = await this.alertCtrl.create({
      header: 'Xóa Khoa bệnh',
      message:
        'Bạn có chắc chắn muốn xóa khoa bệnh này? Hành động này không thể hoàn tác.',
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        {
          text: 'Xác nhận',
          role: 'destructive',
          handler: () => this.deleteDepartment(dept),
        },
      ],
    });

    await alert.present();
  }

  private deleteDepartment(dept: Department) {
    this.departmentsService.delete(dept.id).subscribe(() => {
      this.departments = this.departments.filter((d) => d.id !== dept.id);
      this.deleted.emit(dept);
    });
  }
}
