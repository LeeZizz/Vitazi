// src/app/pages/booking/booking.page.ts
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

import { ClinicType, Department } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicDepartmentListComponent } from '../../components/clinic-department-list/clinic-department-list.component';
import { ClinicWorkScheduleComponent } from '../../components/clinic-work-schedule/clinic-work-schedule.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ClinicDepartmentListComponent,
    ClinicWorkScheduleComponent
  ],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss']
})
export class BookingPage implements OnInit {
  mode: ClinicType | null = null;
  clinicId: string | null = null;
  clinicName: string | null = null;

  selectedDepartmentId: string | null = null;

  constructor(private clinicSvc: ClinicScheduleService) {}

  ngOnInit() {
    this.mode = this.clinicSvc.currentMode;
    this.clinicId = this.clinicSvc.currentClinicId;
    this.clinicName = this.clinicSvc.currentClinicName;
  }

  onEditDepartment(dept: Department) {
    this.selectedDepartmentId = dept.id;
  }

  onScheduleSaved() {
    // TODO: show toast nếu muốn
    console.log('Schedule saved');
  }
}
