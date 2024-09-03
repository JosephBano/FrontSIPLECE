import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { email } from 'src/app/models/email.model';
import { EmailService } from 'src/app/services/email.service';
@Component({
  selector: 'app-add-usuario',
  templateUrl: './add-usuario.component.html',
  styleUrls: ['./add-usuario.component.css']
})
export class AddUsuarioComponent implements OnInit{
  usuario?: Usuario;
  usuarios: Usuario[] = [];
  formUsuario!: FormGroup;
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  contrasenia: string = '';
  showPassword = false;

  constructor(
    private bar: Sidebar,
    private fb: FormBuilder,
    private ds: DataService,
    private usuarioService: UsuarioService,
    private router: Router,
    private emailService: EmailService
  ) { 
 
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      contrasenia: ['',Validators.required] 
    });
  }
  
  ngOnInit(): void {
    this.bar.actualizarActiveLiOrder1('admin');
    this.bar.actualizarActiveLiOrder2('addusuarios')
    this.usuarioService.getUsuarios().subscribe(
      usuario =>this.usuarios=usuario
    );
  }

  getUsuarios() {
    this.usuarioService.getUsuarios()
      .subscribe(
        (data: Usuario[]) => {
          this.usuarios = data;
        },
        (error) => {
          console.error('Error al mostar usuarios', error);
        }
     );
  }

  agregarUsuario(form: NgForm) {
    if (this.formUsuario.invalid) {
      alert('Error al crear usuario, por favor llene todos los campos correctamente.');
    } else {
      const nombre = this.formUsuario.value['nombre'];
      const apellido = this.formUsuario.value['apellido'];
      const email = this.formUsuario.value['email'];
      const contrasenia = this.formUsuario.value['contrasenia'];
  
      const usuario: Usuario = {
        codigoAd: `${nombre}.${apellido}`,
        correo: email,
        nombre: nombre,
        apellido: apellido,
        rol: '',
        contrasenia: contrasenia,
        activo: '1'
      };
  
      this.usuarioService.crearUsuario(usuario).subscribe(
        response => {
          const Email : email  = {
            to: email,
            recipent: `${nombre} ${apellido}`,
            subject: `Usuario creado en sistema administrativo SIPLECE`,
            body: `<p> El usuario ${nombre} ${apellido} ha sido creado con éxito.</p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.5;">Usuario: ${email}</p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.5;">Contraseña: ${contrasenia}</p>
                  <p> Para ingresar al sistema, haga clic en el siguiente enlace: https://16.13.9.13 </p>`
                  
          }
          this.emailService.sendEmail(Email).subscribe(data=>{
          });
        },
        (error) => {
          console.error('Error al crear usuario', error);
        }
      );
      this.nombre = '';
      this.apellido = '';
      this.contrasenia = '';
      alert('Usuario creado con éxito');
    }
  }
}
