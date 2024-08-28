import { Injectable } from '@angular/core';
import { CriteriosService } from './modeloServicios/criterios.service';
import { SubCriteriosService } from './modeloServicios/sub-criterios.service';
import { IndicadorService } from './modeloServicios/indicador.service';
import { ElementoFundamentalService } from './modeloServicios/elemento-fundamental.service';
import { EvidenciaService } from './modeloServicios/evidencia.service';
import { Criterio } from '../models/modelos-generales/criterio.model';
import { toArray, filter } from 'rxjs/operators';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private loginService: LoginService,
  ) { }

  formatoCadena(cadena: string): string {
    const primeros = cadena.slice(0, 2);
    const ultimos = cadena.slice(-2);
    return primeros + ultimos;
  }

  nombrePerfil(): string {
    const perfil = this.loginService.getTokenDecoded().perfil;
    const nombre = perfil.split('-');
    return nombre[0];
  }

  formatName(str: string | undefined) {
    return str?.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }).replace(/\./g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()).join(" ");
  }

}
