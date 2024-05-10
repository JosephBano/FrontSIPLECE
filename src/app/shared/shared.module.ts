import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';

//Modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

//Nav Components
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

//Componentes
import { DetalleIndicadorComponent } from './detalle-indicador/detalle-indicador.component';
import { EstadoEvidenciaComponent } from './detalle-indicador/estado-evidencia/estado-evidencia.component';
import { ModalEvidenciasComponent } from './detalle-indicador/estado-evidencia/modal-evidencias/modal-evidencias.component';
import { SelectorIndicadoresComponent } from './selector-indicadores/selector-indicadores.component';
import { IndicadorTableComponent } from '../shared/selector-indicadores/indicador-table/indicador-table.component';
import { InformacionModalComponent } from './detalle-indicador/estado-evidencia/informacion-modal/informacion-modal.component';
import { EvidenciaFileContenedorComponent } from './detalle-indicador/estado-evidencia/evidencia-file-contenedor/evidencia-file-contenedor.component';
import { AsignarUsuarioComponent } from './detalle-indicador/estado-evidencia/asignar-usuario/asignar-usuario.component';
import { UsersPipe } from './../pipes/users.pipe';
import { TablaEliminarModalComponent } from './tabla-eliminar-modal/tabla-eliminar-modal.component';
import { TablaRestablecerModalComponent } from './tabla-restablecer-modal/tabla-restablecer-modal.component';
import { BotonAtrasComponent } from './boton-atras/boton-atras.component';
import { LoadingComponent } from './loading/loading.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { NotificationsComponent } from './navbar/notifications/notifications.component';


@NgModule({
  declarations: [ 
    SelectorIndicadoresComponent,
    DetalleIndicadorComponent,
    NavbarComponent,
    NotificationsComponent,
    SidebarComponent,
    IndicadorTableComponent,
    EstadoEvidenciaComponent,
    ModalEvidenciasComponent,
    InformacionModalComponent,
    EvidenciaFileContenedorComponent,
    AsignarUsuarioComponent,
    TablaEliminarModalComponent,
    TablaRestablecerModalComponent,
    UsersPipe,
    BotonAtrasComponent,
    LoadingComponent,
    NotAuthorizedComponent,
    NotificationsComponent,
  ],
  imports: [
    SharedRoutingModule,
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    ToastrModule
  ],
  exports: [
    SelectorIndicadoresComponent,
    DetalleIndicadorComponent,
    NavbarComponent,
    SidebarComponent,
    IndicadorTableComponent,
    EstadoEvidenciaComponent,
    ModalEvidenciasComponent,
    TablaEliminarModalComponent,
    TablaRestablecerModalComponent,
    BotonAtrasComponent,
    LoadingComponent,
    UsersPipe,
  ]
})
export class SharedModule { }
