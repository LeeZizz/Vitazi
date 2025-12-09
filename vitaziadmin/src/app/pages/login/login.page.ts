import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ClinicService } from '../../services/clinic.service';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { AuthService } from '../../services/auth.service';
import {
  ClinicSummary,
  OwnerInformation,
} from '../../models/clinic.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton],
})
export class LoginPage implements OnInit {
  /** Đang kiểm tra xem user đã login + đã có phòng khám chưa */
  checkingSession = true;

  constructor(
    private router: Router,
    private clinicApi: ClinicService,
    private clinicSchedule: ClinicScheduleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.tryAutoSelectClinic();
  }

  /**
   * Nếu user đã login + đã có clinic trong DB:
   *  - Lọc đúng clinic theo oauthEmail/oauthSub
   *  - Set context
   *  - Chuyển thẳng vào tabs
   * Nếu chưa có clinic -> chuyển sang /clinic-type
   * Nếu chưa login -> hiện nút Google/Facebook
   */
  private tryAutoSelectClinic() {
    forkJoin({
      owner: this.clinicApi.getOwnerInformation(),
      clinics: this.clinicApi.getMyClinics(),
    }).subscribe({
      next: ({ owner, clinics }: { owner: OwnerInformation; clinics: ClinicSummary[] }) => {
        this.checkingSession = false;
        console.log('[Login] owner =', owner);
        console.log('[Login] all clinics =', clinics);

        const myClinics = clinics.filter(
          (c) =>
            (c.oauthEmail === owner.ownerEmail) ||
            (c.oauthSub && c.oauthSub === owner.ownerSub)
        );

        if (myClinics.length) {
          const clinic = myClinics[0];
          console.log('[Login] matched clinic =', clinic);

          this.clinicSchedule.setClinicContext(clinic as any);

          if (clinic.clinicType === 'GENERAL') {
            this.router.navigateByUrl('/tabs/profile', { replaceUrl: true });
          } else {
            this.router.navigateByUrl('/tabs/booking', { replaceUrl: true });
          }
        } else {
          // User đã login nhưng chưa có clinic -> vào trang chọn loại phòng khám
          this.router.navigateByUrl('/clinic-type', { replaceUrl: true });
        }
      },
      error: (err) => {
        // 401/403: chưa login -> hiện nút login
        this.checkingSession = false;
        console.error('[Login] tryAutoSelectClinic error', err);
      },
    });
  }

  loginWithGoogle() {
    this.authService.loginWithProvider('google');
  }

  loginWithFacebook() {
    this.authService.loginWithProvider('facebook');
  }
}
