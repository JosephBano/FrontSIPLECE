import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { SubCriterio } from '../../../../models/modelos-generales/subCriterio.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { TipoEvaluacion } from '../../../../models/modelos-generales/tipo-evaluacion.model';
import { Valoracion } from '../../../../models/modelos-generales/valoracion.model';
import { TipoEvaluacionService } from 'src/app/services/modeloServicios/tipo-evaluacion.service';
import { ValoracionService } from 'src/app/services/modeloServicios/valoracion.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { FilterSidebar } from 'src/app/services/filter-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-indicadores',
  templateUrl: './indicadores.component.html',
  styleUrls: ['./indicadores.component.css', '../../panel.component.css']
})
export class IndicadoresComponent implements OnInit{
  Indicadores: Indicador[] = [];
  SubCriterios: SubCriterio[] = [];
  TipoEvaluaciones: TipoEvaluacion[] = [];
  Valoraciones: Valoracion[] = [];
  
  filter!: string;
  checkboxDeshabilitarValue: boolean = false;
  selectedTipos!: number;

  valueFilter: string = '0';
  tablafilter!: FormGroup;

  @ViewChild('cerrarAgregarModal') cerrarAgregarModal!: ElementRef;
  @ViewChild('cerrarEditarModal') cerrarEditarModal!: ElementRef;

  agregar!: FormGroup;
  editar!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fd: FilterSidebar,
    private router: Router,
    private toastr: ToastrService,
    private indicadorService: IndicadorService,
    private subcriterioService: SubCriteriosService,
    private tipoService: TipoEvaluacionService,
    private valoracionService: ValoracionService,
    private Sidebar: Sidebar,
  ) {
    this.agregar = this.fb.group({
      subcriterio: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      estandar: ['', [Validators.required, Validators.minLength(5)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      tipoagregar: ['', Validators.required],
      periodoEvaluacion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]]
    })
    this.editar = this.fb.group({
      id: ['', Validators.required],
      subcriterio: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      valoracion: ['', Validators.required],
      tipoeditar: ['', Validators.required],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      estandar: ['', [Validators.required, Validators.minLength(5)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
    })

    this.tablafilter = this.fb.group({
      filter: [''],
    })
  }

  ngOnInit(): void {
    this.Sidebar.actualizarActiveLiOrder1('tablas');
    this.Sidebar.actualizarActiveLiOrder2('indicador');
    this.InitFiltro();
    this.loadIndicadores();
    this.loadSubCriterios();
    this.loadTipoEvaluaciones();
    this.loadValoraciones();
  }

  //Load Data
  InitFiltro(){
    this.fd.actualizarFiltroDefault('indicador');
    this.fd.getFiltro('indicador').subscribe(
      (data) => {
        if (data) {
          this.tablafilter.get('filter')?.setValue(data);
          this.valueFilter = data;
        }
      }
    )
  }

  setSubCriterio(){
    this.agregar.get('subcriterio')?.setValue(this.valueFilter);
    if (this.valueFilter != '0') this.agregar.get('subcriterio')?.disable();
    else this.agregar.get('subcriterio')?.enable();
  }

  navegarFiltro(id: string | undefined) {
    const value = id ?? '';
    this.fd.actualizarFiltro('elemento', value);
    this.router.navigate(['/panel/tablas/elementos'])
  }

  OnChangeFilter() {
    this.valueFilter = this.tablafilter.value.filter;
    this.agregar.value.subcriterio = this.valueFilter;
  }
  
  loadIndicadores(){
    this.indicadorService.getIndicador().subscribe(
      (data) => {
        this.Indicadores = data;
      }
    )
  }
    
  loadSubCriterios(){
    this.subcriterioService.getSubCriterio().subscribe(
    (data) => {
      this.SubCriterios = data.filter(e => e.Activo == '1');
    }
    )
  }
    
  loadTipoEvaluaciones(){
    this.tipoService.getTipoEvaluacion().subscribe(
      (data) => {
        this.TipoEvaluaciones = data.filter(e => e.Activo == '1');
      }
    )
  }
      
  loadValoraciones() {
    this.valoracionService.getValoracion().subscribe(
      (data) => {
        this.Valoraciones = data.filter(e => e.Activo == '1');
      }
    )
  }

  // Get objects  
  getDetalleSubCriterio(id: any){
    const obj = this.SubCriterios.find(e => e.IdSubCriterio === id);
    return obj?.Detalle;
  }

  getDetalleTipoEvaluacion(id: any){
    const tipo = this.TipoEvaluaciones.find(e => e.IdTipoEvaluacion === id)    
    return tipo?.Detalle;
  }

  getDetalleValoracion(id: any){
    const valoracion = this.Valoraciones.find(e => e.IdValoracion === id)
    return valoracion?.Detalle;
  }

  //otrasFunciones  
  setPreEditar(indicador: Indicador){
    this.editar.get('id')?.setValue(indicador.IdIndicador);
    this.editar.get('subcriterio')?.setValue(indicador.IdSubCriterio);
    this.editar.get('subcriterio')?.disable();
    this.editar.get('estandar')?.setValue(indicador.Estandar);
    this.editar.get('valoracion')?.setValue(indicador.Valoracion);
    this.editar.get('detalle')?.setValue(indicador.Detalle);
    this.editar.get('orden')?.setValue(indicador.Orden);
    this.editar.get('tipoeditar')?.setValue(indicador.IdTipoEvaluacion);
  }

  //agregar
  agregarIndicador(){
    this.agregar.get('subcriterio')?.enable();
    const indicador: Indicador = {
      CodigoIndicador: `I-${this.agregar.value.detalle.toLowerCase().replace(" ", "").slice(0, 5)}`,
      IdSubCriterio: this.agregar.value.subcriterio,
      IdTipoEvaluacion: this.agregar.value.tipoagregar,
      Orden: this.agregar.value.orden,
      Detalle: this.agregar.value.detalle,
      Estandar: this.agregar.value.estandar,
      Valoracion: '',
      PeriodoEvaluacion: this.agregar.value.periodoEvaluacion
    }

    this.agregar?.reset();

    this.indicadorService.postIndicador(indicador).subscribe(
      (data) => {
        this.toastr.success('El Indicador ha sido agregado correctamente!');
        this.loadIndicadores();
        console.log(data);
      },
      (error) => {
        this.toastr.error('Error!, no se ha podido realizar los cambios');
        console.log(error);
      }
    )

    if(this.cerrarAgregarModal) {
      this.cerrarAgregarModal.nativeElement.click();
    }
  }
  //editar
  editarIndicador(){
    this.editar.get('subcriterio')?.enable();
    const codigo = this.Indicadores.filter(e => e.IdIndicador === this.editar.value.id);
    const indicador: Indicador = {
      IdIndicador: this.editar.value.id,
      CodigoIndicador: codigo[0].CodigoIndicador,
      IdSubCriterio: this.editar.value.subcriterio,
      IdTipoEvaluacion: this.editar.value.tipoeditar,
      Valoracion: this.editar.value.valoracion,
      Orden: this.editar.value.orden,
      Detalle: this.editar.value.detalle,
      Estandar: this.editar.value.estandar,
      Activo: '1',
    }
    
    this.indicadorService.updateIndicador(indicador).subscribe(
      (data) => {
        this.toastr.success('Se ha realizado los cambios correctamente!');
        this.loadIndicadores();
        console.log(data);
      },
      (error) => {
        this.toastr.error('Error!, no se ha podido realizar los cambios');
        console.log(error);
      }
    );

    this.editar.reset();
    this.editar.get('indicador')?.setValue('0');

    if (this.cerrarEditarModal) {
      this.cerrarEditarModal.nativeElement.click();
    }
  }
}
