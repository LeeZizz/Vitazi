import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ClinicMode, DaySchedule, Department, Shift } from '../models/clinic.models';

@Injectable({ providedIn: 'root' })
export class ClinicScheduleService {

  // Loại hình phòng khám: chuyên khoa / đa khoa
  private modeSubject = new BehaviorSubject<ClinicMode | null>(null);
  mode$ = this.modeSubject.asObservable();
  get currentMode() { return this.modeSubject.value; }

  // Danh sách khoa
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  departments$ = this.departmentsSubject.asObservable();
  get departments() { return this.departmentsSubject.value; }

  // Lịch làm việc
  private schedulesSubject = new BehaviorSubject<DaySchedule[]>([]);
  schedules$ = this.schedulesSubject.asObservable();

  setMode(mode: ClinicMode) {
    this.modeSubject.next(mode);
  }

  addDepartment(name: string) {
    const dept: Department = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name,
    };
    this.departmentsSubject.next([...this.departments, dept]);
  }

  getDayShifts(date: string, departmentId: string): Shift[] {
    const d = this.schedulesSubject.value
      .find(s => s.date === date && s.departmentId === departmentId);
    return d ? d.shifts : [];
  }

  saveDayShifts(date: string, departmentId: string, shifts: Shift[]) {
    const list = [...this.schedulesSubject.value];
    const idx = list.findIndex(s => s.date === date && s.departmentId === departmentId);

    if (idx >= 0) {
      list[idx] = { ...list[idx], shifts };
    } else {
      list.push({ date, departmentId, shifts });
    }

    this.schedulesSubject.next(list);
  }
}
