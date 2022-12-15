import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/cart';
import { Customer } from 'src/app/common/Customer';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  postForm: UntypedFormGroup;
  user!: Customer;
  cart!: Cart;
  url = '';

  @Input() id = 0;
  @Output()
  editFinish: EventEmitter<any> = new EventEmitter<any>();

  constructor(private modalService: NgbModal, private customerService: CustomerService, 
    private toastr: ToastrService, private cartService: CartService, private localStorageService: LocalStorageService) {
    this.postForm = new UntypedFormGroup({
      'userId': new UntypedFormControl(0),
      'name': new UntypedFormControl(null, [Validators.required, Validators.minLength(6)]),
      'email': new UntypedFormControl(null, Validators.required),
      'address': new UntypedFormControl(null, Validators.required),
      'phone': new UntypedFormControl(null, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
      'password': new UntypedFormControl(null, [Validators.required, Validators.minLength(6)]),
      'gender': new UntypedFormControl(true),
      'registerDate': new UntypedFormControl(new Date),
      'status': new UntypedFormControl(true),
      'role': new UntypedFormControl(0)
    })
  }

  ngOnInit(): void {
    this.customerService.getOne(this.id).subscribe(data => {
      this.user = data as Customer;
      this.postForm = new UntypedFormGroup({
        'userId': new UntypedFormControl(this.user.userId),
        'name': new UntypedFormControl(this.user.name, [Validators.required, Validators.minLength(6)]),
        'email': new UntypedFormControl(this.user.email, Validators.required),
        'address': new UntypedFormControl(this.user.address, Validators.required),
        'phone': new UntypedFormControl(this.user.phone, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
        'password': new UntypedFormControl(this.user.password, [Validators.required, Validators.minLength(6)]),
        'gender': new UntypedFormControl(this.user.gender),
        'registerDate': new UntypedFormControl(this.user.registerDate),
        'status': new UntypedFormControl(this.user.status),
        'role': new UntypedFormControl(this.user.role)
      })
      this.url = this.user.image;
    }, error => {
      this.toastr.error("Lỗi truy xuất dữ liệu! Bấm f5", "Hệ thống");
    })
  }

  update() {
    if (this.postForm.valid) {
      this.user = this.postForm.value;
      this.user.image = this.url;
      this.customerService.put(this.id, this.user).subscribe(data => {
        this.cartService.getCart(this.id).subscribe(data => {
          this.cart = data as Cart;
          this.cart.phone = this.user.phone;
          this.cart.address = this.user.address;
          this.cartService.updateCart(this.user.userId, this.cart).subscribe(data => {
            console.log('done');
          })
        }, error => {
          this.toastr.error('Lỗi! ' + error.status, 'Hệ thống')
        })        
        this.localStorageService.saveLogin(data as Customer);
        this.modalService.dismissAll();
        this.toastr.success('Cập nhật thành công!', 'Hệ thống');
        this.editFinish.emit('done');
      })
    } else {
      this.toastr.error('Hãy kiểm tra và nhập lại dữ liệu!', 'Hệ thống')
    }
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { centered: true, size: "lg" })
  }

  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.url = event.target.result;
        console.log(this.url);
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

}
