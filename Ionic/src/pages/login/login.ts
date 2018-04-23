import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, NavController, ToastController } from 'ionic-angular';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../../providers/providers';
//import { AuthService } from '../../providers/providers';
import { MainPage } from '../pages';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { email: string, password: string } = {
    email: 'test@example.com',
    password: 'test'
  };

  // Our translated text strings
  private loginErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    })
  }

  // Attempt to login in through our User service
  doLogin() {
    
    alert(this.account.password);
    this.user.login(this.account).subscribe((resp) => {
      console.log(resp);
      const decodedUser = this.decodeUserFromToken(resp.token);
      this.setCurrentUser(decodedUser);
      console.log(this.user.username);
      localStorage.setItem('uName', this.user.username);
      this.navCtrl.push(MainPage);
    }, (err) => {
      this.navCtrl.push(MainPage);
      // Unable to log in
      let toast = this.toastCtrl.create({
        message: this.loginErrorString,
        duration: 3000,
        position: 'top'
      });
      toast.present();
    });
  }
  decodeUserFromToken(token) {
    let jwtHelper = new JwtHelperService();
    return jwtHelper.decodeToken(token).user;
  }
  setCurrentUser(decodedUser) {
    this.user.loggedIn = true;
    this.user._id = decodedUser._id;
    this.user.username = decodedUser.username;
    this.user.role = decodedUser.role;
    decodedUser.role === 'admin' ? this.user.isAdmin = true : this.user.isAdmin = false;
    delete decodedUser.role;
  }
}
