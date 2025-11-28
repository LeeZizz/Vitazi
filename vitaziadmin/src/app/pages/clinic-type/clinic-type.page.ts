import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClinicMode } from '../../models/clinic.models';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';

@Component({
  selector: 'app-clinic-type',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './clinic-type.page.html',
  styleUrls: ['./clinic-type.page.scss'],
})
export class ClinicTypePage implements OnInit {

  // UI: 2 lựa chọn, map sang ClinicMode
  selectedType: 'specialized' | 'general' | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private clinicSvc: ClinicScheduleService,
  ) {}

  ngOnInit() {
    // Nếu trước đó đã chọn loại phòng khám thì set lại
    const mode = this.clinicSvc.currentMode;
    if (mode === ClinicMode.SPECIALTY) this.selectedType = 'specialized';
    if (mode === ClinicMode.GENERAL)   this.selectedType = 'general';
  }

  goBack() {
    this.navCtrl.back();
  }

  onSelect(type: 'specialized' | 'general') {
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

    // Map UI -> enum ClinicMode
    const mode: ClinicMode =
      this.selectedType === 'specialized'
        ? ClinicMode.SPECIALTY
        : ClinicMode.GENERAL;

    // Lưu vào service (service tự lưu vào localStorage)
    this.clinicSvc.setMode(mode);

    // Chuyển sang tab booking / lịch làm việc
    this.navCtrl.navigateRoot('/tabs/booking');
  }
}
