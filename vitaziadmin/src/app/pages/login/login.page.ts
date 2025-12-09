import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { ClinicService } from '../../services/clinic.service';
import { ClinicContextService } from '../../services/clinic-context.service';
import { ClinicSummary } from '../../models/clinic.models';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, CommonModule, FormsModule, IonButton],
})
export class LoginPage implements OnInit {
  checkingSession = true;

  constructor(
    private router: Router,
    private clinicService: ClinicService,
    private clinicCtx: ClinicContextService
  ) {}

  ngOnInit() {
    this.clinicService.getMyClinics().subscribe({
      next: (clinics) => {
        this.checkingSession = false;

        if (!clinics.length) {
          // chưa có clinic -> cho user chọn tạo GENERAL / SPECIALIZED
          return;
        }

        const current = clinics[0];  // hoặc cho user chọn nếu > 1
        this.clinicCtx.setClinic(current);
        this.router.navigateByUrl('/tabs/booking', { replaceUrl: true });
      },
      error: (err) => {
        this.checkingSession = false;
        // 401/403 => chưa login -> show nút Google
      }
    });
  }

  private checkExistingSession() {
    this.clinicService.getMyClinics().subscribe({
      next: (clinics: ClinicSummary[]) => {
        this.checkingSession = false;
        console.log('[LoginPage] getMyClinics =', clinics);

        if (!clinics.length) {
          return; // chưa có phòng khám -> giữ màn login
        }

        const current = clinics[0];
        this.clinicCtx.setClinic(current);
        this.router.navigateByUrl('/tabs/booking', { replaceUrl: true });
      },
      error: (err: any) => {              // <== thêm kiểu any cho err
        this.checkingSession = false;
        if (err.status !== 401 && err.status !== 403) {
          console.error('[LoginPage] checkExistingSession error', err);
        }
      },
    });
  }

  loginWithGoogle() {
    window.location.href =
      'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithFacebook() {
    window.location.href =
      'http://localhost:8080/oauth2/authorization/facebook';
  }
}
