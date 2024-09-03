import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Criterio } from 'src/app/models/modelos-generales/criterio.model';
import { SubCriterio } from 'src/app/models/modelos-generales/subCriterio.model';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { ModeloService } from 'src/app/services/serviciosSeguridad/modelo.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { LoginService } from 'src/app/services/login.service';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { PermisoPeticion, PermisoRespuesta } from 'src/app/models/modelosSeguridad/perfil.model';
import { environment } from 'src/environments/environment.development';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { ElementoFundamental } from 'src/app/models/modelos-generales/elemento-fundamental.model';
import { ElementoFundamentalService } from 'src/app/services/modeloServicios/elemento-fundamental.service';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';

@Component({
  selector: 'app-selector-indicadores',
  templateUrl: './selector-indicadores.component.html',
  styleUrls: ['./selector-indicadores.component.css']
})
export class SelectorIndicadoresComponent {
  selects: FormGroup;
  @Input() componenteRol: any; //Manejara el tipo de detalle al que redireccionara el indicador.

  criterios: Criterio[] = [];
  subCriterios: SubCriterio[] = [];
  permisos: PermisoRespuesta[]=[];
  allSubCriterios: SubCriterio[] = [];

  modeloId!: string;
  criterioId!: string;
  subcriterioId!: string;

  disabledButton = true;
  displayIndicador = false;

  TitlePage: string = 'Componente';
  
  constructor(private fb: FormBuilder,
              private modeloService: ModeloService,
              private criterioService: CriteriosService,
              private subcriterioService: SubCriteriosService,
              private loginService: LoginService,
              private perfilService: PerfilService,
              private evidenciaService: EvidenciaService,
              private elementoFundamentalService: ElementoFundamentalService,
              private indicadorService: IndicadorService
              ) {
    this.selects = this.fb.group({
      criterio: new FormControl({value: '', disabled: false}),
      subcriterio: new FormControl({value: '', disabled: true}),
    })
  }

  ngOnInit(): void {
    this.TitlePageHandler();
    const nameInstitution = this.loginService.getTokenDecoded()['cod-institucion'];
    const permisoParams: PermisoPeticion = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: this.loginService.getTokenDecoded().perfil,
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
    //this.getData(permisoParams);
    if(permisoParams.codigoPerfil.toLowerCase().includes('admin')) {
      this.getDataAdmin(permisoParams);
    } else {
      this.getDataUser(permisoParams);
    }
  }

  TitlePageHandler(): void {
    if(this.componenteRol === 1) this.TitlePage = 'Subida de Evidencias'; 
    if(this.componenteRol === 2) this.TitlePage = 'Supervisor'; 
    if(this.componenteRol === 3) this.TitlePage = 'Encargado'; 
  }

  // Obtener datos administrador
  getDataAdmin(permisoParams: PermisoPeticion){
    const permission$ = this.perfilService.getPermisos(permisoParams).pipe(data => data)
     
    const data$ = this.modeloService.getModeloByCode(this.loginService.getTokenDecoded().modelo).pipe(
      switchMap((data) => {
        this.modeloId = data.idModelo!;
        const criterio$ = this.criterioService.getByModelo(this.modeloId);
        const subCriterio$ = this.subcriterioService.getSubCriterio();
        return forkJoin([criterio$, subCriterio$]);
      })
      );
    if(permisoParams.codigoPerfil.toLowerCase().includes('admin')){
      forkJoin(data$).subscribe(([[criteriosData, subCriteriosData]]) => {
        this.criterios = criteriosData;
        this.allSubCriterios = subCriteriosData;
      })
    }
  }
  //Obtener datos segun permisos del Usuario
  getDataUser(permisoParams: PermisoPeticion) {
    const permission$ = this.perfilService.getPermisos(permisoParams).pipe(data => data);
    
    const data$ = this.modeloService.getModeloByCode(this.loginService.getTokenDecoded().modelo).pipe(
      switchMap((data) => {
        this.modeloId = data.idModelo!;
        const criterio$ = this.criterioService.getByModelo(this.modeloId);
        const subCriterio$ = this.subcriterioService.getSubCriterio();
        return forkJoin([criterio$, subCriterio$]);
      })
    );
    
    forkJoin([permission$, data$]).subscribe(([permissionsData, [criteriosData, subCriteriosData]]) => {
      this.criterios = [];  // Inicializa la lista de criterios
      this.allSubCriterios = [];  // Inicializa la lista de subcriterios
      
      let allPadres: string[] = [];  // Declarar el array fuera del contexto donde se define padres
      
      permissionsData.forEach((permiso) => {
        this.getPadres(permiso.codigoPermiso).subscribe((data) => {
          if (permiso.codigoPermiso.startsWith('C-')) {
            // manejo datos permiso Criterio
            const padres: string[] = data[0].listP.split(',');
            const criteriosPermitidos = criteriosData.filter(c => permiso.codigoPermiso === c.CodigoCriterio);
            const subCriteriosPermitidos = subCriteriosData.filter(sc => padres.includes(sc.CodigoSubCriterio));
            this.criterios.push(...criteriosPermitidos);
            this.allSubCriterios.push(...subCriteriosPermitidos);
          } else if (permiso.codigoPermiso.startsWith('SC-')) {
            // manejo datos permiso Subcriterio
            const padres: string[] = data[1][0].listP.split(',');
            allPadres.push(...padres);
            const criteriosPermitidos = criteriosData.filter(c => padres.includes(c.CodigoCriterio));
            this.criterios.push(...criteriosPermitidos);
            const subCriteriosPermitidos = subCriteriosData.filter(sc => permiso.codigoPermiso === sc.CodigoSubCriterio);
            this.allSubCriterios.push(...subCriteriosPermitidos);
          } else if (permiso.codigoPermiso.startsWith('I-')) {
            // manejo datos permiso Indicador
            const padres: string[] = data[1][0].listP.split(',');
            allPadres.push(...padres);
            const criteriosPermitidos = criteriosData.filter(c => padres.includes(c.CodigoCriterio));
            this.criterios.push(...criteriosPermitidos);
            const subCriteriosPermitidos = subCriteriosData.filter(sc => padres.includes(sc.CodigoSubCriterio));
            this.allSubCriterios.push(...subCriteriosPermitidos);
          } else if (permiso.codigoPermiso.startsWith('EF-')) {
            // manejo datos permiso Elemento fundamental
            const padres: string[] = data[1][0].listP.split(',');
            allPadres.push(...padres);
            const criteriosPermitidos = criteriosData.filter(c => padres.includes(c.CodigoCriterio));
            this.criterios.push(...criteriosPermitidos);
            const subCriteriosPermitidos = subCriteriosData.filter(sc => padres.includes(sc.CodigoSubCriterio));
            this.allSubCriterios.push(...subCriteriosPermitidos);
          } else if (permiso.codigoPermiso.startsWith('E-')) {
            // manejo datos permiso Evidencia
            const padres: string[] = data[0].listP.split(',');
            allPadres.push(...padres);
            const criteriosPermitidos = criteriosData.filter(c => padres.includes(c.CodigoCriterio));
            this.criterios.push(...criteriosPermitidos);
            const subCriteriosPermitidos = subCriteriosData.filter(sc => padres.includes(sc.CodigoSubCriterio));
            this.allSubCriterios.push(...subCriteriosPermitidos);
          }
        });
      });
    });
  }

  criterioChange(){  
    this.displayIndicador = false;
    this.criterioId = this.selects.get('criterio')?.value;
    if (this.criterioId) {
      this.selects.get('subcriterio')?.enable();
      this.selects.get('subcriterio')?.setValue('');
      // Filtrar los subcriterios basado en el criterioId seleccionado
      this.subCriterios = this.allSubCriterios.filter(subCriterio => subCriterio.IdCriterio == this.criterioId);
    } else {
      this.selects.get('subcriterio')?.disable();
    }
    this.subcriterioChange();
  }
  subcriterioChange() {
    this.displayIndicador = false;
    this.subcriterioId = this.selects.get('subcriterio')?.value;
    if(this.subcriterioId !== '') {
      this.disabledButton = false;
    } else {
      this.disabledButton = true;
      this.selects.get('subcriterio')?.setValue('')
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


  onSubmit() {
    this.displayIndicador = true;
  }
}
