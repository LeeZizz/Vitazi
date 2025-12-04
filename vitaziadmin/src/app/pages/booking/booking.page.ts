import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

import { ClinicType, Department } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicDepartmentListComponent } from '../../components/clinic-department-list/clinic-department-list.component';
import { ClinicWorkScheduleComponent } from '../../components/clinic-work-schedule/clinic-work-schedule.component';
import { ClinicDepartmentFormComponent } from '../../components/clinic-department-form/clinic-department-form.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    ClinicDepartmentListComponent,
    ClinicWorkScheduleComponent,
    ClinicDepartmentFormComponent
  ],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss']
})
export class BookingPage implements OnInit {

  ngOnInit() {
  }
}
