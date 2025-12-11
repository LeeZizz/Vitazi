import { Component, OnInit } from '@angular/core';
import { IonContent, IonToast } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

import { ClinicType } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicWorkScheduleComponent } from '../../components/clinic-work-schedule/clinic-work-schedule.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [IonContent, IonToast, CommonModule, ClinicWorkScheduleComponent],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss']
})
export class BookingPage implements OnInit {
  clinicId: string | null = null;
  mode: ClinicType = 'SPECIALTY';

  // state cho toast
  toastOpen = false;
  toastMessage = '';

  constructor(private clinicSchedule: ClinicScheduleService) { }

  ngOnInit() {
    this.clinicId = this.clinicSchedule.currentClinicId;
    this.mode = this.clinicSchedule.currentMode ?? 'SPECIALTY';
  }

  onSaved() {
    this.toastMessage = 'Lưu ca làm việc thành công';
    this.toastOpen = true;
  }
}
