// This is login page which has 2 buttons login as admin and login as user
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private router: Router) {}

  loginAsAdmin() {
    console.log('Admin login clicked');
    // Navigate to the EditComponent (or the desired route)
    // this.router.navigate(['/map']); // Replace 1 with the desired ID or parameter
    this.router.navigate(['way/admin']);
  }

  loginAsUser() {
    console.log('User login clicked');
    // Navigate to a user-specific page or login route if needed
    this.router.navigate(['/way/user']); // Or navigate to the user-specific page
  }
}
