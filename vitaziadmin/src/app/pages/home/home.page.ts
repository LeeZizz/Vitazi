import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular/standalone';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicType, Department } from '../../models/clinic.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  ngOnInit() {
  }


}
