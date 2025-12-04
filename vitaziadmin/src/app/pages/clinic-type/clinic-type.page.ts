import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonItem, IonRadioGroup, IonRadio } from '@ionic/angular/standalone';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicService } from '../../services/clinic.service';

@Component({
  selector: 'app-clinic-type',
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonRadioGroup, IonRadio, CommonModule, FormsModule],
  templateUrl: './clinic-type.page.html',
  styleUrls: ['./clinic-type.page.scss'],
})
export class ClinicTypePage implements OnInit {
  selectedType: 'general' | 'specialized' | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private clinicSchedule: ClinicScheduleService,
    private clinicApi: ClinicService
  ) {}

  ngOnInit() {
    const mode = this.clinicSchedule.currentMode;
    if (mode === 'GENERAL') this.selectedType = 'general';
    if (mode === 'SPECIALTY') this.selectedType = 'specialized';
  }

  goBack() {
    this.navCtrl.back();
  }

  onSelect(type: 'general' | 'specialized') {
    this.selectedType = type;
  }

  async onSubmit() {
    if (!this.selectedType) {
      const t = await this.toastCtrl.create({
        message: 'Vui lòng chọn loại phòng khám trước khi tiếp tục.',
        duration: 1500,
        color: 'warning',
      });
      await t.present();
      return;
    }

    if (this.selectedType === 'general') {
      // ĐA KHOA -> tạo clinic xong vào tab PROFILE
      this.clinicApi.createGeneralClinic().subscribe({
        next: clinic => {
          this.clinicSchedule.setClinicContext(clinic);
          this.navCtrl.navigateRoot('/tabs/profile');
        },
        error: async () => {
          const t = await this.toastCtrl.create({
            message: 'Tạo phòng khám đa khoa thất bại.',
            duration: 1500,
            color: 'danger',
          });
          await t.present();
        }
      });
    } else {
      // CHUYÊN KHOA
      this.clinicApi.createSpecializedClinic().subscribe({
        next: clinic => {
          this.clinicSchedule.setClinicContext(clinic); // set currentMode = 'SPECIALTY'
          this.navCtrl.navigateRoot('/tabs/booking');
        },
        error: async () => {
          const t = await this.toastCtrl.create({
            message: 'Tạo phòng khám chuyên khoa thất bại.',
            duration: 1500,
            color: 'danger',
          });
          await t.present();
        }
      });
    }
  }
}
