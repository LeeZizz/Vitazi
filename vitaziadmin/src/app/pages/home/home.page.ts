import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular/standalone';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicType, Department } from '../../models/clinic.models';
import { ClinicDepartmentListComponent } from '../../components/clinic-department-list/clinic-department-list.component';
import { ClinicDepartmentFormComponent } from '../../components/clinic-department-form/clinic-department-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    ClinicDepartmentListComponent,
    ClinicDepartmentFormComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  ngOnInit() {
  }


}
