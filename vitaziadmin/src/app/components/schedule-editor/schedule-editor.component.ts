import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonDatetime, IonButton
} from '@ionic/angular/standalone';
import { ClinicScheduleService } from '../../services/clinic-schedule.service';
import { Shift } from '../../models/clinic.models';
import { ShiftListComponent } from '../shift-list/shift-list.component';

@Component({
  selector: 'app-schedule-editor',
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonDatetime, IonButton,
    ShiftListComponent,
  ],
  templateUrl: './schedule-editor.component.html',
  styleUrls: ['./schedule-editor.component.scss'],
})
export class ScheduleEditorComponent implements OnInit {

  @Input() departmentId!: string;

  selectedDate = new Date().toISOString().substring(0, 10);
  shifts: Shift[] = [];

  constructor(private clinicSvc: ClinicScheduleService) {}

  ngOnInit() {
    this.loadShifts();
  }

  onDateChange(ev: any) {
    this.selectedDate = ev.detail.value.substring(0, 10);
    this.loadShifts();
  }

  loadShifts() {
    if (!this.departmentId) return;
    this.shifts = this.clinicSvc.getDayShifts(this.selectedDate, this.departmentId);
  }

  onShiftsChange(shifts: Shift[]) {
    this.shifts = shifts;
  }

  save() {
    this.clinicSvc.saveDayShifts(this.selectedDate, this.departmentId, this.shifts);
    // Sau này bạn có thể show toast thông báo
  }
}
