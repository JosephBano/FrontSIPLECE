import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Criterio } from 'src/app/models/modelos-generales/criterio.model';
import { Institucion } from 'src/app/models/modelosSeguridad/institucion.model';
import { Modelo } from 'src/app/models/modelosSeguridad/modelo.model';
import { SubCriterio } from 'src/app/models/modelos-generales/subCriterio.model';
import { DataService } from 'src/app/services/data.service';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { InstitucionesService } from 'src/app/services/serviciosSeguridad/instituciones.service';
import { ModeloService } from 'src/app/services/serviciosSeguridad/modelo.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';

@Component({
  selector: 'app-selector-indicadores',
  templateUrl: './selector-indicadores.component.html',
  styleUrls: ['./selector-indicadores.component.css']
})
export class SelectorIndicadoresComponent {
  selects: FormGroup;
  @Input() componenteRol: any; //Manejara el tipo de detalle al que redireccionara el indicador.

  institucion: Institucion[] = [];
  srtTituloInstitucion: string = '';
  modelos: Modelo[] = [];
  criterios: Criterio[] = [];
  subCriterios: SubCriterio[] = [];

  institucionID = "1"; // variable que setea la institucion
  modeloId!: string;
  criterioId!: string;
  subcriterioId!: string;

  disabledButton = true;
  displayIndicador = false;
  
  constructor(private fb: FormBuilder, 
              private institucionService: InstitucionesService,
              private modeloService: ModeloService,
              private criterioService: CriteriosService,
              private subcriterioService: SubCriteriosService
              ) {
    this.selects = this.fb.group({
      modelo: new FormControl({value: '', disabled: false}),
      criterio: new FormControl({value: '', disabled: true}),
      subcriterio: new FormControl({value: '', disabled: true}),
    })
  }

  ngOnInit(): void {
    this.institucionService.getInstituciones().subscribe(data => {
      this.institucion = data.filter( e => e.idInstitucion == this.institucionID);
      this.getData();
    })
    this.selects.get('modelo')?.setValue('1');
    this.modeloChange();
    this.selects.get('modelo')?.disable();
  }

  getData(){
    this.srtTituloInstitucion = this.institucion[0].detalle || '';

    this.modeloService.getModelos().subscribe(data => {
      this.modelos = data;
      
    })
    this.criterioService.getCriterios().subscribe(data => {
      this.criterios = data;
    })
    this.subcriterioService.getSubCriterio().subscribe(data => {
      this.subCriterios = data;
    })
  }

  modeloChange(){
    this.modeloId = this.selects.get('modelo')?.value;
    if (this.modeloId) {
      this.selects.get('criterio')?.enable();
    } else {
      this.selects.get('criterio')?.disable();
      this.selects.get('subcriterio')?.disable();
    }
    this.displayIndicador = false;
    this.criterioChange();
  }

  criterioChange(){
    this.displayIndicador = false;
    this.criterioId = this.selects.get('criterio')?.value;
    if (this.criterioId) {
      this.selects.get('subcriterio')?.enable();
      this.selects.get('subcriterio')?.setValue('');
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

  onSubmit() {
    this.displayIndicador = true;
  }
}
