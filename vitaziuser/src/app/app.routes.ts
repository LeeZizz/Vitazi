import { Routes } from '@angular/router';
import { BookingFormComponent } from './component/booking-form/booking-form';

export const routes: Routes = [
  {
    path: 'booking/:clinicId',
    component: BookingFormComponent
  },
];
