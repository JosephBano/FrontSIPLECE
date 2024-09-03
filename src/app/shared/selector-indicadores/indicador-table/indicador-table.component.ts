import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { SubCriterioComponent } from 'src/app/components/panel/tablas/sub-criterio/sub-criterio.component';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { PermisoPeticion } from 'src/app/models/modelosSeguridad/perfil.model';
import { LoginService } from 'src/app/services/login.service';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { ElementoFundamentalService } from 'src/app/services/modeloServicios/elemento-fundamental.service';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-indicador-table',
  templateUrl: './indicador-table.component.html',
  styleUrls: ['./indicador-table.component.css']
})
export class IndicadorTableComponent implements OnInit{

  indicadores: Indicador[] = [];
  @Input() IdSubCriterio = "";
  @Input() redireccionRol: any;
  selectedIndicador: any;

  constructor(private indicadorService: IndicadorService,
              private perfilService: PerfilService,
              private loginService: LoginService,
              private route: Router,
              private criterioService: CriteriosService,
              private elementoFundamentalService: ElementoFundamentalService,
              private subcriterioService: SubCriteriosService,
              private evidenciaService: EvidenciaService)
  { }

  ngOnInit(): void {
    const permisoParams: PermisoPeticion = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: this.loginService.getTokenDecoded().perfil,
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
    
    // this.getDataAdmin(permisoParams);
    if(permisoParams.codigoPerfil.toLowerCase().includes('admin')) {
      this.getDataAdmin(permisoParams);
    } else {
      this.getDataUser(permisoParams);
    }
  }

  getDataAdmin(permisoParams: PermisoPeticion){
    const permission$ = this.perfilService.getPermisos(permisoParams).pipe(data => data)
    const indicator$ = this.indicadorService.getIndicador().pipe(data =>  data)//Cambiar a get by id subcriterio
      forkJoin(indicator$).subscribe(([indicatorsData]) => {
        this.indicadores = indicatorsData
      })
    
  }

  getDataUser(permisoParams: PermisoPeticion) {
    const permission$ = this.perfilService.getPermisos(permisoParams).pipe(data => data);
    const indicator$ = this.indicadorService.getIndicador().pipe(data => data); // Cambiar a get by id subcriterio
  
    forkJoin([permission$, indicator$]).subscribe(([permissionsData, indicatorsData]) => {
      let allPadres: string[] = [];
      let acumulados: any[] = []; 
  
      permissionsData.forEach((permiso) => {
        this.getPadres(permiso.codigoPermiso).subscribe((data) => {
          if (permiso.codigoPermiso.startsWith('C-')) {
            const padres: string[] = data[0].listP.split(',');
            const filteredIndicators = indicatorsData.filter(indicator => padres.includes(indicator.CodigoIndicador));
            acumulados = acumulados.concat(filteredIndicators);
          } else if (permiso.codigoPermiso.startsWith('SC-')) {
            const padres: string[] = data[0][0].listP.split(',');
            const filteredIndicators = indicatorsData.filter(indicator => padres.includes(indicator.CodigoIndicador));
            acumulados = acumulados.concat(filteredIndicators);
          } else if (permiso.codigoPermiso.startsWith('I-')) {
            const filteredIndicators = indicatorsData.filter(i => permissionsData.some(permiso => permiso.codigoPermiso === i.CodigoIndicador));
            acumulados = acumulados.concat(filteredIndicators);
          } else if (permiso.codigoPermiso.startsWith('EF-')) {
            const padres: string[] = data[1][0].listP.split(',');
            allPadres.push(...padres);
            const filteredIndicators = indicatorsData.filter(ef => allPadres.includes(ef.CodigoIndicador));
            acumulados = acumulados.concat(filteredIndicators);
          } else if (permiso.codigoPermiso.startsWith('E-')) {
            const padres: string[] = data[0].listP.split(',');
            allPadres.push(...padres);
            const filteredIndicators = indicatorsData.filter(e => allPadres.includes(e.CodigoIndicador));
            acumulados = acumulados.concat(filteredIndicators);
          }
          this.indicadores = acumulados;
        });
      });
    });
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

  handleRowClick(indicador: any) {
    this.selectedIndicador = indicador;
    
    switch(this.redireccionRol) {
      case 1:
        this.route.navigate(['panel/indicador-evidencia', this.selectedIndicador]);
        break;
      case 2:
        this.route.navigate(['panel/supervisor/revision-evidencia', this.selectedIndicador]);
        break;
      case 3:
        this.route.navigate(['panel/encargado/asignar-usuarios', this.selectedIndicador]);
        break;
      default:
        return
    }
  }
  
}
