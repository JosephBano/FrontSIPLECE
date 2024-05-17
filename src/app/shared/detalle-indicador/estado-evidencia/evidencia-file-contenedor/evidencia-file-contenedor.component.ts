import {Component, TemplateRef, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ArchivoEvidencia } from '../../../../models/modelos-generales/archivo-evidencia.model';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';
import { ToastrService } from 'ngx-toastr';
import { ObservacionArchivo } from 'src/app/models/modelos-generales/observacion-data.model';
import { ObservacionDataService } from 'src/app/services/modeloServicios/observacion-data.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, of, tap } from 'rxjs';
import { NotificacionesService } from 'src/app/services/modeloServicios/notificaciones.service';
import { Notificacion } from 'src/app/models/modelos-generales/notificacion';

@Component({
  selector: 'app-evidencia-file-contenedor',
  templateUrl: './evidencia-file-contenedor.component.html',
  styleUrls: ['./evidencia-file-contenedor.component.css']
})
export class EvidenciaFileContenedorComponent implements OnInit{
  @Output() idArchivoSeleccionadoEmitido = new EventEmitter<number>();
  observaciones$?: Observable<ObservacionArchivo[]>;
  @Input() IdEvidencia: any;
  modalRef?: BsModalRef;
  IdArchivoEvidencia!: string;
  formulario: FormGroup;
  observacionDetalle: string = '';
  strname: string = ''; 
  Observaciones: ObservacionArchivo[] = [];
  Archivos: ArchivoEvidencia[] = [];
  ArchivosInactivos: any;
  radiobuton!: FormGroup;
  formDisabled: boolean[] = [];
  formStatus: string[] = [];
  //rolviewradios = '1';
  //rolviewradios = '2';
  @Input() rolviewradios: any;
  idArchivoSeleccionado: any;
  showContainer = false;
  logArchivoEvidencia: any[] = [];


  constructor(
    private archivoService: ArchivoEvidenciaService,
    private observacionDataService: ObservacionDataService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private toastr: ToastrService,
    private login: LoginService,
    private modalService: BsModalService,
    private notificacionesService: NotificacionesService
    
  ) {
    this.radiobuton = this.fb.group({
      estado: ['0', [Validators.required]] 
    });
    this.formulario = this.fb.group({
      detalle: ['', Validators.required] 
    });
   }
 
  ngOnInit(): void {
    this.data()
    this.strname = this.login.getTokenDecoded().nombre;
    this.sendValidated
  }

  data(): void {
    console.log("IdEvidencia",this.IdEvidencia);
    console.log("usuarioRegistra",this.loginService.getTokenDecoded().usuarioRegistra);
    this.archivoService.GetByEvidenciaUser(this.IdEvidencia,this.loginService.getTokenDecoded().usuarioRegistra).subscribe(data => {
      this.Archivos = data.map(archivo => ({ ...archivo, showContainer: false }));
      this.Archivos = data;
      console.log("Archivos",this.Archivos);
      this.formDisabled = new Array(this.Archivos.length).fill(false);
      this.formStatus = new Array(this.Archivos.length).fill('btnWait');
      if (this.Archivos.length > 0) {
        this.Archivos.forEach((archivo, index) => {
          this.idArchivoSeleccionado = archivo.IdArchivoEvidencia;
          this.getObservacionByIdArchivoEvidencia(this.idArchivoSeleccionado);
           this.idArchivoSeleccionadoEmitido.emit(this.idArchivoSeleccionado);
           this.idArchivoSeleccionado = archivo.IdArchivoEvidencia;
           // ...
      });
      }
    });
    if(this.loginService.getTokenDecoded().perfil === "SUPADMIN" || this.loginService.getTokenDecoded().perfil === "SUPERVISOR" ){ //aqui configuracion para supervisor
      this.archivoService.GetByEvidencia(this.IdEvidencia).subscribe(data=>{
        this.Archivos = data.map(archivo => ({ ...archivo, showContainer: false }));
        this.Archivos = data;
      console.log("Archivos",this.Archivos);
        this.formDisabled = new Array(this.Archivos.length).fill(false);
        this.formStatus = new Array(this.Archivos.length).fill('btnWait');
        if (this.Archivos.length > 0) {
          this.Archivos.forEach((archivo, index) => {
            this.idArchivoSeleccionado = archivo.IdArchivoEvidencia;
            this.getObservacionByIdArchivoEvidencia(this.idArchivoSeleccionado);
             this.idArchivoSeleccionadoEmitido.emit(this.idArchivoSeleccionado);
             this.idArchivoSeleccionado = archivo.IdArchivoEvidencia;
             // ...
        });
      }
      });
    }
  }

  sendValidated(i: number, archivo?: any): void {    
    console.log("radio butin selected",this.radiobuton.value.estado);
    console.log("idArchivoSelect",this.idArchivoSeleccionado);
    if(this.radiobuton.value.estado !== '0'){
      if (archivo) {
        
        this.idArchivoSeleccionado = archivo.IdArchivoEvidencia;
        
      }
      this.formDisabled[i] = true;
      this.formStatus[i] = this.getClassStyle(this.radiobuton.value.estado);
      this.updateStatus(i, this.radiobuton.value.estado);
      this.radiobuton.value.estado = '0';
      
    }
  }

   getClassStyle(value: string): string{
    if(value==='0'){
      return 'btnWait'
    }
    if(value==='1'){
      return 'btnDisapprove'
    }
    return 'btnApprove'
  }
  async updateStatus(index:number,value: string): Promise<void>{
    console.log("IdEvidencia",this.IdEvidencia);
    
    const fileUpdate: ArchivoEvidencia = {
      IdArchivoEvidencia: Number(this.Archivos[index].IdArchivoEvidencia), 
      IdPeriodo: Number(this.Archivos[index].IdPeriodo), 
      Estado: value,
      FechaRegistro: this.Archivos[index].FechaRegistro,
      FechaValidacion: this.obtenerFechaEnFormato(),
      UsuarioRegistra: this.Archivos[index].UsuarioRegistra,
      RolValida: this.Archivos[index].RolValida,
      Detalle: this.Archivos[index].Detalle,
      PathUrl: this.Archivos[index].PathUrl,
      Activo: '1',
      IdEvidencia : this.IdEvidencia
    }
    console.log("fileUpdate",fileUpdate);
    
    if(fileUpdate.Detalle===null){
      fileUpdate.Detalle=""
    }
    if(fileUpdate.PathUrl===null){
      fileUpdate.PathUrl=""
    }
    console.log(fileUpdate);
    
    try{
      this.archivoService.UpdateArchivo(fileUpdate).subscribe(data=>{
        const notificacion: Notificacion = {
          IdArchivoEvidencia: fileUpdate.IdArchivoEvidencia,
          UsuarioRegistra: fileUpdate.UsuarioRegistra,
          Detalle: '!Tu evidencia ha sido evaluada por un supervisor¡'
        };
        this.notificacionesService.addNotificacion(notificacion).subscribe(response => {
        }, error => {
          console.error('Error creating notification', error);
        });
        if(data.Estado==value){
          this.toastr.success("Archivo evaluado con exito");
        }
      });
    }catch(error){ 
        this.toastr.error("Error al evaluar el archivo");
    }
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
 
  getObservacionByIdArchivoEvidencia(id: any) {
    this.observacionDataService.getObservacionByIdArchivoEvidencia(id).subscribe(
      data => {
        this.Observaciones.push(...data);
      }
    );
  }
deleteObservacion(index:number){
  this.observacionDataService.deleteObservacion(index).subscribe(
           response => {
             console.log('Observación eliminada:', response);
           },
           error => {
             console.error('Error eliminando observación:', error);
           }
         );
}
  enviarObservacion() {
    if (this.observacionDetalle) {
      console.log("archivoEvide",this.idArchivoSeleccionado);
      
      const nuevaObservacion: ObservacionArchivo = {
        IdArchivoEvidencia:this.idArchivoSeleccionado, 
        UsuarioEvalua: this.strname = this.login.getTokenDecoded().nombre, 
        Detalle: this.observacionDetalle, 
        Estado: '0', 
        FechaRegistro: this.obtenerFechaEnFormato()
      };

      this.observacionDataService.postObservacion(nuevaObservacion).subscribe(response => {
        console.log('Observación enviada exitosamente', response);
        this.mostrarMensaje('Observacion agregada con exito', 'mensaje-exito');
      },
      (error) => {
        console.error('Error al enviar la observación', error);
        this.mostrarMensaje('¡Hubo un error al subir la observacion!', 'mensaje-error');
      });

    
      this.observacionDetalle = '';
    }
  }

  openModal(template: TemplateRef<any>) {
    if(this.radiobuton.value.estado === '1'){
      this.modalRef = this.modalService.show(template);
    }
  }

  
  mostrarMensaje(mensaje: string, clase: string) {
    const mensajeElement = document.getElementById('mensaje');

    if (mensajeElement) {
      mensajeElement.innerText = mensaje;
      mensajeElement.classList.add(clase);
      mensajeElement.style.display = 'block';
  
      setTimeout(() => {
        mensajeElement.style.display = 'none';
        mensajeElement.innerText = '';
        mensajeElement.classList.remove(clase);
      }, 3000); 
    }
  }

  toggleContainer(i: number, usuarioRegistra: string, idEvidencia: any): void {
    this.archivoService.getArchivoInactivo(idEvidencia, usuarioRegistra).subscribe(data => {
      console.log("data",data);
      this.ArchivosInactivos = data;
      this.Archivos[i].showContainer = !this.Archivos[i].showContainer;
    });
  }
}