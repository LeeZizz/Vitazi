import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonButton, IonItem, IonLabel, IonDatetime, IonList,
  IonRadioGroup, IonRadio, IonNote, IonIcon, ModalController,
  IonSpinner, IonFooter
} from '@ionic/angular/standalone';
import { WorkSchedulesService } from '../../services/work-schedules.service';
import { AppointmentResponse } from '../../models/clinic.models';
import { addIcons } from 'ionicons';
import { checkmarkCircle, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-appointment-edit-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonButton, IonItem, IonLabel, IonDatetime, IonList,
    IonRadioGroup, IonRadio, IonNote, IonIcon, IonSpinner, IonFooter
  ],
  templateUrl: './appointment-edit-modal.component.html',
  styleUrls: ['./appointment-edit-modal.component.scss']
})
export class AppointmentEditModalComponent implements OnInit {
  @Input() appointment!: AppointmentResponse;

  selectedDate: string = '';
  selectedScheduleId: string = '';
  schedules: any[] = [];
  loading = false;

  minDate: string = '';

  constructor(
    private modalCtrl: ModalController,
    private workScheduleService: WorkSchedulesService
  ) {
    addIcons({
          checkmarkCircle,
          arrowBack
        });
    }

  ngOnInit() {
    // 1. Thiết lập ngày tối thiểu là hôm nay (YYYY-MM-DD)
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // 2. Lấy ngày hiện tại của lịch hẹn
    this.selectedDate = this.appointment.appointmentDate;
    this.selectedScheduleId = this.appointment.scheduleId || '';

    // 3. Load lịch
    this.loadSchedules(this.selectedDate);
  }

  onDateChange(ev: any) {
    const newDate = ev.detail.value;
    if (newDate) {
      if (typeof newDate === 'string') {
         this.selectedDate = newDate.split('T')[0];
      } else {
         this.selectedDate = newDate[0].split('T')[0];
      }

      this.selectedScheduleId = '';
      this.loadSchedules(this.selectedDate);
    }
  }

  loadSchedules(date: string) {
    this.loading = true;
    this.schedules = [];

    this.workScheduleService.listAllSchedules(
      this.appointment.clinicId,
      this.appointment.departmentId,
      0,
      50
    ).subscribe({
      next: (res) => {
        const allItems = res.result?.content || [];
        this.schedules = allItems.filter((s: any) => s.date === date);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  formatTime(t: string) {
    return t ? t.substring(0, 5) : '';
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    this.modalCtrl.dismiss({
      date: this.selectedDate,
      scheduleId: this.selectedScheduleId
    }, 'confirm');
  }
}
