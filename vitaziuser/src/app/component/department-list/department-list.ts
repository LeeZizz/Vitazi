import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DepartmentService, Department } from '../../services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './department-list.html',
  styleUrls: ['./department-list.css'],
})
export class DepartmentListComponent implements OnInit {

  departments: Department[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.departmentService.getDepartments().subscribe({
      next: (deps: Department[]) => {
        this.departments = deps;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Không tải được danh sách khoa, vui lòng thử lại.';
        this.isLoading = false;
      }
    });
  }

  goToBooking(dept: Department): void {
    // => /booking/ID_KHOA
    this.router.navigate(['/booking', dept.id]);
  }
}
