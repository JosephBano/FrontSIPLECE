import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Evidencia } from '../../../../models/modelos-generales/evidencia.model';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { ArchivoEvidenciaService } from 'src/app/services/modeloServicios/archivo-evidencia.service';
import { AgregarArchivoRequest, AgregarPathRequest, ObtenerTokenRequest } from 'src/app/models/modelos-generales/sharedPointToken';
import { environment } from 'src/environments/environment.development';
import { switchMap } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ObservacionDataService } from 'src/app/services/modeloServicios/observacion-data.service';
import { archivoEvidencia } from 'src/app/models/modelos-generales/archivo-evidencia.model';
import { Notificacion } from 'src/app/models/modelos-generales/notificacion';
import { NotificacionesService } from 'src/app/services/modeloServicios/notificaciones.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { EmailService } from 'src/app/services/email.service';
import { email } from 'src/app/models/email.model';
import { SharedService } from 'src/app/services/serviciosSeguridad/shared.service';

@Component({
  selector: 'app-modal-evidencias',
  templateUrl: './modal-evidencias.component.html',
  styleUrls: ['./modal-evidencias.component.css']
})
export class ModalEvidenciasComponent implements OnInit{
  @Input() IdEvidenciaSelected?: any;
  files: File[] = [];
  formData: FormData = new FormData();
  @Input() elemento: any;
  Evidencias: Evidencia[] = [];
  usuarioRegister: string="";
  nombre: any;
  apellido: any;

  constructor(
    private loginService: LoginService,
    private evidenciaService: EvidenciaService,
    private archivoEvService: ArchivoEvidenciaService,
    private toastr: ToastrService,
    private location: Location,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private archivoService: ArchivoEvidenciaService,
    private usuarioService: UsuarioService,
    private emailService: EmailService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.usuarioRegister = this.loginService.getTokenDecoded().usuarioRegistra
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files) {
      this.files = [...this.files, ...Array.from(element.files)];
    }
    element.value = '';
  }

  convertToBase64(file: File): Promise<string> { 
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result.toString().split(',')[1]);
        } else {
          reject(new Error('Error al leer el archivo en base64.'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }
  
  async onUpload() {
    try {
      const fileData = await this.convertToBase64(this.files[0]);
      this.getToken(this.files[0].name, fileData, this.files[0].name)
      this.router.navigate([`${this.location.path()}`]);
      this.files = []
      this.sharedService.triggerMethod();
    } catch (error) {
      this.toastr.error(`Error base 64: {error}`)
    }
  }
  CancelFile(): void {
    this.files = [];
    }

    async getToken(fileName: string, filebase: string, fileDetail: string) {  
      const credentials: ObtenerTokenRequest = {
        GrantType: environment.SHP_API_GRANT_TYPE,
        ApplicationId: environment.SHP_API_APP_ID,
        ClientId: environment.SHP_API_CLIENT_ID,
        ClientSecret: environment.SHP_API_CLIENT_SECRET,
        TenantName: environment.SHP_API_TENANT_NAME,
        RefreshToken: environment.SHP_REFRESH_TOKEN
      }
      this.archivoEvService.GetTokenSharedPoint(credentials).pipe(
        switchMap((tokenAccess: any)=>{
          const addFileBody: AgregarArchivoRequest = {
            TenantName: credentials.TenantName,
            SiteName: environment.SHP_FOLDER_SITE_NAME,
            ListName: environment.SHP_FOLDER_LIST_NAME,
            FileName: fileName,
            FileBase64: filebase,
            AccessToken: tokenAccess["access_token"]
          }
          console.log("addFileBody",addFileBody);
          
          return this.archivoEvService.AddFileSharedPoint(addFileBody)
        })
      ).subscribe(data => {
        this.addArchivoEvidencia(data.PathUrl, fileDetail)
      })
    }


    addArchivoEvidencia(pathUrl?: string, fileDetail?: string){
      this.archivoEvService.updateArchivoEvidencia(this.IdEvidenciaSelected, this.usuarioRegister).subscribe(() => {
      });
      const archivo : archivoEvidencia={
        IdEvidencia: this.IdEvidenciaSelected,
        Estado: '0',
        FechaRegistro: this.obtenerFechaEnFormato(),
        UsuarioRegistra: this.usuarioRegister,
        Detalle: fileDetail,
        PathUrl: pathUrl,
        Activo: '1',
      }
      this.toastr.success("Archivo subido a SharedPoint")  
      this.archivoEvService.insertarArchivoEvidencia(archivo).subscribe(() => {
      });
      this.archivoService.GetByEvidenciaUser(this.IdEvidenciaSelected,this.loginService.getTokenDecoded().usuarioRegistra).subscribe(data => {
        const IdArchivoEvidencia = data[0].IdArchivoEvidencia;
        const notificacion: Notificacion = {
          IdArchivoEvidencia: IdArchivoEvidencia,
          UsuarioRegistra: 'SUPERVISOR',
          Detalle: 'Tienes una evidencia que no ha sido evaluada',
          IdEvidencia: this.IdEvidenciaSelected,
        };
        console.log(notificacion);
        
        this.notificacionesService.addNotificacion(notificacion).subscribe(response => {
          console.log('Notificación creada', response);
          
        }, error => {
          console.error('Error creating notification', error);
        });
        this.nombre = this.loginService.getTokenDecoded().nombre
        this.usuarioService.getEmailByPerfil('SUPERVISOR').subscribe(data => {
          console.log(data);
          
          const correos = data.map((usuario: any) => usuario.correo);
        
          data.forEach((usuario: any) => {
            const email = {
              to: usuario.correo,
              recipent: `${usuario.nombre} ${usuario.apellido}`,
              subject: 'Evidencia subida SIPLECE',
              body: `El usuario ${this.nombre} ha subido una evidencia para su evaluación.`
            };
            console.log(email);
            
             this.emailService.sendEmail(email).subscribe(response => {
               console.log(`Correo enviado a: ${usuario.correo}`, response);
             });
          });
        });
      });
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

  openModal() {
    this.evidenciaService.getEvidencia().subscribe(
      (data) => {
        this.Evidencias = data.filter( e => e.IdElemento == this.elemento);
      }
    )
  }
}
