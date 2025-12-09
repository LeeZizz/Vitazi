import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  camera,
  person,
  mail,
  logOutOutline,
  add,
  createOutline,
  trashOutline,
  close
} from 'ionicons/icons';

import {
  ClinicType,
  OwnerInformation,
  ClinicSummary,
  Department
} from '../../models/clinic.models';
import { ClinicService } from '../../services/clinic.service';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { AuthService } from '../../services/auth.service';

import { ClinicDepartmentListComponent } from '../../components/clinic-department-list/clinic-department-list.component';
import { ClinicDepartmentFormComponent } from '../../components/clinic-department-form/clinic-department-form.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonSpinner,
    ClinicDepartmentListComponent,
    ClinicDepartmentFormComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild(ClinicDepartmentListComponent)
  deptList?: ClinicDepartmentListComponent;

  owner: OwnerInformation | null = null;

  clinicId: string | null = null;
  clinicName = '';
  clinicType: ClinicType = 'SPECIALTY';

  // state cho form khoa
  showDeptForm = false;
  editingDept: Department | null = null;

  constructor(
    private clinicApi: ClinicService,
    private clinicCtx: ClinicScheduleService,
    private authService: AuthService,
  ) {
    addIcons({
      camera,
      person,
      mail,
      logOutOutline,
      add,
      createOutline,
      trashOutline,
      close
    });
  }

  ngOnInit() {
    // 1) Lấy clinicId + mode từ ClinicScheduleService
    this.clinicId = this.clinicCtx.currentClinicId;
    const mode = this.clinicCtx.currentMode;
    this.clinicType = mode ?? 'SPECIALTY';

    // 2) Lấy tên phòng khám từ getMyClinics() (lọc theo clinicId)
    if (this.clinicId) {
      this.clinicApi.getMyClinics().subscribe({
        next: (clinics: ClinicSummary[]) => {
          const found = clinics.find(c => c.id === this.clinicId);
          if (found) {
            this.clinicName = found.clinicName;
            this.clinicType = found.clinicType; // cập nhật lại cho chắc
          }
        },
        error: (err) => {
          console.error('[Profile] getMyClinics error', err);
        }
      });
    }

    // 3) Lấy thông tin chủ phòng khám
    this.clinicApi.getOwnerInformation().subscribe({
      next: (owner) => (this.owner = owner),
      error: (err) =>
        console.error('[Profile] getOwnerInformation error', err),
    });
  }

  // ====== QUẢN LÝ KHOA (chỉ dùng khi clinicType = GENERAL) ======

  onCreateDepartment() {
    if (!this.clinicId) return;
    this.editingDept = null;
    this.showDeptForm = true;
  }

  onEditDepartment(dept: Department) {
    if (!this.clinicId) return;
    this.editingDept = dept;
    this.showDeptForm = true;
  }

  onDepartmentSaved() {
    this.showDeptForm = false;
    this.editingDept = null;
    // Reload list khoa
    this.deptList?.reload();
  }

  onDepartmentCancelled() {
    this.showDeptForm = false;
    this.editingDept = null;
  }

  logout() {
    this.authService.logout();
  }
}
