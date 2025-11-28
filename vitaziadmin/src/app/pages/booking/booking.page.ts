import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ClinicMode } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  ClinicMode = ClinicMode;  // để dùng trong template if needed
  mode: ClinicMode | null = null;

  constructor(private clinicSvc: ClinicScheduleService) {}

  ngOnInit() {
    this.mode = this.clinicSvc.currentMode;
  }
}
