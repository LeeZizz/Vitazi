import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonItem,
  IonRadioGroup,
  IonRadio,
} from '@ionic/angular/standalone';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicService } from '../../services/clinic.service';
import { ClinicSummary } from '../../models/clinic.models';

@Component({
  selector: 'app-clinic-type',
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonItem,
    IonRadioGroup,
    IonRadio,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './clinic-type.page.html',
  styleUrls: ['./clinic-type.page.scss'],
})
export class ClinicTypePage implements OnInit {
  selectedType: 'general' | 'specialized' | null = null;
  loading = true;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private clinicSchedule: ClinicScheduleService,
    private clinicApi: ClinicService
  ) {}

  ngOnInit() {
    this.checkExistingClinic();
  }

  /** Check xem tài khoản hiện tại đã có phòng khám trong DB chưa */
  private checkExistingClinic() {
    this.clinicApi.checkClinicExists().subscribe({
      next: (exists: boolean) => {
        if (exists) {
          // Đã có clinic -> lấy danh sách clinic của user này
          this.clinicApi.getMyClinics().subscribe({
            next: (clinics: ClinicSummary[]) => {
              this.loading = false;
              console.log('[ClinicTypePage] getMyClinics =', clinics);

              if (!clinics || !clinics.length) {
                // BE báo exists=true nhưng list rỗng -> fallback cho user tự tạo
                return;
              }

              const clinic = clinics[0]; // tạm lấy clinic đầu tiên
              // set context cho toàn app (clinicId + mode)
              this.clinicSchedule.setClinicContext(clinic as any);

              if (clinic.clinicType === 'GENERAL') {
                // Đa khoa -> vào tab hồ sơ phòng khám
                this.navCtrl.navigateRoot('/tabs/profile');
              } else {
                // Chuyên khoa -> vào tab lịch làm việc
                this.navCtrl.navigateRoot('/tabs/booking');
              }
            },
            error: async (err) => {
              this.loading = false;
              console.error('[ClinicTypePage] getMyClinics error', err);
              const t = await this.toastCtrl.create({
                message: 'Không tải được thông tin phòng khám.',
                duration: 1500,
                color: 'danger',
              });
              await t.present();
            },
          });
        } else {
          // Chưa có clinic -> cho user chọn loại rồi tạo
          this.loading = false;

          const mode = this.clinicSchedule.currentMode;
          if (mode === 'GENERAL') this.selectedType = 'general';
          if (mode === 'SPECIALTY') this.selectedType = 'specialized';
        }
      },
      error: async (err) => {
        this.loading = false;
        console.error('[ClinicTypePage] checkClinicExists error', err);
        const t = await this.toastCtrl.create({
          message: 'Không kiểm tra được trạng thái phòng khám.',
          duration: 1500,
          color: 'danger',
        });
        await t.present();
      },
    });
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
        next: (clinic) => {
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
        },
      });
    } else {
      // CHUYÊN KHOA
      this.clinicApi.createSpecializedClinic().subscribe({
        next: (clinic) => {
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
        },
      });
    }
  }
}
