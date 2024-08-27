import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ElementoFundamental } from 'src/app/models/modelos-generales/elemento-fundamental.model';
import { Evidencia } from 'src/app/models/modelos-generales/evidencia.model';
import { Periodo } from '../../../../models/modelos-generales/periodo.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { ElementoFundamentalService } from 'src/app/services/modeloServicios/elemento-fundamental.service';
import { PeriodoService } from 'src/app/services/modeloServicios/periodo.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { FilterSidebar } from 'src/app/services/filter-data.service';

@Component({
  selector: 'app-evidencia',
  templateUrl: './evidencia.component.html',
  styleUrls: ['./evidencia.component.css', '../../panel.component.css']
})
export class EvidenciaComponent implements OnInit{
  Evidencias: Evidencia[] = [];
  Elementos: ElementoFundamental[] = [];
  Periodos: Periodo[] = [];
  
  filter!: string;
  checkboxDeshabilitarValue: boolean = false;
  restablecerEvidenciaAux!: Evidencia;

  valueFilter: string = '0';
  tablafilter!: FormGroup;

  @ViewChild('cerrarAgregarModal') cerrarAgregarModal!: ElementRef;
  @ViewChild('cerrarEditarModal') cerrarEditarModal!: ElementRef;

  agregar!: FormGroup;
  editar!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fd: FilterSidebar,
    private toastr: ToastrService,
    private evidenciaService: EvidenciaService,
    private elementoService: ElementoFundamentalService,
    private periodoService: PeriodoService,
    private Sidebar: Sidebar,
  ) {
    this.agregar = this.fb.group({
      elemento: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1024)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
    })
    this.editar = this.fb.group({
      id: ['', Validators.required],
      elemento: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1024)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
    })

    this.tablafilter = this.fb.group({
      filter: [''],
    })
  }

  ngOnInit(): void {
    this.Sidebar.actualizarActiveLiOrder1('tablas');
    this.Sidebar.actualizarActiveLiOrder2('evidencia');
    this.InitFiltro();
    this.loadEvidencia();
    this.loadElementosFundamentales();
  }

  //Load Data
  InitFiltro(){
    this.fd.actualizarFiltroDefault('evidencia');
    this.fd.getFiltro('evidencia').subscribe(
      (data) => {
        if (data) {
          this.tablafilter.get('filter')?.setValue(data);
          this.valueFilter = data;
        }
      }
    )
  }

  setElemento() {
    this.agregar.get('elemento')?.setValue(this.valueFilter);
    if(this.valueFilter != '0') this.agregar.get('elemento')?.disable();
    else this.agregar.get('elemento')?.enable();
  }

  OnChangeFilter() {
    this.valueFilter = this.tablafilter.value.filter;
    this.agregar.value.elemento = this.valueFilter;
  }

  loadEvidencia(){
    this.evidenciaService.getEvidencia().subscribe(
      (data) => {
        this.Evidencias = data;
      }
    )
  }
  
  loadElementosFundamentales(){
    this.elementoService.getElementoFundamental().subscribe(
      (data) => {
        this.Elementos = data.filter(e => e.Activo == '1');
      }
    )
  }

  // Get objects  
  getDetalleElemento(id: any): string {
    const obj = this.Elementos.find(e => e.IdElemento === id);
    const detalle = obj?.Detalle;
    return detalle && detalle.trim().length === 0 && detalle.length === 5 ? 'Indicador cuantitativo no cuenta con elemento fundamental' : (detalle ?? '');
  }
  
  setPreEditar(evidencia: Evidencia){
    this.editar.get('id')?.setValue(evidencia.IdEvidencia);
    this.editar.get('codigoEvidencia')?.setValue(evidencia.CodigoEvidencia);
    this.editar.get('elemento')?.setValue(evidencia.IdElemento);
    this.editar.get('elemento')?.disable();
    this.editar.get('detalle')?.setValue(evidencia.Detalle);
    this.editar.get('orden')?.setValue(evidencia.Orden);
  }

  //agregar
  agregarEvidencia(){
    this.agregar.get('elemento')?.enable();
    const evidencia: Evidencia = {
      IdElemento: this.agregar.value.elemento,
      CodigoEvidencia: `E-${this.agregar.value.detalle.toLowerCase().replace(" ", "").slice(0, 5)}`,
      Detalle: this.agregar.value.detalle,
      Orden: this.agregar.value.orden,
    }

    this.evidenciaService.postEvidencia(evidencia).subscribe(
      (data) => {
        this.toastr.success('La Evidencia ha sido agregado correctamente!');
        this.loadEvidencia();
        console.log(data);
      },
      (error) => {
        this.toastr.error('Error!, no se ha podido realizar los cambios');
        console.log(error);
      }
    )

    this.agregar.reset();

    if(this.cerrarAgregarModal) {
      this.cerrarAgregarModal.nativeElement.click();
    }
  }
  //editar
  editarEvidencia(){
    this.editar.get('elemento')?.enable();
    const codigo = this.Evidencias.filter(e => e.IdEvidencia == this.editar.value.id);
    const evidencia: Evidencia = {
      IdEvidencia: this.editar.value.id,
      CodigoEvidencia: codigo[0].CodigoEvidencia,
      IdElemento: this.editar.value.elemento,
      Detalle: this.editar.value.detalle,
      Orden: this.editar.value.orden,
      Activo: '1',
    }
    
    this.evidenciaService.updateEvidencia(evidencia).subscribe(
      (data) => {
        this.toastr.success('Se ha realizado los cambios correctamente!');
        this.loadEvidencia();
        console.log(data);
      },
      (error) => {
        this.toastr.error('Error!, no se ha podido realizar los cambios');
        console.log(error);
      }
    );

    this.editar.reset();
    this.editar.get('elemento')?.setValue('0');

    if (this.cerrarEditarModal) {
      this.cerrarEditarModal.nativeElement.click();
    }
  }
}
