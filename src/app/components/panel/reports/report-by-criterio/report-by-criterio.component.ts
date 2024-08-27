import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { Sidebar } from 'src/app/services/sidebar.service';
import Chart, { ChartType } from 'chart.js/auto';
import { ReportXcriterioService } from 'src/app/services/modeloServicios/reportXcriterio.service';
import { ReporteIndicadorService } from 'src/app/services/modeloServicios/reporte-indicador.service';
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
  indicadorSeleccionado: number | null = null;
  graficaMostrada: boolean = false;
  @ViewChild('chart') chartElement!: ElementRef;
  public chart!: Chart;
  Variables: any[] = [];
  mostrarValoracion: boolean = false;
firstIndicator: any;
  selectedIndicadorId: any;
  constructor(private route: ActivatedRoute,
    private ds: Sidebar,
    private subCriterioService: SubCriteriosService,
    private indicadorService: IndicadorService,
    private reportxcriterioservice: ReportXcriterioService,
    private reporteIndicadorService: ReporteIndicadorService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.criterioDetalle = params['detalle'];
      this.getSubCriteriosPorDetalle();
    });
  }

  getSubCriteriosPorDetalle(): void {
    if (this.criterioDetalle) {
      this.subCriterioService.getByCriterioDetalle(this.criterioDetalle).subscribe((data: any[]) => {
        this.subCriterios = data;
      });
    }
  }

  onSubCriterioClick(idSubCriterio: number): void {
    // Encuentra el subcriterio seleccionado en el array
    this.subCriterioSeleccionado = this.subCriterios.find(subCriterio => subCriterio.IdSubCriterio === idSubCriterio);

    this.indicadorService.getBySubCriterio(idSubCriterio).subscribe(
      (data: Indicador[]) => {
        this.indicadores = data;
      },
      error => {
        console.error('Error al obtener los indicadores:', error);
      }
    );
  }
  getArchivosEvidencias(idIndicador: any): void {
    this.indicadorSeleccionado = idIndicador;
  
    this.indicadorService.getArchivosEvidencias(idIndicador).subscribe(
      data => {
        this.archivosEvidencias = data;
        if (this.archivosEvidencias.length > 0) {
          const totalArchivos = this.archivosEvidencias[0].TotalArchivos;
          const estado0 = this.archivosEvidencias[0].Estado0;
          const estado1 = this.archivosEvidencias[0].Estado1;
          const estado2 = this.archivosEvidencias[0].Estado2;
  
          // Crea la gráfica cuando se obtienen los datos
          this.chart = new Chart('chart', {
            type: 'bar' as ChartType,
            data: {
              labels: ['Aprobados', 'No evaluados', 'Rechazados'],
              datasets: [{
                label: 'Archivos Evidencias',
                data: [estado2, estado0, estado1], 
                backgroundColor: [
                  'rgb(34, 139, 34)', 
                  'rgb(75, 0, 130)',  
                  'rgb(139, 0, 0)'   
                ],
                borderColor: [
                  'rgb(34, 139, 34)', 
                  'rgb(75, 0, 130)', 
                  'rgb(139, 0, 0)'    
                ],
                borderWidth: 1
              }]
            },
            options: {
              maintainAspectRatio: false, 
              responsive: false,           
              scales: {
                y: {
                  beginAtZero: true,
                  max: totalArchivos,
                  ticks: {
                    stepSize: 1,
                    callback: function(value) { return Number(value).toFixed(0); }
                  }
                }
              }
            }
          });
          this.graficaMostrada = true;
        }
  });
  }
  generatePdf(detalle: any, estado: string): void {
    if (!this.chart) {
      console.error('No chart available to download.');
      return;
    }
  
    const base64Image = this.chart.toBase64Image().replace(/^data:image\/(png|jpg);base64,/, '');
    
    // Obtener las evaluaciones cualitativa y cuantitativa del indicador seleccionado
    let evaluacionTexto = '';
    let evaluacionCuantitativa = '';
  
    const indicador = this.indicadores.find(i => i.IdIndicador === this.selectedIndicadorId);
  
    if (indicador) {
      // Evaluación cualitativa
      if (indicador.IdTipoEvaluacion == '2') {
        evaluacionTexto = this.getValoracionTexto(indicador.Valoracion);
      }
      
      // Evaluación cuantitativa
      if (indicador.IdTipoEvaluacion == '1' && this.Variables.length > 0) {
        evaluacionCuantitativa = `${this.Variables[0]?.Detalle} = ${this.Variables[0]?.Valor}`;
      }
    }
  
    // Crear objeto con la información para el PDF
    const imageRequest = {
      Image: base64Image,
      Detalle: detalle,
      Estado: estado,
      CriterioDetalle: this.criterioDetalle,
      SubCriterioDetalle: this.subCriterioSeleccionado?.Detalle,
      EvaluacionTexto: evaluacionTexto,  
      EvaluacionCuantitativa: evaluacionCuantitativa  
    };
  
    this.reportxcriterioservice.generatePdf(imageRequest).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ReporteIndicador.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    }, error => {
      console.error('Error downloading PDF:', error);
    });
  }
  

  // Método para verificar si el indicador actual es el seleccionado
  isIndicadorSeleccionado(indicadorId: any): boolean {
    return this.indicadorSeleccionado === indicadorId;
  }
  getValoracionTexto(valoracion: any): string {
    switch (valoracion) {
      case 1:
        return 'Satisfactorio';
      case 2:
        return 'Cuasi-satisfactorio';
      case 3:
        return 'Poco satisfactorio';
      case 4:
        return 'Deficiente';
      default:
        return 'Desconocido';
    }
  }

  getVariables(index: any) {
    this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
      this.Variables = data;
    });
    this.selectedIndicadorId = index;
  }
}
