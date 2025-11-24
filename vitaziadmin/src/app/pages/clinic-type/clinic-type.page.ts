import { Component, OnInit } from '@angular/core';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicMode } from '../../models/clinic.models';

@Component({
  selector: 'app-clinic-type',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './clinic-type.page.html',
  styleUrls: ['./clinic-type.page.scss'],
})
export class ClinicTypePage implements OnInit {

  // UI dùng 2 string này, sau đó map sang ClinicMode
  selectedType: 'specialized' | 'general' | null = null;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private clinicSvc: ClinicScheduleService,
  ) {}

  ngOnInit() {
    // Nếu trước đó đã chọn rồi thì hiển thị lại
    const mode = this.clinicSvc.currentMode;
    if (mode === 'SPECIALTY') this.selectedType = 'specialized';
    if (mode === 'MULTI') this.selectedType = 'general';
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
      return t.present();
    }

    // Map UI -> ClinicMode dùng trong hệ thống
    const mode: ClinicMode =
      this.selectedType === 'specialized' ? 'SPECIALTY' : 'MULTI';

    // Lưu loại hình để tab Booking dùng
    this.clinicSvc.setMode(mode);

    // Sau khi chọn xong, chuyển sang tab Lịch làm việc
    this.navCtrl.navigateRoot('/tabs/booking');
  }
}
