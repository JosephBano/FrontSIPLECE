import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ArchivoEvidencia, insertarArchivoEvidencia } from 'src/app/models/modelos-generales/archivo-evidencia.model';
import { Usuario } from 'src/app/models/usuario.model';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-asignar-usuario',
  templateUrl: './asignar-usuario.component.html',
  styleUrls: ['./asignar-usuario.component.css']
})
export class AsignarUsuarioComponent implements OnInit{
  @Input() IdEvidencia: any;
  @Input() IdEvidenciaSelected: any;

  Usuarios: Usuario[] = [];
  Archivos: ArchivoEvidencia[] = [];
  filter!: string;
  detalle!: string;

  filterBoolean: boolean = false;

  usuario_aux!: Usuario;
  archivo_aux!: ArchivoEvidencia;

  editarEncargado!: FormGroup;
  agregarEncargado!: FormGroup;
  AddNewItem!: FormGroup;

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
    private dataService: DataService,
  ) {
    this.editarEncargado = this.fb.group({
      nombre: '',
    })
    this.agregarEncargado = this.fb.group({
      nombre: '',
    })
    this.AddNewItem = this.fb.group({
      detalle: ['', Validators.required]
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
    return this.dataService.formatName(str);
  }
  comprobarUsuario(usuario: Usuario): boolean {
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
    if(this.AddNewItem.value.detalle===''){
      this.AddNewItem.value.detalle='Archivo Evidencia';
    }
    const Archivo: insertarArchivoEvidencia= {
      codigoUsuario: this.usuario_aux.codigoAd,
      fechaRegistro: this.obtenerFechaEnFormato(),
      detalle: this.AddNewItem.value.detalle,
      idEvidencia: this.IdEvidenciaSelected
    }
    this.archivoService.insertarArchivoEvidencia(Archivo).subscribe(
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
      this.straddconf = this.dataService.formatName(usuario.codigoAd) ?? '';
    }
  }
  
  editValuesfor(usuario: Usuario) {
    if(this.comprobarUsuario(usuario)) {
      this.toastr.warning('Este usuario ya esta asignado en esta evidencia!');
    }
    else {
      this.btnConfEdit.nativeElement.click();
      this.usuario_aux = usuario;
      this.straddconf = this.dataService.formatName(usuario.codigoAd) ?? '';
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
