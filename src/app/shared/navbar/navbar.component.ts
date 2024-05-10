import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { Sidebar } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  showNotifications = false;
  strname: string = ''; 
  
  constructor(
    private toggleService: Sidebar,
    private login: LoginService,
    )
    { }

  toggle(): void {
    this.toggleService.toggle();
  }

  ngOnInit(): void {
    this.strname = this.login.getTokenDecoded().nombre;
    console.log("Token decoded",this.login.getTokenDecoded())
    
  }
  
}
