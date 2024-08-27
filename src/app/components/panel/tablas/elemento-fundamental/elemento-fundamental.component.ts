import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ElementoFundamental } from '../../../../models/modelos-generales/elemento-fundamental.model';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { ElementoFundamentalService } from '../../../../services/modeloServicios/elemento-fundamental.service';
import { Ponderacion } from '../../../../models/modelos-generales/ponderacion.model';
import { PonderacionService } from 'src/app/services/modeloServicios/ponderacion.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import { FilterSidebar } from 'src/app/services/filter-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-elemento-fundamental',
  templateUrl: './elemento-fundamental.component.html',
  styleUrls: ['./elemento-fundamental.component.css', '../../panel.component.css']
})
export class ElementoFundamentalComponent implements OnInit{
Elementos: ElementoFundamental[] = [];
  Indicadores: Indicador[] = [];
  Ponderaciones: Ponderacion[] = [];
  
  filter!: string;
  checkboxDeshabilitarValue: boolean = false;
  restablecerElementoAux!: ElementoFundamental;

  valueFilter: string = '0';
  tablafilter!: FormGroup;

  @ViewChild('cerrarAgregarModal') cerrarAgregarModal!: ElementRef;
  @ViewChild('cerrarEditarModal') cerrarEditarModal!: ElementRef;

  agregar!: FormGroup;
  editar!: FormGroup;

  mostrarElementos: boolean = true;
  IdTipoEvaluacion: any;
  constructor(
    private fb: FormBuilder,
    private fd: FilterSidebar,
    private router: Router,
    private toastr: ToastrService,
    private Sidebar: Sidebar,
    private elementoService: ElementoFundamentalService,
    private indicadorService: IndicadorService,
    private ponderacionService: PonderacionService,
  ) {
    this.agregar = this.fb.group({
      indicador: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      ponderacionAdd: ['', Validators.required],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1024)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
    })
    this.editar = this.fb.group({
      id: ['', Validators.required],
      indicador: ['0', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
      ponderacionEdit: ['', Validators.required],
      detalle: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1024)]],
      orden: ['', [Validators.required, Validators.pattern(/^[-?]?[1-9]+$/)]],
    })

    this.tablafilter = this.fb.group({
      filter: [''],
    })
  }

  ngOnInit(): void {
    this.Sidebar.actualizarActiveLiOrder1('tablas');
    this.Sidebar.actualizarActiveLiOrder2('elemento');
    this.InitFiltro();
    this.loadElementosFundamentales();
    this.loadIndicadores();
    this.loadPonderaciones();
  }

  //Load Data
  InitFiltro(){
    this.fd.actualizarFiltroDefault('elemento');
    this.fd.getFiltro('elemento').subscribe(
      (data) => {
        if (data) {
          this.tablafilter.get('filter')?.setValue(data);
          this.valueFilter = data;
        }
      }
    )
  }

  setIndicador() {
    this.agregar.get('indicador')?.setValue(this.valueFilter);
    if(this.valueFilter != '0') this.agregar.get('indicador')?.disable();
    else this.agregar.get('indicador')?.enable();
    this.indicadorService.getIndicadorById(this.valueFilter).subscribe(data => {
      if (data && data.length > 0) {
        const selectedIndicador = data[0];
        this.IdTipoEvaluacion = selectedIndicador.IdTipoEvaluacion;
          if (data[0].IdTipoEvaluacion == '1') {
              this.mostrarElementos = false;
          } else {
              this.mostrarElementos = true;
          }
      } else {
      }
  });
  }

  navegarFiltro(id: string | undefined) {
    const value = id ?? '';
    this.fd.actualizarFiltro('evidencia', value);
    this.router.navigate(['/panel/tablas/evidencia'])
  }

  OnChangeFilter() {
    this.valueFilter = this.tablafilter.value.filter;
    this.agregar.value.indicador = this.valueFilter;
  }
  
  loadIndicadores(){
    this.indicadorService.getIndicador().subscribe(
      (data) => {
        this.Indicadores = data.filter(e => e.Activo == '1');
      }
    )
  }
  
  loadElementosFundamentales(){
    this.elementoService.getElementoFundamental().subscribe(
      (data) => {
        this.Elementos = data;
      }
    )
  }

  loadPonderaciones(){
    this.ponderacionService.getPonderacion().subscribe(
      (data) => {
        this.Ponderaciones = data;
      }
    )
  }

  // Get objects  
  getDetalleIndicador(id: any){
    const obj = this.Indicadores.find(e => e.IdIndicador === id);
    return obj?.Detalle;
  }

  getDetallePonderacion(id: any){
    const obj = this.Ponderaciones.find(e => e.IdPonderacion === id);
    return obj?.Detalle;
  }

  setPreEditar(elemento: ElementoFundamental){
    this.editar.get('id')?.setValue(elemento.IdElemento);
    this.editar.get('indicador')?.setValue(elemento.IdIndicador);
    this.editar.get('indicador')?.disable();
    this.editar.get('ponderacionEdit')?.setValue(elemento.IdPonderacion);
    this.editar.get('detalle')?.setValue(elemento.Detalle);
    this.editar.get('orden')?.setValue(elemento.Orden);
  }

  //agregar
  agregarElemento() {
    const indicadorId = this.agregar.get('indicador')?.value;
    const selectedIndicador = this.Indicadores.find(indicador => indicador.IdIndicador == indicadorId);
    let elemento: ElementoFundamental;
  
    if (selectedIndicador && selectedIndicador.IdTipoEvaluacion == '1') {
      elemento = {
        CodigoElementoFundamental: `EF-${this.agregar.value.detalle.toLowerCase().replace(" ", "").slice(0, 5)}`,
        IdIndicador: indicadorId,
        IdPonderacion: '1',
        Detalle: '      ',
        Orden: '1',
      };
    } else {
      elemento = {
        CodigoElementoFundamental: `EF-${this.agregar.value.detalle.toLowerCase().replace(" ", "").slice(0, 5)}`,
        IdIndicador: this.agregar.value.indicador,
        IdPonderacion: this.agregar.value.ponderacionAdd,
        Detalle: this.agregar.value.detalle,
        Orden: this.agregar.value.orden,
      };
    }
  
    this.elementoService.postElementoFundamental(elemento).subscribe(
      (data) => {
        this.toastr.success('El Elemento Fundamental ha sido agregado correctamente!');
        this.loadElementosFundamentales();
        this.agregar.reset(); // Si decides resetear, asegúrate de que los campos tengan valores válidos
        this.agregar.updateValueAndValidity(); // Asegúrate de que la validez se actualice después de resetear
  
        if (this.cerrarAgregarModal) {
          this.cerrarAgregarModal.nativeElement.click();
        }
      },
      (error) => {
        this.toastr.error('Error!, no se ha podido realizar los cambios');
        console.log(error);
      }
    );
  }

  
  //editar
  editarElemento(){
    this.editar.get('indicador')?.enable();
    const codigo = this.Elementos.filter(e => e.IdElemento == this.editar.value.id);
    const elemento: ElementoFundamental = {
      IdElemento: this.editar.value.id,
      CodigoElementoFundamental: codigo[0].CodigoElementoFundamental,
      IdIndicador: this.editar.value.indicador,
      IdPonderacion: this.editar.value.ponderacionEdit,
      Orden: this.editar.value.orden,
      Detalle: this.editar.value.detalle,
      Activo: '1',
    }
    
    this.elementoService.updateElementoFundamental(elemento).subscribe(
      (data) => {
        this.toastr.success('Se ha realizado los cambios correctamente!');
        this.loadElementosFundamentales();
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
  onIndicadorChange(event: any): void {
    const selectedIndicadorId = event.target.value;
    const selectedIndicador = this.Indicadores.find(indicador => indicador.IdIndicador == selectedIndicadorId);
    this.IdTipoEvaluacion = selectedIndicador ? selectedIndicador.IdTipoEvaluacion : null;
    if (selectedIndicador && selectedIndicador.IdTipoEvaluacion == '1') {
      this.mostrarElementos = false;
    } else {
      this.mostrarElementos = true;
    }
  }

  // Método para verificar si el botón debe estar habilitado
  isButtonDisabled(): boolean {
    return this.agregar.invalid && this.IdTipoEvaluacion !== 1;
  }
  verificarDetalle(detalle: any): string {
    return detalle.trim().length === 0 && detalle.length === 5 ? 'Indicador cuantitativo no cuenta con elemento fundamental' : detalle;
  }
}
