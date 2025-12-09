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
import { forkJoin } from 'rxjs';

import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { ClinicService } from '../../services/clinic.service';
import {
  ClinicSummary,
  OwnerInformation,
} from '../../models/clinic.models';

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
    this.resolveClinicForCurrentUser();
  }

  /**
   * Nếu user đã có clinic trong DB:
   *  - Lọc đúng clinic theo oauthEmail/oauthSub
   *  - Set context
   *  - Điều hướng thẳng vào tabs
   * Nếu chưa có -> hiển thị UI chọn loại phòng khám để tạo mới
   */
  private resolveClinicForCurrentUser() {
    forkJoin({
      owner: this.clinicApi.getOwnerInformation(),
      clinics: this.clinicApi.getMyClinics(),
    }).subscribe({
      next: ({ owner, clinics }: { owner: OwnerInformation; clinics: ClinicSummary[] }) => {
        this.loading = false;
        console.log('[ClinicType] owner =', owner);
        console.log('[ClinicType] all clinics =', clinics);

        const myClinics = clinics.filter(
          (c) =>
            (c.oauthEmail === owner.ownerEmail) ||
            (c.oauthSub && c.oauthSub === owner.ownerSub)
        );

        if (myClinics.length) {
          const clinic = myClinics[0];
          console.log('[ClinicType] matched clinic =', clinic);

          this.clinicSchedule.setClinicContext(clinic as any);

          if (clinic.clinicType === 'GENERAL') {
            this.navCtrl.navigateRoot('/tabs/profile');
          } else {
            this.navCtrl.navigateRoot('/tabs/booking');
          }
          return;
        }

        // Không có clinic thuộc user này -> cho chọn loại phòng khám
        const mode = this.clinicSchedule.currentMode;
        if (mode === 'GENERAL') this.selectedType = 'general';
        if (mode === 'SPECIALTY') this.selectedType = 'specialized';
      },
      error: async (err) => {
        this.loading = false;
        console.error('[ClinicType] resolveClinicForCurrentUser error', err);
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
      // ĐA KHOA
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
          this.clinicSchedule.setClinicContext(clinic); // currentMode = 'SPECIALTY'
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
