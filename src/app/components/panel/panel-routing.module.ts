import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablasComponent } from './tablas/tablas.component';
import { MenuTablasComponent } from './tablas/menu-tablas/menu-tablas.component';
import { CriterioComponent } from './tablas/criterio/criterio.component';
import { SubCriterioComponent } from './tablas/sub-criterio/sub-criterio.component';
import { IndicadoresComponent } from './tablas/indicadores/indicadores.component';
import { ElementoFundamentalComponent } from './tablas/elemento-fundamental/elemento-fundamental.component';
import { EvidenciaComponent } from './tablas/evidencia/evidencia.component';
import { CheckManagerComponent } from './check-manager/check-manager.component';
import { TablaIndicadoresComponent } from './check-manager/tabla-indicadores/tabla-indicadores.component';
import { EvidenciasComponent } from './evidencias/evidencias.component';
import { SelectorComponent } from './evidencias/selector/selector.component';
import { DetalleIndicadorComponent } from 'src/app/shared/detalle-indicador/detalle-indicador.component';
import { AsignarEncargadosComponent } from './asignar-encargados/asignar-encargados.component';
import { SelectAEComponent } from './asignar-encargados/select-ae/select-ae.component';
import { adminGuard, encargadoGuard, supervisorGuard } from 'src/app/helpers/auth.guard';
import { AdminComponent } from './admin/admin.component';
import { ReportsComponent } from './reports/reports.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AddUsuarioComponent } from './usuarios/add-usuario/add-usuario.component';
import { MenuUsuarioComponent } from './usuarios/menu-usuario/menu-usuario.component';
import { UsuariosListComponent } from './usuarios/usuarios-list/usuarios-list.component';
import { ReportByCriterioComponent } from './reports/report-by-criterio/report-by-criterio.component';



const routes: Routes = [
  { path: '', component: EvidenciasComponent, children: [
    { path: '', component: SelectorComponent},
    { path: 'indicador-evidencia/:id', component: DetalleIndicadorComponent},
  ]},
  { path: 'administrar', component: AdminComponent, canActivate: [adminGuard] },

  {path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard], children: [
    { path: 'menuUsuario', component: MenuUsuarioComponent},
    { path: 'addUsuario', component: AddUsuarioComponent},
    { path: 'usuariosList', component: UsuariosListComponent},
  ]},
  { path: 'tablas', component: TablasComponent, canActivate: [encargadoGuard],children: [
    { path: '', component: MenuTablasComponent},
    { path: 'criterio', component: CriterioComponent},
    { path: 'subcriterio', component: SubCriterioComponent},
    { path: 'indicador', component: IndicadoresComponent},
    { path: 'elementos', component: ElementoFundamentalComponent},
    { path: 'evidencia', component: EvidenciaComponent},
  ]},
  { path: 'encargado', component: AsignarEncargadosComponent, canActivate: [encargadoGuard], children: [
    { path: '', component: SelectAEComponent},
    { path: 'asignar-usuarios/:id', component: DetalleIndicadorComponent},
  ]},
  { path: 'supervisor', component: CheckManagerComponent, canActivate: [supervisorGuard], children: [
    { path: '', component: TablaIndicadoresComponent},
    { path: 'revision-evidencia/:id', component: DetalleIndicadorComponent},                                        
  ]},
  { path: 'reportes', component: ReportsComponent, canActivate:[supervisorGuard]},
  { 
    path: 'reporteCriterio', 
    component: ReportByCriterioComponent, 
    canActivate: [supervisorGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  
  exports: [RouterModule]
})
export class PanelRoutingModule { }
