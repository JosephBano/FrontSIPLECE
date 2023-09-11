import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginToken } from 'src/app/models/logintoken.model';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;
  login: FormGroup;

  cdInstitucion = "ISTPET";

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private loginService: LoginService,
    ) 
    {
    this.login = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  ngOnInit(): void { }
  
  log(): void {
    const user: LoginToken = {
      correo: this.login.value.usuario,
      contrasenia: this.login.value.password,
      codigoInstitucion: this.cdInstitucion,
    }

    this.loginService.login(user).subscribe(data => {
      if(data.access_Token) {
        this.loginService.setLocalStorage(data.access_Token);
        this.router.navigate(['/panel']);
        console.log(this.loginService.getTokenDecoded());
      }else {
        this.login.get('password')?.setValue('');
        this.toastr.error("Acceso denegado. Correo o contraseña incorrectos!");
      }
    }, error => {
      console.log(error);
      this.login.reset();
        this.toastr.error(error.error.message);
    })
  }
}
