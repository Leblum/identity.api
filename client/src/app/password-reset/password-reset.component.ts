import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  public showSuccess: boolean = false;
  public showError: boolean = false;
  public showWarning: boolean = false;
  public password1: string = '';
  public password2: string = '';
  public warningMessage: string;

  constructor() { }

  ngOnInit() {
  }

  saveNewPassword(){
    if(this.password1.length === 0 || this.password2.length === 0){
      this.showWarning = true;
      this.warningMessage = "You must enter a new password in both fields."
      return;
    }
    // Now first we need to compare the 2 passwords.
    if(this.password1 !== this.password2){
      this.showWarning = true;
      this.warningMessage = "The two passwords don't match."
      return;
    }

    // Now first we need to compare the 2 passwords.
    if(this.password1.length < 6){
      this.showWarning = true;
      this.warningMessage = "Password must be 6 characters."
      return;
    }
  }
}
