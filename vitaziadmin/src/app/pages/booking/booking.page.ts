import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicMode, Department } from '../../models/clinic.models';

import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonText
} from '@ionic/angular/standalone';

import { ScheduleEditorComponent } from '../../components/schedule-editor/schedule-editor.component';
import { Subscription } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonText,
    CommonModule, NgIf,
    ScheduleEditorComponent,
  ]
})
export class BookingPage implements OnInit, OnDestroy {

  mode: ClinicMode | null = null;
  departments: Department[] = [];
  selectedDepartmentId?: string;

  private sub = new Subscription();

  constructor(
    private clinicSvc: ClinicScheduleService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    // lấy mode đã chọn ở clinic-type
    this.sub.add(
      this.clinicSvc.mode$.subscribe(m => {
        this.mode = m;

        // nếu user chưa chọn loại hình => quay lại màn clinic-type
        if (!m) {
          this.navCtrl.navigateRoot('/clinic-type');
          return;
        }

        // nếu là chuyên khoa mà chưa có khoa nào -> tạo 1 khoa mặc định
        if (m === 'SPECIALTY' && this.clinicSvc.departments.length === 0) {
          this.clinicSvc.addDepartment('Khoa khám');
        }

        this.departments = this.clinicSvc.departments;
        this.selectedDepartmentId = this.departments[0]?.id;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
