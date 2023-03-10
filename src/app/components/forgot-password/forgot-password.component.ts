import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/common/Customer';
import { CustomerService } from 'src/app/services/customer.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SendmailService } from 'src/app/services/sendmail.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  postForm:UntypedFormGroup
  user!:Customer
  data!:any
  check:boolean = false;

  constructor(private localStorageService: LocalStorageService, private router:Router, private toastr: ToastrService, 
    private sendMailService: SendmailService, private userService:CustomerService) { 
    this.postForm = new UntypedFormGroup({
      'email': new UntypedFormControl(null, Validators.required),
      'otp': new UntypedFormControl(null, Validators.required),
      'password': new UntypedFormControl(null, [Validators.required, Validators.minLength(6)]),
      'passwordConfirm': new UntypedFormControl(null, [Validators.required, Validators.minLength(6)]),      
    })
  }

  ngOnInit(): void {
    this.checkLogin();
  }

  checkLogin() {
    this.user = this.localStorageService.getUser();
    if (this.user != null) {
      this.router.navigate(['/home-page']);
    }
  }

  checkPasswordConfirm(event:any) {    
    const passwordConfirm = (event.target as HTMLInputElement).value;
    if(this.postForm.value.password != passwordConfirm) {
      this.check = true;
    } else {
      this.check = false;
    }
  }

  checkPassword(event:any) {    
    const passwordConfirm = (event.target as HTMLInputElement).value;
    if(this.postForm.value.passwordConfirm != passwordConfirm) {
      this.check = true;
    } else {
      this.check = false;
    }
  }

  updatePassword() {    
    if(this.postForm.valid) {
      this.data = localStorage.getItem("otp-forgot-password");
      if (this.postForm.value.otp == JSON.parse(this.data)){
        this.userService.getOneByEmail(this.postForm.value.email).subscribe(data=>{
          this.user = data as Customer;
          this.user.status = true
          this.user.password = this.postForm.value.password;
          this.userService.put(this.user.userId, this.user).subscribe(data=>{
            Swal.fire({
              icon: 'success',
              title: '?????i m???t kh???u th??nh c??ng!',
              showConfirmButton: false,
              timer: 1500
            })
            window.location.href = '/';
          }, error=>{
            this.toastr.error('?????i m???t kh???u th???t b???i !', 'H??? th???ng');
            window.location.href = '/';
          })
        })
      } else {
        this.toastr.error('M?? OTP kh??ng ????ng ! H??y ki???m tra l???i', 'H??? th???ng');
      }
    } else {
      this.toastr.error('H??y nh???p ?????y ????? th??ng tin !', 'H??? th???ng');
    }
  }

  sendOtp() {
    this.sendMailService.sendMailOtpForgotPassword(this.postForm.value.email).subscribe(data => {
      window.localStorage.removeItem("otp-forgot-password");
      window.localStorage.setItem("otp-forgot-password", JSON.stringify(data));
      this.toastr.success('Ch??ng t??i ???? g???i m?? OTP v??? email c???a b???n !', 'H??? th???ng');
    }, error => {
      if (error.status == 404) {
        this.toastr.error('Email n??y kh??ng t???n t???i tr??n h??? th???ng !', 'H??? th???ng');
      } else {
        this.toastr.warning('H??y nh???p ????ng email !', 'H??? th???ng');
      }
    })
  }

  sendError() {
    this.toastr.warning('H??y nh???p ????ng email!', 'H??? th???ng')
  }

}
