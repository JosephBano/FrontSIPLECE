import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { Indicador } from '../../models/modelos-generales/indicador.model';
import { ElementoFundamentalService } from 'src/app/services/modeloServicios/elemento-fundamental.service';
import { ElementoFundamental } from 'src/app/models/modelos-generales/elemento-fundamental.model';
import { PermisoPeticion } from 'src/app/models/modelosSeguridad/perfil.model';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment.development';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { Observable, forkJoin, of } from 'rxjs';
import { Sidebar } from 'src/app/services/sidebar.service';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { SharedService } from 'src/app/services/serviciosSeguridad/shared.service';

@Component({
  selector: 'app-detalle-indicador',
  templateUrl: './detalle-indicador.component.html',
  styleUrls: ['./detalle-indicador.component.css']
})
export class DetalleIndicadorComponent implements OnInit {
  indicador!: Indicador;
  elementos: ElementoFundamental[] = []; 

  permisoParams?: PermisoPeticion;

  strTituloIndicador = '';
  strTipoIndicador = '';
  strEstandar = '';

  rol1 = '';
  rol2 = '';

  selectedEsenciales: number | null = null;
  selectedComplementarios: number | null = null;
  index_temp = 0;
  
  constructor(
    private route: ActivatedRoute,
    private routeUrl: Router,
    private ds: Sidebar,
    private indicadorService: IndicadorService,
    private loginService: LoginService,
    private elementoService: ElementoFundamentalService,
    private perfilService: PerfilService,
    private evidenciaService: EvidenciaService,
    private elementoFundamentalService: ElementoFundamentalService,
    private criterioService: CriteriosService,
    private subcriterioService: SubCriteriosService,
    private sharedService: SharedService
    //private router: Router
  ) { }
   

  ngOnInit(): void {
    this.permisoParams = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: this.loginService.getTokenDecoded().perfil,
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
    this.route.params.subscribe(params => {
      const indicadorID = params['id'];
      this.getIndicadorById(indicadorID);
      this.loadElementosById(indicadorID);
    });
    this.InitRoles();
    this.sharedService.myMethod$.subscribe(() => {
      this.toggle(this.index_temp);
    });
  }

  toggle(index:number): void  {
    this.index_temp = index;
    this.selectedEsenciales = (this.selectedEsenciales === index ? null : index)
  }
  InitRoles() {
    if(this.routeUrl.url.includes('asignar-usuarios')) this.ds.actualizarActiveLiOrder1('encargado');
    if(this.routeUrl.url.includes('indicador-evidencia')) this.ds.actualizarActiveLiOrder1('evidencias');
    if(this.routeUrl.url.includes('revision-evidencia')) this.ds.actualizarActiveLiOrder1('checkmanager');
  }

  loadElementosById(id: string){    
    const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data => data)
    const element$ = this.elementoService.getElementoFundamental().pipe(data => data);

    if(this.permisoParams?.codigoPerfil.toLowerCase().includes('admin')){
      forkJoin(element$).subscribe(([elementsData]) => {
        this.elementos = elementsData.filter(e => e.IdIndicador==id);
      })
    }else{
      forkJoin([permission$, element$]).subscribe(([permissionsData, elementsData]) => {
        let allPadres: string[] = []; // Declarar el array fuera del contexto donde se define padres
        permissionsData.forEach((permiso)=>{
            this.getPadres(permiso.codigoPermiso).subscribe((data)=>{
                if(permiso.codigoPermiso.startsWith('C-')){
                    //manejo datos permiso Criterio
                    this.elementos = elementsData.filter(e => e.IdIndicador==id);
                  } else if(permiso.codigoPermiso.startsWith('SC-')){
                    //manejo datos permiso Subcritero
                    this.elementos = elementsData.filter(e => e.IdIndicador==id);
                  } else if((permiso.codigoPermiso.startsWith('I-'))){
                    //manejo datos permiso Indicador
                    this.elementos = elementsData.filter(e => e.IdIndicador==id);
                  } else if(permiso.codigoPermiso.startsWith('EF-')){
                  //manejo datos permiso Elemento fundamental
                  this.elementos = elementsData.filter(e=>permissionsData.some(p=>p.codigoPermiso===e.CodigoElementoFundamental) && e.IdIndicador==id)
              } else if(permiso.codigoPermiso.startsWith('E-')){
                    //manejo datos permiso Evidencia
                    const padres: string[] = data[0].listP.split(',');
                    allPadres.push(...padres); 
                    this.elementos = elementsData.filter(e => allPadres.includes(e.CodigoElementoFundamental) && e.IdIndicador==id);
                }
            });
        });
      })
    }
  }
  getPadres(dato: string): Observable<any> {
    switch(true){
      case dato.includes('C-',0) && !dato.includes('C-',1):        
        return this.criterioService.getChild(dato);
      case dato.includes('SC-',0) && !dato.includes('SC-',1):
        const scC$ = this.subcriterioService.getChild(dato).pipe(sc=>sc);     
        const scF$ = this.subcriterioService.getFather(dato).pipe(sc=>sc); 
        return forkJoin([scC$,scF$]);
      case dato.includes('I-',0) && !dato.includes('I-',1):
        const iC$ = this.indicadorService.getChild(dato).pipe(i=>i)     
        const iF$ = this.indicadorService.getFather(dato).pipe(i=>i) 
        return forkJoin([iC$,iF$]);
      case dato.includes('EF-',0) && !dato.includes('EF-',1):
        const efC$ = this.elementoFundamentalService.getChild(dato).pipe(ef=>ef)     
        const efF$ = this.elementoFundamentalService.getFather(dato).pipe(ef=>ef) 
        return forkJoin([efC$,efF$]);
      case dato.includes('E-',0) && !dato.includes('E-',1):   
        return this.evidenciaService.getFather(dato);
      default:
        return of();  
    }
  }

  getIndicadorById(id: string): void {
    /* SI TIENE ACCESO A INDICADOR DEBE CARGAR ESTO */
    const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data => data)
    const indicator$ = this.indicadorService.getIndicadorById(id).pipe(data => data);
    forkJoin([permission$,indicator$]).subscribe(([permissionsData,indicatorsData]) => {
      
      if (indicatorsData && indicatorsData.length > 0) {  
        if(this.permisoParams?.codigoPerfil.toLowerCase().includes('admin'))
        {
          this.indicador = indicatorsData[0];
          this.cargaDeDatos();
        } else {    
          this.indicador = indicatorsData[0];
          this.cargaDeDatos();
        }
      }
    })
  }

  cargaDeDatos(): void {
    this.strTituloIndicador = this.indicador.Detalle || '';
    this.strTipoIndicador = this.indicador.IdTipoEvaluacion == "1" ? 'Cuantitativo' : 'Cualitativo';
    this.strEstandar = this.indicador.Estandar ? this.indicador.Estandar.toString() : '';
}
}