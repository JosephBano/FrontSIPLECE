import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DeletePerfil, RolPerfil } from 'src/app/models/modelosSeguridad/perfil.model';
import { Usuario, UsuarioRolPeticion, UsuarioRolRespuesta } from 'src/app/models/usuario.model';
import { DataService } from 'src/app/services/data.service';
import { LoginService } from 'src/app/services/login.service';
import { PerfilService } from 'src/app/services/serviciosSeguridad/perfil.service';
import { SharedService } from 'src/app/services/serviciosSeguridad/shared.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { environment } from 'src/environments/environment.development';

const inputText = document.getElementById('nombre') as HTMLInputElement;

@Component({
  selector: 'app-shearch-users',
  templateUrl: './shearch-users.component.html',
  styleUrls: ['./shearch-users.component.css', './../admin.component.css']
})
export class ShearchUsersComponent {
  Usuarios: Usuario[] = [];
  AllPerfiles: RolPerfil[]=[
    {rol:'ASIGNAR ROL',id:-1},
    {rol:'ENCARGADO', id:1}, 
    {rol:'SUPERVISOR',id:2}, 
    {rol:'ADMIN', id:3}, 
    {rol:'SUPADMIN',id:4}
  ];
  Perfiles: RolPerfil[]=[];
  PerfilesResponce: UsuarioRolRespuesta[] = [];
  
  valueEncargadoFilter: string = '';
  valuePerfilFilter: string = '';

  mostrarUsuarios: boolean = false;
  statfilter: string = '';

  selects: FormGroup;
  disabledButton = true;
  displayPermissions = false;
  selectedValue: number | null = null;
  constructor(
    private usuarios: UsuarioService,
    private loginService: LoginService,
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private toastr: ToastrService,
    private sharedService: SharedService
  ) { 
    this.selects = this.fb.group({
      filterEncargado: new FormControl({value: '0', disabled: false}),
      filterPerfil: new FormControl({value: '0', disabled: true})
    })
    
  }

  ngOnInit(): void {
    this.loadData();
    this.sharedService.currentValue.subscribe(value => {
      if (value !== null) {
        this.selectedValue = value;
      }
    });
    this.sharedService.reload$.subscribe(reload => {
      if (reload) {
        this.reloadPermissions();
      }
    });
  }
  reloadPermissions() {
    this.displayPermissions = false;
    this.valueEncargadoFilter = this.selects.get('filterEncargado')?.value;
    this.valuePerfilFilter = this.selects.get('filterPerfil')?.value;

    if (this.valueEncargadoFilter && this.valueEncargadoFilter !== '0') {
      this.loadRolData(this.valueEncargadoFilter);
      this.OnChangePerfilFilter();
    } else {
      this.Perfiles = [];
      this.selects.get('filterPerfil')?.disable();
      this.disabledButton = true;
    }
  }

  loadData(): void {
    this.usuarios.getUsuarios().subscribe(
      (data) => {
        this.Usuarios = data;
      }
    )
  }

  loadRolData(codeUser: string): void{
    this.Perfiles=[];
    const rolRequest: UsuarioRolPeticion = {
      codigoUsuario:codeUser,
      codigoSistema: environment.NOMBRE_SISTEMA,
      codigoInstitucion: this.loginService.getTokenDecoded()['cod-institucion'],
    }
    this.usuarios.getRol(rolRequest).subscribe(data => {    
      let indice=0;
      let nivelPerfil=0;
      if(data[0].codigoPerfil===null){
        this.Perfiles.push(this.AllPerfiles[0])
      }else{
        const PerfilAsignado = data.filter(res=>this.AllPerfiles.some(all=>all.rol==res.codigoPerfil.split('-')[0]))
        const PerfilCode = this.AllPerfiles.filter(all=>data.some(res=>res.codigoPerfil.split('-')[0]==all.rol))
        PerfilCode.forEach((pc,index)=>{
          if(pc.id<nivelPerfil){
            indice=index
          }
        })
        const perfilNuevo:RolPerfil = {
          id:PerfilCode[indice].id,
          rol: PerfilAsignado[indice].codigoPerfil
        } 
        this.Perfiles.push(perfilNuevo)     
      }
    });
  }

  loadAssignableRolData(codeUser: string): void {
    this.Perfiles=[];
    const rolRequest: UsuarioRolPeticion = {
      codigoUsuario:codeUser,
      codigoSistema: environment.NOMBRE_SISTEMA,
      codigoInstitucion: this.loginService.getTokenDecoded()['cod-institucion'],
    }
    this.usuarios.getRol(rolRequest).subscribe(data => {    
      if(data.length<=1){
        if(data[0].mensaje!=null){
          this.Perfiles=this.AllPerfiles;
          return;
        } 
      }
      const PerfilAsignado = this.AllPerfiles.filter(all=>data.some(res=>all.rol==res.codigoPerfil.split('-')[0]))
      let nivelPerfil:number=0;
      
      PerfilAsignado.forEach(pa=>{
        if(pa.id>nivelPerfil){
          nivelPerfil=pa.id;
        }
      })
      if(nivelPerfil!==this.AllPerfiles.length){
        this.AllPerfiles.forEach(all=>{
          if(all.id>nivelPerfil){
            this.Perfiles.push(all)
          }
        })
      } 
    })
  }

  OnChangeEncargadoFilter() {
    this.displayPermissions = false;
    this.valueEncargadoFilter = this.selects.get('filterEncargado')?.value;
    if(this.valueEncargadoFilter!=='0') {      
      this.selects.get("filterPerfil")?.enable();
      this.selects.get("filterPerfil")?.setValue('0');
    } else {
      this.selects.get("filterPerfil")?.disable();
    }
    this.loadRolData(this.valueEncargadoFilter);
    this.OnChangePerfilFilter();
  }
  OnChangePerfilFilter() {
    this.displayPermissions = false;
    this.valuePerfilFilter = this.selects.get('filterPerfil')?.value;
        
    if(this.valuePerfilFilter === '0' || this.valueEncargadoFilter === '0') {
      this.disabledButton = true;
      this.selects.get('filterPerfil')?.setValue('')
    } else {
      this.disabledButton = false;
    }
  }

  pressTrashEncargado(){
    this.selects.get('filterEncargado')!.setValue('0'); 
    this.valueEncargadoFilter = '0'; 
    this.disabledButton = true;    
    this.displayPermissions=false;
    this.selects.get("filterPerfil")?.disable();
  }
  pressTrashPerfil(){
    console.log(this.Perfiles);
    this.Perfiles=[];
    
    this.selects.get('filterPerfil')!.setValue('0');
    this.valuePerfilFilter = '0'; 
    this.disabledButton = true;
    this.displayPermissions=false

    let codigoAd = this.selects.get('filterEncargado')?.value;

    const EliminarPerfil: DeletePerfil = {
      CodigoAd: codigoAd,
      CodigoSistema: environment.NOMBRE_SISTEMA,
      CodigoInstitucion: this.loginService.getTokenDecoded()['cod-institucion'],
    };
//llamado al servicio eliminar perfil
    try{
      
      this.perfilService.deletePerfil(EliminarPerfil.CodigoAd, EliminarPerfil.CodigoSistema, EliminarPerfil.CodigoInstitucion).subscribe(
      (data) => { 
        if(data[0]===1){
          this.toastr.success("Perfil eliminado con exito");
        }
      }
    )}catch(error) {
      this.toastr.error("Error al eliminar perfil del usuario");
    }

  }

  ChangeVisibilityUsers() {
    console.log('selected');
    this.mostrarUsuarios = true;
  }

  notIsCeroValidator(control: FormControl) {
    if (control.value === 0) {
      return { noEsCero: true };
    }
    return null;
  }  

  onSubmit() { 
    this.displayPermissions = true;
  }
}
