import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton, IonIcon]
})
export class LoginPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  loginWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithFacebook() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  }
}
