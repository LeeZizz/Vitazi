import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonList, IonItem, IonLabel, IonInput,
  IonButton, IonIcon
} from '@ionic/angular/standalone';
import { Shift } from '../../models/clinic.models';

@Component({
  selector: 'app-shift-list',
  standalone: true,
  imports: [CommonModule, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon],
  templateUrl: './shift-list.component.html',
  styleUrls: ['./shift-list.component.scss'],
})
export class ShiftListComponent {
  @Input() shifts: Shift[] = [];
  @Output() shiftsChange = new EventEmitter<Shift[]>();

  addShift() {
    const s: Shift = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      startTime: '08:00',
      endTime: '09:00',
    };
    this.shifts = [...this.shifts, s];
    this.shiftsChange.emit(this.shifts);
  }

  updateShift(shift: Shift, field: 'startTime' | 'endTime', value: string) {
    this.shifts = this.shifts.map(s =>
      s.id === shift.id ? { ...s, [field]: value } : s
    );
    this.shiftsChange.emit(this.shifts);
  }

  removeShift(shift: Shift) {
    this.shifts = this.shifts.filter(s => s.id !== shift.id);
    this.shiftsChange.emit(this.shifts);
  }
}
