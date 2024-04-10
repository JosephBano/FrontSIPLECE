import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { UsuarioService } from 'src/app/services/usuario.service';

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
  contrasenia: string = '';
  showPassword = false;

  constructor(
    private bar: Sidebar,
    private fb: FormBuilder,
    private ds: DataService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { 
 
    this.formUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
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
      const contrasenia = this.formUsuario.value['contrasenia'];
  
      const usuario: Usuario = {
        codigoAd: `${nombre}.${apellido}`,
        correo: `${nombre.toLowerCase()}.${apellido.toLocaleLowerCase()}@istpet.edu.ec`,
        nombre: nombre,
        apellido: apellido,
        rol: '',
        contrasenia: contrasenia,
        activo: '1'
      };
  
      this.usuarioService.crearUsuario(usuario).subscribe(
        response => {
          console.log('Usuario creado con éxito', response);
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
