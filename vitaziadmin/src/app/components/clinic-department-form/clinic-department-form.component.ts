import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Department } from '../../models/clinic.models';
import { DepartmentsService } from '../../services/departments.service';

@Component({
  selector: 'app-clinic-department-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinic-department-form.component.html',
  styleUrls: ['./clinic-department-form.component.scss']
})
export class ClinicDepartmentFormComponent implements OnInit {
  /** Bắt buộc */
  @Input() clinicId!: string;

  /** Nếu có -> chế độ edit, nếu null -> chế độ tạo mới */
  @Input() departmentId: string | null = null;

  /** Emit khi lưu thành công */
  @Output() saved = new EventEmitter<Department>();

  /** Emit khi bấm Hủy (nếu muốn) */
  @Output() cancelled = new EventEmitter<void>();

  model: Partial<Department> = {
    name: '',
    description: ''
  };

  isEditing = false;
  loading = false;

  constructor(private departmentsService: DepartmentsService) {}

  ngOnInit() {
    if (this.departmentId) {
      this.isEditing = true;
      this.loadDepartment();
    }
  }

  private loadDepartment() {
    this.loading = true;
    this.departmentsService.getById(this.departmentId!).subscribe({
      next: (dept) => {
        this.model = {
          name: dept.name,
          description: dept.description
        };
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onSave() {
    if (!this.model.name) return;

    this.loading = true;

    if (this.isEditing && this.departmentId) {
      this.departmentsService
        .update(this.departmentId, this.model)
        .subscribe({
          next: (dept) => {
            this.loading = false;
            this.saved.emit(dept);
          },
          error: () => (this.loading = false)
        });
    } else {
      this.departmentsService
        .create(this.clinicId, this.model)
        .subscribe({
          next: (dept) => {
            this.loading = false;
            this.saved.emit(dept);
          },
          error: () => (this.loading = false)
        });
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}
