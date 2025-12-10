import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClinicSummary } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicContextService {
  private clinicSubject = new BehaviorSubject<ClinicSummary | null>(null);
  clinic$ = this.clinicSubject.asObservable();

  constructor() {
    this.restoreFromStorage();
  }

  setClinic(c: ClinicSummary | null) {
    this.clinicSubject.next(c);
    if (c) {
      localStorage.setItem('currentClinic', JSON.stringify(c));
    } else {
      localStorage.removeItem('currentClinic');
    }
  }

  private restoreFromStorage() {
    const raw = localStorage.getItem('currentClinic');
    if (!raw) return;
    try {
      const c = JSON.parse(raw) as ClinicSummary;
      this.clinicSubject.next(c);
    } catch {
      localStorage.removeItem('currentClinic');
    }
  }
}
