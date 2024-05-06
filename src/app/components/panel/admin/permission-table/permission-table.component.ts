import { Component, Input } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { CriteriosService } from 'src/app/services/modeloServicios/criterios.service';
import { AddPermiso, PermisoPeticion, PermisoRespuesta, UpdatePermiso } from 'src/app/models/modelosSeguridad/perfil.model';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment.development';
import { ModeloService } from 'src/app/services/serviciosSeguridad/modelo.service';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { NodoArbol, ListaPermisoRespuesta, NodoFlat, DeletePermiso } from 'src/app/models/modelosSeguridad/permission.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubCriteriosService } from 'src/app/services/modeloServicios/sub-criterios.service';
import { IndicadorService } from 'src/app/services/modeloServicios/indicador.service';
import { ElementoFundamentalService } from 'src/app/services/modeloServicios/elemento-fundamental.service';
import { EvidenciaService } from 'src/app/services/modeloServicios/evidencia.service';
import { ToastrService } from 'ngx-toastr';
import { ListaPermisoPeticion, PermisosPeticion } from 'src/app/models/modelosSeguridad/permission.model';
@Component({
  selector: 'app-permission-table',
  templateUrl: './permission-table.component.html',
  styleUrls: ['./permission-table.component.css']
})
export class PermissionTableComponent {
  @Input() IdRol?:string;
  @Input() IdUser?:string;
  permisoParams?: PermisoPeticion;
  assignablePermissions: ListaPermisoRespuesta[] = new Array<ListaPermisoRespuesta>();
  mePermissions: PermisoRespuesta[] = new Array<PermisoRespuesta>();
  menuList:NodoArbol[]=[];
  disabledButton=true;
  addPermissions: string[] = [];
  addPermissionsList: string = '';
  permissionForm: FormGroup;
  newPermission=true;
  updatePermission=true;
  selectedItems: ListaPermisoRespuesta[] = [];
  permisosPeticion: PermisosPeticion[]= [];
  ListCodigoOpciones: string[] = [];  
  padresData: { [key: string]: any } = {};
  // Remove the duplicate declaration of 'EliminarPermisos'
  // EliminarPermisos: DeletePermiso[] = [];

  
  constructor(
    private criterioService: CriteriosService,
    private subcriterioService: SubCriteriosService,
    private indicadorService: IndicadorService,
    private elementoFundamentalService: ElementoFundamentalService,
    private evidenciaService: EvidenciaService,
    private loginService: LoginService,
    private perfilService: PerfilService,
    private modeloService: ModeloService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.permissionForm = this.fb.group({
      selectedRolOption: 'ENCARGADO',
      listPermision: ''
    })
  }

  ngOnInit(){
    this.permisoParams = {
      codigoModelo: this.loginService.getTokenDecoded().modelo,
      codigoPerfil: '',
      codigoEstado: 'A',
      codigoSistema: environment.NOMBRE_SISTEMA
    }
    this.loadUserData()
  }

  loadUserData(){
    if(this.IdRol!=='ASIGNAR ROL'){  
      this.updatePermission=true;
      this.newPermission=false; 
      this.permisoParams!.codigoPerfil=this.IdRol!;
      this.permissionForm.get('selectedRolOption')?.setValue(this.IdRol);
      const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data=>data);
      const data$ = this.modeloService.getModeloByCode(this.permisoParams?.codigoModelo!).pipe(
        switchMap((data)=>{
          const component$ = this.criterioService.getAllByModelo(data.idModelo!).pipe(data=>data);
          return forkJoin([component$])
        }
      ))
      forkJoin([permission$, data$]).subscribe(([permissionData, [componentData]]) => {
        const listBasicPermission = componentData.filter(c=>permissionData.some(p=>c.Codigo===p.codigoPermiso))
        this.assignablePermissions = componentData.filter(l=>listBasicPermission.some(p=>l.Codigo===p.Codigo));   
        this.getPermissionBasic(this.selectedItems,componentData)
        let permisos: PermisosPeticion = {  
          codigoModelo: this.permisoParams?.codigoModelo!,
          codigoPerfil: this.permisoParams!.codigoPerfil,
          codigoEstado: 'A'
        };
        
        this.perfilService.getPermisosByCodigoPerfil(permisos.codigoModelo, permisos.codigoPerfil, permisos.codigoEstado).subscribe((data: PermisoRespuesta[]) => {
          this.mePermissions = data;
          this.mePermissions.forEach(mp=>{
            const item = componentData.find(ap=>ap.Codigo===mp.codigoPermiso);
            if (item) {
              this.selectedItems.push(item);
              this.getPadres(item.Codigo).subscribe((data)=>{
                if (item.Codigo) {
                  this.padresData[item.Codigo] = data; // Almacena los datos en la clave correspondiente
                }
              })
            }
          })
          // Filtrar los elementos de assignablePermissions que ya están en selectedItems
          this.assignablePermissions = this.assignablePermissions.filter(assignableItem => !this.selectedItems.some(selectedItem => selectedItem.Codigo === assignableItem.Codigo));
          this.getUserData();
          
        });
      })    
    }else{
      this.updatePermission=false;
      // Aqui asigna y crea un perfil con un rol
      const permission$ = this.perfilService.getPermisos(this.permisoParams!).pipe(data=>data);
      const data$ = this.modeloService.getModeloByCode(this.permisoParams?.codigoModelo!).pipe(
        switchMap((data)=>{
          const component$ = this.criterioService.getAllByModelo(data.idModelo!).pipe(data=>data);
          return forkJoin([component$])
        }
      ));  
      forkJoin([permission$, data$]).subscribe(([permissionData, [componentData]]) => {
        // console.log("Component data",componentData);
        // console.log("Permission data",permissionData);
        const listBasicPermission = componentData.filter(c=>permissionData.some(p=>c.Codigo===p.codigoPermiso))
        this.assignablePermissions=listBasicPermission;      
        this.getPermissionBasic(this.selectedItems,componentData)
        this.getUserData()
      });
    }
  } 

  getPermissionBasic(list: ListaPermisoRespuesta[],all: ListaPermisoRespuesta[]){
    const noDelete: ListaPermisoRespuesta[]=[]
    list.forEach(l=>{
      if(l.Padre!==null){
        all.forEach(a=>{
          if(noDelete.length===0 && l.Padre===a.Codigo){
            noDelete.push(a)
          }
          else{
            noDelete.forEach(r=>{
              if(l.Padre===a.Codigo && r.Codigo!==a.Codigo){
                noDelete.push(a)
              }
            })
          }
        })
      }
    })
    const res:ListaPermisoRespuesta[] = list.filter(l=>!noDelete.some(nd=>l.Codigo===nd.Codigo))
    this.assignablePermissions = all.filter(c=>!res.some(p=>c.Codigo===p.Codigo))
  }

  getUserData(){
    this.menuList=[]
    this.assignablePermissions.forEach(ap=>{
      this.getPadre(ap);
      this.getHijo(ap);
    })
    this.dataSource.data = this.menuList;
  }

  getPadre(item: ListaPermisoRespuesta){
    if(item.Codigo?.includes('C-',0) && !item.Codigo?.includes('C-',1))
      this.menuList.push(this.createNuevoNodo(item))
  }
  getPadres(dato: any): Observable<any> {
    switch(true){
      case dato.includes('SC-',0) && !dato.includes('SC-',1):
        return this.subcriterioService.getFather(dato); 
      case dato.includes('I-',0) && !dato.includes('I-',1):
        return this.indicadorService.getFather(dato); 
      case dato.includes('EF-',0) && !dato.includes('EF-',1):
        return this.elementoFundamentalService.getFather(dato); 
      case dato.includes('E-',0) && !dato.includes('E-',1):   
        return this.evidenciaService.getFather(dato);
      default:
        return of();  
    }
  }
  getHijo(item: ListaPermisoRespuesta){
    switch(item.Codigo!==null){
      case item.Codigo?.includes('SC-',0) && !item.Codigo?.includes('SC-',1):
        this.menuLv2(item,this.menuList)
        break;
      case item.Codigo?.includes('I-',0) && !item.Codigo?.includes('I-',1):
        this.menuLv3(item,this.menuList)
        break;
      case item.Codigo?.includes('EF-',0) && !item.Codigo?.includes('EF-',1):
        this.menuLv4(item,this.menuList)
        break;
      case item.Codigo?.includes('E-',0) && !item.Codigo?.includes('E-',1):
        this.menuLv5(item,this.menuList)
        break;
      default:
        break;
    }
  }

  menuLv2(item:ListaPermisoRespuesta, menuList: NodoArbol[]){  
    menuList.forEach(m=>{
      if(m.value.Codigo===item.Padre){
        m.children?.push(this.createNuevoNodo(item));
      }
    });
  }
  menuLv3(item:ListaPermisoRespuesta, menuList:NodoArbol[]){
    menuList.forEach(m=>{
      this.menuLv2(item,m.children!)
    })
  }
  menuLv4(item:ListaPermisoRespuesta, menuList:NodoArbol[]){
    menuList.forEach(m=>{
      this.menuLv3(item,m.children!)
    })
  }
  menuLv5(item:ListaPermisoRespuesta, menuList:NodoArbol[]){
    menuList.forEach(m=>{
      this.menuLv4(item,m.children!)
    })
  }

  createNuevoNodo(value: ListaPermisoRespuesta):NodoArbol {
    const nuevoNodo: NodoArbol = {
      value:value,
      children: []
    }
    return nuevoNodo;
  }

  
  childElement(elementCode: string) {
    this.disabledButton=false
    const res=this.addPermissions.find(ap=>ap===elementCode);
    if(res===undefined){
      this.addPermissions.push(elementCode);
      this.permissionForm.get('listPermision')?.setValue(this.addPermissionsList);
    }
    const selectedItemIndex = this.assignablePermissions.findIndex(item => item.Codigo === elementCode);
  if (selectedItemIndex !== -1) {
    this.selectedItems.push(this.assignablePermissions[selectedItemIndex]);
    const children = this.recorrerTodosLosHijos(this.menuList, elementCode);
    this.selectedItems.push(...children);
    this.assignablePermissions = this.assignablePermissions.filter(item => !this.selectedItems.includes(item));
    this.getUserData();
  }
  }
  
  removeChildElement(elementCode: string) {
    const selectedItem = this.selectedItems.find(item => item.Codigo === elementCode);
    if (selectedItem) {
      const selectedItemIndex = this.selectedItems.findIndex(item => item.Codigo === elementCode);
      if (selectedItemIndex !== -1) {
        this.assignablePermissions.push(this.selectedItems[selectedItemIndex]);
        const children = this.recorrerTodosLosHijos(this.menuList, elementCode);
        this.assignablePermissions.push(...children);
        this.selectedItems = this.selectedItems.filter(item => !this.assignablePermissions.includes(item));
      }
  
      
      const EliminarPermisos: DeletePermiso = {
        usuarioPerfil: `${this.permisoParams!.codigoPerfil}`,
        idOpciones: `${this.mePermissions[0].codigoRol}=${selectedItem.Codigo}`
      };
  //llamado al servicio eliminar permiso perfil
      try{
        
        this.perfilService.deletePermisos(EliminarPermisos.usuarioPerfil, EliminarPermisos.idOpciones).subscribe(
        (data) => { 
          if(data[0]===1){
            this.toastr.success("Permisos eliminados con exito");
          }
        }
      )}catch(error) {
        this.toastr.error("Error al eliminar permisos del usuario");
      }
  
      this.getUserData();
    }
  }
  onSubmit() { 
    const observables=this.addPermissions.map(ap=>{
      switch(ap!==null){
        case ap.includes('C-',0) && !ap.includes('C-',1):        
          return this.criterioService.getChild(ap);
        case ap.includes('SC-',0) && !ap.includes('SC-',1):
          const scC$ = this.subcriterioService.getChild(ap).pipe(sc=>sc);     
          const scF$ = this.subcriterioService.getFather(ap).pipe(sc=>sc); 
          return forkJoin([scC$,scF$]);
        case ap.includes('I-',0) && !ap.includes('I-',1):
          const iC$ = this.indicadorService.getChild(ap).pipe(i=>i)     
          const iF$ = this.indicadorService.getFather(ap).pipe(i=>i) 
          return forkJoin([iC$,iF$]);
        case ap.includes('EF-',0) && !ap.includes('EF-',1):
          const efC$ = this.elementoFundamentalService.getChild(ap).pipe(ef=>ef)     
          const efF$ = this.elementoFundamentalService.getFather(ap).pipe(ef=>ef) 
          return forkJoin([efC$,efF$]);
        case ap.includes('E-',0) && !ap.includes('E-',1):   
          return this.evidenciaService.getFather(ap);
        default:
          return
      }
    })
    forkJoin(observables).subscribe(results => {
      results.forEach(result => {
        if (Array.isArray(result) && result.length === 2) {
          const [listChild, listFather] = result;
          this.addPermissions.push(...listChild[0].listP.split(','))
          this.addPermissions.push(...listFather[0].listP.split(','))
        } else if (Array.isArray(result) && result.length === 1) {
          const listChild = result[0];
          this.addPermissions.push(...listChild.listP.split(','))
        }
      });
      
      this.addPermissions.forEach((r,i:number)=>{       
        if(i===0){
          this.addPermissionsList+=r+',';
        }else{
          this.addPermissionsList=this.combinarCadenas(r,this.addPermissionsList);
        }
      })
        const addPermiso: AddPermiso = {
          CodigoPerfil:this.permissionForm.get('selectedRolOption')?.value,
          CodigoUsuario:this.IdUser!,
          CodigoInstitucion:this.loginService.getTokenDecoded()['cod-institucion'],
          CodigoSistema: this.loginService.getTokenDecoded().sistema,
          ListCodigoOpciones: this.selectedItems.map(si=>si.Codigo).join(',')
        }
        try{
          this.perfilService.addPermisos(addPermiso).subscribe(data=>{
            if(data[0]===1){
              this.toastr.success("Permisos agregados con exito");
            }
          });
        }catch(error){ 
          this.toastr.error("Error al asignar permisos al usuario");
        }
    });
  }
  onUpdate() { 
    this.loadUserData();
    const _updatePermiso: UpdatePermiso = {
      UsuarioPerfil: this.IdRol!,
      ListCodigoOpciones: this.addPermissions.join(','),
     
    }
    this.selectedItems=[];
    try{
      this.perfilService.updatePermisos(_updatePermiso).subscribe(
        (data) => {
          
          if(data[0]===1){
            this.toastr.success("Permisos actualizados con exito");
          }
      });
    }catch(error){
      this.toastr.error("Error al actualizar permisos del usuario");
    }
  }

  combinarCadenas(cadena1: string, cadena2: string): string {  
    if(cadena1===undefined || cadena2===undefined){
      if(cadena1===undefined){
        return cadena2;
      }
      if(cadena2===undefined){
        return cadena1;
      }
    } else {
      const arreglo1 = cadena1.split(',');
      const arreglo2 = cadena2.split(',');
      const conjunto = new Set([...arreglo1, ...arreglo2]);
      const cadenaCombinada = Array.from(conjunto).join(',');
      return cadenaCombinada;
    }
    return '';
  }

  obtenerTodosLosHijos(nodo: NodoArbol): ListaPermisoRespuesta[] {
    const todosLosHijos: ListaPermisoRespuesta[] = [];

    const recorrer = (nodo: NodoArbol) => {
      todosLosHijos.push(nodo.value);
      if (nodo.children) {
          for (const child of nodo.children) {
              recorrer(child);
          }
      }
    };

    return todosLosHijos;
  }

  recorrerTodosLosHijos(nodos: NodoArbol[], code:string): ListaPermisoRespuesta[] {
    let todosLosHijos: ListaPermisoRespuesta[] = [];

    const recorrer = (nodos: NodoArbol[]) => {
      for (const nodo of nodos) {
        
        if(nodo.value.Codigo===code){
          
          todosLosHijos = this.obtenerTodosLosHijos(nodo)
        }
        if (nodo.children) {
            recorrer(nodo.children);
        }
      }
    };
    
    recorrer(nodos);
    return todosLosHijos;
  }
  searchChilds(code: string){
    this.recorrerTodosLosHijos(this.menuList,code)
  }

  /********************************************/
  private _transformer = (node: NodoArbol, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      value:node.value,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<NodoFlat>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: NodoFlat) => node.expandable;
}