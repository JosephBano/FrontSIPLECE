import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { Sidebar } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-report-by-criterio',
  templateUrl: './report-by-criterio.component.html',
  styleUrls: ['./report-by-criterio.component.css']
})
export class ReportByCriterioComponent implements OnInit {
  
  criterioDetalle?: string;
  detalle: string = '';
  subCriterios: any[] = [];
  indicadores: Indicador[] = [];
  Indicador: Indicador[] = [];
  subCriterioSeleccionado: any = null;
  archivosEvidencias: any[] = [];

  constructor(private route: ActivatedRoute,
    private ds: Sidebar,
    private subCriterioService: SubCriteriosService,
    private indicadorService: IndicadorService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.criterioDetalle = params['detalle'];
      console.log('Detalle recibido:', this.criterioDetalle);
      this.getSubCriteriosPorDetalle();
    });
  }

  getSubCriteriosPorDetalle(): void {
    if (this.criterioDetalle) {
      this.subCriterioService.getByCriterioDetalle(this.criterioDetalle).subscribe((data: any[]) => {
        this.subCriterios = data;
        console.log('Subcriterios:', this.subCriterios);
      });
    }
  }

  onSubCriterioClick(idSubCriterio: number): void {
    // Encuentra el subcriterio seleccionado en el array
    this.subCriterioSeleccionado = this.subCriterios.find(subCriterio => subCriterio.IdSubCriterio === idSubCriterio);

    this.indicadorService.getBySubCriterio(idSubCriterio).subscribe(
      (data: Indicador[]) => {
        this.indicadores = data;
        console.log('Indicadores recibidos:', this.indicadores);
      },
      error => {
        console.error('Error al obtener los indicadores:', error);
      }
    );
  }

  getArchivosEvidencias(idIndicador: any, indicador: any): void {
    if (idIndicador === undefined) {
      console.error('IdIndicador es undefined');
      return;
    }
    this.indicadorService.getArchivosEvidencias(idIndicador).subscribe(
      data => {
        indicador.archivosEvidencias = data; // Almacena los datos específicos para el indicador
        console.log('Archivos de evidencias:', indicador.archivosEvidencias);
      },
      error => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }
}
