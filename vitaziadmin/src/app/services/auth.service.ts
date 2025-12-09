import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  loginWithProvider(provider: 'google' | 'facebook') {
    // Redirect browser sang endpoint OAuth2 của Spring Security
    window.location.href = `${this.baseUrl}/oauth2/authorization/${provider}`;
  }

  logout() {
      this.http.post(
        `${this.baseUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      ).subscribe({
        next: () => {
          this.clearAuthState();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Logout error', err);
          this.clearAuthState();
          this.router.navigate(['/login']);
        }
      });
  }

  private clearAuthState() {
    localStorage.clear();
  }

}
