import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingFormComponent } from './component/booking-form/booking-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BookingFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-app');
}
