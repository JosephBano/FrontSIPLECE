import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Criterio } from 'src/app/models/modelos-generales/criterio.model';
import { Indicador } from 'src/app/models/modelos-generales/indicador.model';
import { ReportIndicador } from 'src/app/models/modelos-generales/report-indicador.model';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { ReporteIndicadorService } from 'src/app/services/modeloServicios/reporte-indicador.service';
import { Sidebar } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  indicadores: Indicador[] = []; 
  toggledIndex: number | null = null;
  toggledIndexCualitativo: number = -1;
  Variables: ReportIndicador[] = [];
  results: number[] = [];
  totalIndicadores: any;
  mostrarTotalIndicadores: boolean = false;
  estandarNo?: any;
  estandarPorcentaje?: number;
  indicadoresCualitativo: Indicador[] = [];
  reportCualitativos: boolean = false;
  totalIndicadoresCual: any;
  satisfactorio: any;
  CasiSatisfactorio: any;
  PocoSatisfactorio: any;
  Deficeinte: any;
  porcentajeSatisfactorio?: number;
  porcentajeCasiSatisfactorio?: number;
  porcentajePocoSatisfactorio?: number;
  porcentajeDeficiente?: number;
  mostrarTablaCriterios: boolean = false;
  criterios: Criterio[] = [];
  criteriosDetalles: any[] = [];
  criteriosConIndicadores: any[] = [];
  constructor(
    private bar: Sidebar,
    private reporteIndicadorService: ReporteIndicadorService,
    private indicadorService: IndicadorService,
    private criterioService: CriteriosService,
  ) { }

  ngOnInit(): void {
    this.bar.actualizarActiveLiOrder1('report')
    this.indicadoresCuantitativos();
    this.indicadoresCualitativos();
  }
  tablaCualitativos(){
    this.reportCualitativos = true;
  };
  indicadoresCualitativos() {
    this.totalIndicadoresCual = 0;
    this.reporteIndicadorService.getCualitativos().subscribe(data => {
      this.indicadoresCualitativo = data ? data.filter((indicador: { Activo: number; }) => indicador.Activo === 1) : [];
      this.totalIndicadoresCual = this.indicadoresCualitativo ? this.indicadoresCualitativo.length : 0; 
      this.reporteIndicadorService.getValoracionCualitativos().subscribe(data => {
        // Resetear valores
        this.satisfactorio = 0;
        this.CasiSatisfactorio = 0;
        this.PocoSatisfactorio = 0;
        this.Deficeinte = 0;
        // Procesar cada objeto de la respuesta
        data.forEach((item: any) => {
          switch(item.Valoracion) {
            case 1:
              this.satisfactorio = item.Cantidad;
              break;
            case 2:
              this.CasiSatisfactorio = item.Cantidad;
              break;
            case 3:
              this.PocoSatisfactorio = item.Cantidad;
              break;
            case 4:
              this.Deficeinte = item.Cantidad;
              break;
            default:
              console.log('Valoración desconocida');
          }
        });
        // Paso 1: Asegurarse de que totalIndicadoresCual no sea 0
        if (this.totalIndicadoresCual > 0) {
          // Paso 2: Calcular el porcentaje de cada categoría
          this.porcentajeSatisfactorio = parseFloat(((this.satisfactorio / this.totalIndicadoresCual) * 100).toFixed(2));
          this.porcentajeCasiSatisfactorio = parseFloat(((this.CasiSatisfactorio / this.totalIndicadoresCual) * 100).toFixed(2));
          this.porcentajePocoSatisfactorio = parseFloat(((this.PocoSatisfactorio / this.totalIndicadoresCual) * 100).toFixed(2));
          this.porcentajeDeficiente = parseFloat(((this.Deficeinte / this.totalIndicadoresCual) * 100).toFixed(2));
        }
      });
    });
  }
  updateValoracion(idIndicador: any, nuevaValoracion: any) {
    this.indicadorService.updateValoracion(idIndicador, nuevaValoracion).subscribe(response => {
      console.log(response);
    });
  };
  submitValoracion(idIndicador: any, nuevaValoracion: any) {
    this.updateValoracion(idIndicador, nuevaValoracion);
  }
  indicadoresCuantitativos(){
    // Inicializa totalIndicadores con un valor por defecto
    this.totalIndicadores = 0;
    // Inicializa estandarNo con un valor por defecto
    this.estandarNo = 0;

    this.reporteIndicadorService.getByTipoEvaluacion(1).subscribe(data => {
      this.indicadores = data ? data.filter((indicador: { Activo: number; }) => indicador.Activo === 1) : [];
      this.totalIndicadores = this.indicadores ? this.indicadores.length : 0; 
      this.reporteIndicadorService.getIndicadoresEvaluados().subscribe(data => {
        if (data && data.length > 0) {
          this.estandarNo = data[0].IndicadoresEvaluados ? data[0].IndicadoresEvaluados : 0;
          if (this.totalIndicadores > 0) {
            this.estandarPorcentaje = (this.estandarNo / this.totalIndicadores) * 100;
          }
        }
      });
    });
  }
generarReporteIndicadoresCuantitativos() {
  this.mostrarTotalIndicadores = true;
}
toggleCuantitativo(index: number) {
  this.toggledIndex = this.toggledIndex === index ? null : index;
}
toggleCualitativo(index: number): void {
  this.toggledIndexCualitativo = this.toggledIndexCualitativo === index ? -1 : index; 
}

getIndicador(index: number) {
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
  });
}

getFormula(indicador: Indicador) {
  if(indicador.CodigoIndicador === 'I-indic1') this.calculatePuestosTrabajo(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic2') this.calculateAnchoBanda(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic4') this.calculatePostgrado(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic5') this.calculateExpProf(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic6') this.calculateEjerProf(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic7') this.calculateTitularidad(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic8') this.calculateCarga(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic9') this.calculateRemuneracion(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic10') this.calculateRemuneracionXhora(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic11') this.calculateProgramas(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic12') this.calculateAfinidad(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic13') this.calculateAsignaturas(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic14') this.calculatePublicaciones(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic15') this.calculateAulas(indicador.IdIndicador!);
  if(indicador.CodigoIndicador === 'I-indic16') this.calculatePubliYeventos(indicador.IdIndicador!);

}
updateVariables(valor: number, idVariable: number) {
  this.reporteIndicadorService.updateVarIndicador(valor, idVariable).subscribe(response => {
    console.log(response);
  });
}

calculatePuestosTrabajo(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 2, 3 y 4
    let var2 = this.Variables.find(v => v.idVariable === 2);
    let var3 = this.Variables.find(v => v.idVariable === 3);
    let var4 = this.Variables.find(v => v.idVariable === 4);
    // Asegúrate de que las variables existen y que var3 no es 0 (para evitar la división por cero)
    if (!var2 || !var3 || !var4 || var3.Valor === 0) {
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = var2.Valor / (var3.Valor + 0.5 * var4.Valor);
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateAnchoBanda(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 6, 7, 8, 9, 10 y 11
    let var6 = this.Variables.find(v => v.idVariable === 6);
    let var7 = this.Variables.find(v => v.idVariable === 7);
    let var8 = this.Variables.find(v => v.idVariable === 8);
    let var9 = this.Variables.find(v => v.idVariable === 9);
    let var10 = this.Variables.find(v => v.idVariable === 10);
    let var11 = this.Variables.find(v => v.idVariable === 11);
    // Asegúrate de que todas las variables existen
    if (!var6 || !var7 || !var8 || !var9 || !var10 || !var11) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = var6.Valor /(0.5 * var7.Valor + 0.8 * var8.Valor + 0.4 * var9.Valor + 0.10 * var10.Valor + 0.15 * var11.Valor);
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculatePostgrado(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 12,13,14
    let var12 = this.Variables.find(v => v.idVariable === 12);
    let var13 = this.Variables.find(v => v.idVariable === 13);
    let var14 = this.Variables.find(v => v.idVariable === 14);
   
    // Asegúrate de que todas las variables existen
    if (!var12 || !var13 || !var14) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var13.Valor /var14.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};
calculateExpProf(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 15,16,17
    let var15 = this.Variables.find(v => v.idVariable === 15);
    let var16 = this.Variables.find(v => v.idVariable === 16);
    let var17 = this.Variables.find(v => v.idVariable === 17);
   
    // Asegúrate de que todas las variables existen
    if (!var15 || !var16 || !var17) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var16.Valor /var17.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateEjerProf(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 15,16,17
    let var18 = this.Variables.find(v => v.idVariable === 18);
    let var19 = this.Variables.find(v => v.idVariable === 19);
    let var20 = this.Variables.find(v => v.idVariable === 20);
    let var21 = this.Variables.find(v => v.idVariable === 21);
   
    // Asegúrate de que todas las variables existen
    if (!var18 || !var19 || !var20|| !var21) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var19.Valor /var20.Valor+var21.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateTitularidad(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 22,23,24 y 25
    let var22 = this.Variables.find(v => v.idVariable === 22);
    let var23 = this.Variables.find(v => v.idVariable === 23);
    let var24 = this.Variables.find(v => v.idVariable === 24);
    let var25 = this.Variables.find(v => v.idVariable === 25);
   
    // Asegúrate de que todas las variables existen
    if (!var22 || !var23 || !var24|| !var25) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var23.Valor /(var24.Valor+var25.Valor))*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateCarga(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 26,27,28,29
    let var26 = this.Variables.find(v => v.idVariable === 26);
    let var27 = this.Variables.find(v => v.idVariable === 27);
    let var28 = this.Variables.find(v => v.idVariable === 28);
    let var29 = this.Variables.find(v => v.idVariable === 29);
   
    // Asegúrate de que todas las variables existen
    if (!var26 || !var27 || !var28|| !var29) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = var27.Valor /(32* var28.Valor+1/2*var29.Valor);
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateRemuneracion(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 30,31,32,33 --
    let var30 = this.Variables.find(v => v.idVariable === 30);
    let var31 = this.Variables.find(v => v.idVariable === 31);
    let var32 = this.Variables.find(v => v.idVariable === 32);
    let var33 = this.Variables.find(v => v.idVariable === 33);
   
    // Asegúrate de que todas las variables existen
    if (!var30 || !var31 || !var32|| !var33) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = ((1/12)*var31.Valor) /(var32.Valor+(1/2*var33.Valor));
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateRemuneracionXhora(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 34,35,36
    let var34 = this.Variables.find(v => v.idVariable === 34);
    let var35 = this.Variables.find(v => v.idVariable === 35);
    let var36 = this.Variables.find(v => v.idVariable === 36);
    // Asegúrate de que todas las variables existen
    if (!var34 || !var35 || !var36) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = var35.Valor/var36.Valor;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateProgramas(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 37,38,39
    let var37 = this.Variables.find(v => v.idVariable === 37);
    let var38 = this.Variables.find(v => v.idVariable === 38);
    let var39 = this.Variables.find(v => v.idVariable === 39);
    // Asegúrate de que todas las variables existen
    if (!var37 || !var38 || !var39) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var38.Valor/var39.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateAfinidad(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 37,38,39
    let var40 = this.Variables.find(v => v.idVariable === 40);
    let var41 = this.Variables.find(v => v.idVariable === 41);
    let var42 = this.Variables.find(v => v.idVariable === 42);
    // Asegúrate de que todas las variables existen
    if (!var40 || !var41 || !var42) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var41.Valor/var42.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateAsignaturas(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 37,38,39
    let var43 = this.Variables.find(v => v.idVariable === 43);
    let var44 = this.Variables.find(v => v.idVariable === 44);
    let var45 = this.Variables.find(v => v.idVariable === 45);
    // Asegúrate de que todas las variables existen
    if (!var43 || !var44 || !var45) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var44.Valor/var45.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculatePublicaciones(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 46,47,48,49,50,51,52
    let var46 = this.Variables.find(v => v.idVariable === 46);
    let var47 = this.Variables.find(v => v.idVariable === 47);
    let var48 = this.Variables.find(v => v.idVariable === 48);
    let var49 = this.Variables.find(v => v.idVariable === 49);
    let var50 = this.Variables.find(v => v.idVariable === 50);
    let var51 = this.Variables.find(v => v.idVariable === 51);
    let var52 = this.Variables.find(v => v.idVariable === 52);
    // Asegúrate de que todas las variables existen
    if (!var46 || !var47 || !var48|| !var49 || !var50|| !var51 || !var52) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = ((4*var47.Valor)+(2*var48.Valor)+(1*var49.Valor))/(var50.Valor+(1/2*var51.Valor)+(1/4*var52.Valor));
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculateAulas(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 53,54,55
    let var53 = this.Variables.find(v => v.idVariable === 53);
    let var54 = this.Variables.find(v => v.idVariable === 54);
    let var55 = this.Variables.find(v => v.idVariable === 55);
   
    // Asegúrate de que todas las variables existen
    if (!var53 || !var54|| !var55 ) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = (var54.Valor/var55.Valor)*100;
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};

calculatePubliYeventos(index: number){
  this.reporteIndicadorService.getVarIndicador(index).subscribe(data => {
    this.Variables = data;
    // Encuentra las variables con los IDs 53,54,55
    let var56 = this.Variables.find(v => v.idVariable === 56);
    let var57 = this.Variables.find(v => v.idVariable === 57);
    let var58 = this.Variables.find(v => v.idVariable === 58);
    let var59 = this.Variables.find(v => v.idVariable === 59);
    let var60 = this.Variables.find(v => v.idVariable === 60);
    let var61 = this.Variables.find(v => v.idVariable === 61);
    let var62 = this.Variables.find(v => v.idVariable === 62);
    // Asegúrate de que todas las variables existen
    if (!var56 || !var57|| !var58|| !var59|| !var60|| !var61|| !var62 ) {
      console.log('Cannot calculate the formula');
      return;
    }
    // Calcula el resultado de la fórmula
    this.results[index] = ((4*var57.Valor)+(2*var58.Valor)+(1*var59.Valor))/(var60.Valor+(1/2*var61.Valor)+(1/4*var62.Valor));
    // Actualiza la primera variable con el resultado de la fórmula
    this.updateVariables(this.results[index], this.Variables[0].idVariable);
  });
};
generarPDF() {
  const cuantitativos = {
    totalIndicadores: this.totalIndicadores,
    estandarNo: this.estandarNo,
    estandarPorcentaje: this.estandarPorcentaje
  };

  const cualitativos = {
    totalIndicadoresCual: this.totalIndicadoresCual,
    satisfactorio: this.satisfactorio,
    porcentajeSatisfactorio: this.porcentajeSatisfactorio,
    CasiSatisfactorio: this.CasiSatisfactorio,
    porcentajeCasiSatisfactorio: this.porcentajeCasiSatisfactorio,
    PocoSatisfactorio: this.PocoSatisfactorio,
    porcentajePocoSatisfactorio: this.porcentajePocoSatisfactorio,
    Deficeinte: this.Deficeinte,
    porcentajeDeficiente: this.porcentajeDeficiente
  };

  const criteriosConIndicadores = this.criteriosConIndicadores;
  const reportData = { cuantitativos, cualitativos, criteriosConIndicadores };

  this.reporteIndicadorService.generarPDF(reportData).subscribe((response: Blob) => {
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.pdf';
    a.click();
  });
}
reporteGeneral(){  
  this.criterioService.getCriterios().subscribe(criterios => {
    this.criterios = criterios;
    this.reporteIndicadorService.getCriteriosDetalles().subscribe(criteriosDetalles => {
      this.criteriosDetalles = criteriosDetalles;
      
      const criteriosConIndicadoresPromesas = this.criterios.map(criterio => {
        const detallesFiltrados = this.criteriosDetalles.filter(detalle => detalle.IdCriterio === criterio.IdCriterio);
        const indicadoresUnicos = new Set(detallesFiltrados.map(detalle => detalle.IdIndicador));
        
        let contadorValidados = 0;
        const detallesPromesas = detallesFiltrados.map(detalle => 
          this.indicadorService.getByDetalle(detalle.Indicador).toPromise().then(indicadores => {
            indicadores?.forEach(indicador => {
              if (indicador.Validado == 1) {
                contadorValidados++;
              }
            });
          })
        );
        return Promise.all(detallesPromesas).then(() => {
          const numIndicadores = indicadoresUnicos.size;
          const pendientes = numIndicadores - contadorValidados;
          // Calcular porcentajes
          const porcentajeValidados = numIndicadores > 0 ? (contadorValidados / numIndicadores) * 100 : 0;
          const porcentajePendientes = numIndicadores > 0 ? (pendientes / numIndicadores) * 100 : 0;
          
          return {
            ...criterio, 
            numIndicadores,
            indicadoresValidados: contadorValidados,
            pendientes,
            porcentajeValidados: porcentajeValidados.toFixed(2), // Agregar porcentaje de validados
            porcentajePendientes: porcentajePendientes.toFixed(2) // Agregar porcentaje de pendientes
          };
        });
      });

      Promise.all(criteriosConIndicadoresPromesas).then(criteriosConIndicadores => {
        this.criteriosConIndicadores = criteriosConIndicadores;
      });

    });
  });
}
mostrarReporteGeneral() {
  this.mostrarTablaCriterios = true; 
  this.reporteGeneral();
}
evaluarIndicador(idIndicador: number) {
  this.indicadorService.updateValidado(idIndicador, true).subscribe({
    next: (response) => {
      console.log(response);
      // Aquí puedes agregar lógica adicional después de actualizar el indicador.
    },
    error: (error) => {
      console.error('Error al actualizar el indicador', error);
    }
  });
}

evaluarYObtenerFormula(index: number, i:number) {
  this.getFormula(this.indicadores.find(e=>e.IdIndicador==index)!); 
  this.evaluarIndicador(index);
  this.getIndicador(index);
  this.toggleCuantitativo(-1);
}

}