import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Evidencia, EvidenciaUsuarioPeticion } from 'src/app/models/modelos-generales/evidencia.model';
import { PermisoPeticion } from 'src/app/models/modelosSeguridad/perfil.model';
import { Sidebar } from 'src/app/services/sidebar.service';
import { LoginService } from 'src/app/services/login.service';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-estado-evidencia',
  templateUrl: './estado-evidencia.component.html',
  styleUrls: ['./estado-evidencia.component.css']
})
export class EstadoEvidenciaComponent implements OnInit {
  idArchivoSeleccionado?: any;
  idEvideSelected?: any;
  detalleSelected?: any;
  @Input() idElemento: any;
  @Output() idEvidenciaSelected = new EventEmitter<any>();
  @Output() DetalleSelected = new EventEmitter<any>();
  evidencias: Evidencia[] = [];
  permisoParams?: PermisoPeticion;
  filterBoolean = false;  

  //ActiveRols= '1';
  ActiveRols= '2';
  //subRolActivo = '1';
  subRolActivo = '2';

  tituloStr = '';

  constructor (
    private route: Router,
    private evidenciaService: EvidenciaService,
    private ds: Sidebar,
    private perfilService: PerfilService,    //esta de aqui
    private loginService: LoginService,     //y esta deben estar juntas
  ) { }
  
  ngOnInit(): void {
    this.permisoParams = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: this.loginService.getTokenDecoded().perfil,
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
    const permisoParams: PermisoPeticion = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: this.loginService.getTokenDecoded().perfil,
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
     if(permisoParams.codigoPerfil.toLowerCase().includes('admin')) {
       this.loadData();
      } else {
        this.loadDataUser();
   }
    this.loadTitle();
    this.InitRoles();
  }

  selectEvidenciaId(id: any) {
    this.idEvidenciaSelected.emit(id);
    this.idEvideSelected = id;
  }
  selectEvidenciaDetalle(detalle: any) {
    this.DetalleSelected.emit(detalle);
    this.detalleSelected = detalle;
  }
  statusFilter() {
    this.filterBoolean = !this.filterBoolean;
  }
  InitRoles() {
    if(this.route.url.includes('asignar-usuarios'))this.ActiveRols = '1';
    if(this.route.url.includes('indicador-evidencia'))this.ActiveRols = '2';
    if(this.route.url.includes('revision-evidencia')) {
      this.ActiveRols = '2';
      this.subRolActivo = '1';
    }
  }

  loadData() {
    const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data => data)
    const evidence$ = this.evidenciaService.getByElemento(this.idElemento).pipe(data => data);
    forkJoin([permission$,evidence$]).subscribe(([permissionsData, evidencesData]) => {
      this.evidencias = evidencesData
    })
  }
  loadDataUser() {
    const evidenciaUser: EvidenciaUsuarioPeticion = {
      codigoEvidencia: this.idElemento,
      usuarioRegistra: this.loginService.getTokenDecoded().usuarioRegistra
    }
    const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data => data)
    const evidence$ = this.evidenciaService.getByElemento(this.idElemento).pipe(data => data);
    forkJoin([permission$,evidence$]).subscribe(([permissionsData, evidencesData]) => {
      this.evidencias = evidencesData
    })
  }

  loadTitle() {
    switch (this.ActiveRols) {
      case '1': this.tituloStr = 'Asignar Usuario';
      break;
      case '2': this.tituloStr = 'Evidencias Subidas';
      break
    }
  }

  GetMaxCharacters(cadena: string | undefined): string {
    if (!cadena) return '';
  
    if (cadena.length <= 150) {
      return cadena;
    } else {
      const palabras = cadena.split(' ');
      let cadenaFin = '';
      let characterCount = 0;
      
      for (const palabra of palabras) {
        if (characterCount + palabra.length + cadenaFin.length <= 150) {
          cadenaFin += palabra + ' ';
          characterCount += palabra.length + 1;
        } else {
          break;
        }
      }
      
      return cadenaFin.trim() + '...';
    }
  }
}
