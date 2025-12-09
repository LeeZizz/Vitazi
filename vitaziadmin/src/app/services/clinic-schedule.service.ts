import { Injectable } from '@angular/core';
import { ClinicProfile, ClinicType } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicScheduleService {
  private readonly MODE_KEY = 'clinic_mode';
  private readonly CLINIC_ID_KEY = 'clinic_id';
  private readonly CLINIC_NAME_KEY = 'clinic_name';

  currentMode: ClinicType | null = null;
  currentClinicId: string | null = null;
  currentClinicName: string | null = null;

  constructor() {
    const rawMode = localStorage.getItem(this.MODE_KEY) as ClinicType | null;
    if (rawMode === 'GENERAL' || rawMode === 'SPECIALTY') {
      this.currentMode = rawMode;
    }

    this.currentClinicId = localStorage.getItem(this.CLINIC_ID_KEY);
    this.currentClinicName = localStorage.getItem(this.CLINIC_NAME_KEY);
  }

  /** Set mode trực tiếp */
  setMode(mode: ClinicType) {
    this.currentMode = mode;
    localStorage.setItem(this.MODE_KEY, mode);
  }

  /** Sau khi tạo/đọc clinic từ backend, gọi hàm này để set context */
  setClinicContext(clinic: ClinicProfile) {
    const mode = this.mapRawClinicType(clinic.clinicType);
    this.currentMode = mode;
    this.currentClinicId = clinic.id;
    this.currentClinicName = clinic.clinicName;

    localStorage.setItem(this.MODE_KEY, mode);
    localStorage.setItem(this.CLINIC_ID_KEY, clinic.id);
    localStorage.setItem(this.CLINIC_NAME_KEY, clinic.clinicName);
  }

  /** Map string từ backend về 2 mode FE */
  private mapRawClinicType(raw: string): ClinicType {
    if (raw === 'GENERAL' || raw === 'DA_KHOA') return 'GENERAL';
    if (raw === 'SPECIALTY' || raw === 'SPECIALIZED' || raw === 'CHUYEN_KHOA') {
      return 'SPECIALTY';
    }
    return 'GENERAL';
  }

  clear() {
    this.currentMode = null;
    this.currentClinicId = null;
    this.currentClinicName = null;

    localStorage.removeItem(this.MODE_KEY);
    localStorage.removeItem(this.CLINIC_ID_KEY);
    localStorage.removeItem(this.CLINIC_NAME_KEY);

    }

}
