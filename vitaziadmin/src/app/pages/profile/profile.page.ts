import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ToastController
} from '@ionic/angular';
import { IonContent } from '@ionic/angular/standalone';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicType, Department } from '../../models/clinic.models';
import { ClinicDepartmentListComponent } from '../../components/clinic-department-list/clinic-department-list.component';
import { ClinicDepartmentFormComponent } from '../../components/clinic-department-form/clinic-department-form.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    ClinicDepartmentListComponent,
    ClinicDepartmentFormComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
   @ViewChild(ClinicDepartmentListComponent)
   deptList?: ClinicDepartmentListComponent;

  mode: ClinicType | null = null;
  clinicId: string | null = null;
  clinicName: string | null = null;

  showDeptForm = false;
  editingDept: Department | null = null; // null = tạo mới

   constructor(
     private clinicSchedule: ClinicScheduleService,
     private toastCtrl: ToastController
   ) {}

  ngOnInit() {
    this.mode = this.clinicSchedule.currentMode;
    this.clinicId = this.clinicSchedule.currentClinicId;
    this.clinicName = this.clinicSchedule.currentClinicName;
   }

  // ===== EVENT từ LIST =====

  // bấm dấu +
  onCreateDepartment() {
    console.log('Profile: onCreateDepartment');
    this.editingDept = null;
    this.showDeptForm = true;
  }

  // bấm "Chỉnh sửa" trên 1 khoa
  onEditDepartment(dept: Department) {
    this.editingDept = dept;
    this.showDeptForm = true;
  }

  // ===== EVENT từ FORM =====

  async onDeptFormSaved() {
    this.showDeptForm = false;
    this.editingDept = null;

    this.deptList?.reload();

    const t = await this.toastCtrl.create({
      message: 'Đã lưu khoa bệnh',
      duration: 1200,
      color: 'success',
    });
    await t.present();
  }

  onDeptFormCancelled() {
    this.showDeptForm = false;
    this.editingDept = null;
  }
}
