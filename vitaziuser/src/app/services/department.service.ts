import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  startTime?: string; // "08:00 AM"
  endTime?: string;   // "16:30 PM"
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private baseUrl = 'https://api.your-domain.com'; // sửa theo backend

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/api/departments`);
  }
}
