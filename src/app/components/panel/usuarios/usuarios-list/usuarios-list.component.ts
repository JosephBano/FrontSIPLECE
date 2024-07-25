import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent {

  titulo: string="Lista Usarios"
  formulario!: FormGroup;
  usuario?: Usuario;
  usuariosInactivos: Usuario[] = [];
  usuarios: Usuario[] = [];
    nombre: string = '';
    apellido: string = '';
    contrasenia: string = '';
  mostrarUsuariosInactivos: boolean = false;



  
  constructor(
    private bar: Sidebar,
    private fb: FormBuilder,
    private ds: DataService,
    private usuarioService: UsuarioService,
    private router: Router
  ) { 
 
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      contrasenia: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
      this.bar.actualizarActiveLiOrder1('admin');
      this.bar.actualizarActiveLiOrder2('usuariosList')
      this.usuarioService.getUsuarios().subscribe(
        usuario =>this.usuarios=usuario
      );
      this.getUsuariosInactivos();
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
  toggleUsuariosInactivos(): void {
    this.mostrarUsuariosInactivos = !this.mostrarUsuariosInactivos;
  }
  getUsuariosInactivos() {
    this.usuarioService.getUsuariosInactivos()
      .subscribe(
        (data: Usuario[]) => {
          this.usuariosInactivos = data;
          console.log(this.usuariosInactivos);
          
        },
        (error) => {
          console.error('Error al mostar usuarios inactivos', error);
        }
     );
  }

  updateUserStatus(id: any) {
    this.usuarioService.updateActiveStatus(id).subscribe(
      response => {
        console.log(response);
      },
      error => {
        console.error('Error al actualizar el estado del usuario', error);
      }
    );
  }
  
}


