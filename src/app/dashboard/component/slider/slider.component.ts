import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent {
  showMenu:boolean=true
  constructor(private route:Router){

  }
  goToRoute(name:string){
    this.route.navigate(['/','dashboard',name]);

  }
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
