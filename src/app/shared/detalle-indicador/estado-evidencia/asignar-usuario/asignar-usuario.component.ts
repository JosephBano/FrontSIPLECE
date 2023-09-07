import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ArchivoEvidencia } from 'src/app/models/modelos-generales/archivo-evidencia.model';
import { Usuario } from 'src/app/models/usuario.model';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-asignar-usuario',
  templateUrl: './asignar-usuario.component.html',
  styleUrls: ['./asignar-usuario.component.css']
})
export class AsignarUsuarioComponent implements OnInit{
  @Input() IdEvidencia: any;

  Usuarios: Usuario[] = [];
  Archivos: ArchivoEvidencia[] = [];
  filter!: string;

  filterBoolean: boolean = false;

  usuario_aux!: Usuario;
  archivo_aux!: ArchivoEvidencia;

  editarEncargado!: FormGroup;
  agregarEncargado!: FormGroup;

  @ViewChild('btnConfAdd') btnConfAdd!: ElementRef;
  @ViewChild('closeBtnAdd') closeBtnAdd!: ElementRef;
  @ViewChild('btnConfDel') btnConfDel!: ElementRef;
  @ViewChild('btnConfEdit') btnConfEdit!: ElementRef;

  straddconf: string = '';
  strdelconf: string = '';

  constructor(
    private userService: UsuarioService,
    private archivoService: ArchivoEvidenciaService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {
    this.editarEncargado = this.fb.group({
      nombre: '',
    })
    this.agregarEncargado = this.fb.group({
      nombre: '',
    })
   }

  ngOnInit(): void {
    this.loadData();
  }
  
  loadData() {
    this.userService.getUsuarios().subscribe(data => this.Usuarios = data.filter(e => e.activo == '1'));  
    this.archivoService.GetByEvidencia(this.IdEvidencia).subscribe(data => this.Archivos = data.filter(e => e.Activo == '1'));
  }

  statusFilter() {
    this.filterBoolean = !this.filterBoolean;
  }

  formatName(str: string | undefined) {
    return str?.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).replace(/\./g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).join(" ");
  }

  comprobarUsuario(usuario: Usuario): boolean {
    for (let i = 0; i < this.Archivos.length; i++) {
      if(this.Archivos[i].UsuarioRegistra == usuario.codigoAd) return true 
    }
    return false;
  }

  obtenerFechaEnFormato() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0'); 
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const segundos = fecha.getSeconds().toString().padStart(2, '0');

  
    return `${anio}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
  }

  agregarNuevaArchivo() {
    const Archivo: ArchivoEvidencia= {
      IdEvidencia: this.IdEvidencia,
      Estado: '0',
      FechaRegistro: this.obtenerFechaEnFormato(),
      FechaValidacion: '',
      UsuarioRegistra: this.usuario_aux.codigoAd,
      UsuarioValida: '',
      ObservacionRegistra: '',
      ObservacionValidacion: '',
      Activo: '1'
    }

    this.archivoService.PostArchivo(Archivo).subscribe(
      data => { 
        this.toastr.success('Evidencia creada con exito');
        this.loadData();
      }, error => {
        this.toastr.error('Ha ocurrido un error');
      }
    )
  }

  addValuesfor(usuario: Usuario) {
    if(this.comprobarUsuario(usuario)) {
      this.toastr.warning('Este usuario ya esta asignado en esta evidencia!');
    }
    else {
      this.btnConfAdd.nativeElement.click();
      this.usuario_aux = usuario;
      this.straddconf = this.formatName(usuario.codigoAd) ?? '';
    }
  }
  
  editValuesfor(usuario: Usuario) {
    if(this.comprobarUsuario(usuario)) {
      this.toastr.warning('Este usuario ya esta asignado en esta evidencia!');
    }
    else {
      this.btnConfEdit.nativeElement.click();
      this.usuario_aux = usuario;
      this.straddconf = this.formatName(usuario.codigoAd) ?? '';
    }
  }

  openModalDel(archivo: ArchivoEvidencia) {
    this.archivo_aux = archivo;
    this.strdelconf = archivo.UsuarioRegistra ?? '';
    this.btnConfDel.nativeElement.click();
  }

  borrarArchivo() {
    const id = this.archivo_aux.IdArchivoEvidencia ?? '';
    this.archivoService.DeleteArchivo(id).subscribe(
      data => { 
        this.toastr.success('El encargado se ha eliminado con exito!');
        this.loadData();
      }, error => {
        this.toastr.error('Ha ocurrido un error al borrar al Encargado');
      }
    )
  }
}
