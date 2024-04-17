import { Component,OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: [
    trigger('slideAnimation', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('2s ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('2s ease-in-out', style({  opacity: 0 }))
      ])
    ])
  ]
})
export class AuthComponent implements OnInit{
visible: boolean=true


ngOnInit(): void {
const loginBtn:any = document.getElementById('login'); // Select the login button

loginBtn.addEventListener('click', () => {
  const togglePanel:any = document.getElementById('panel'); // Target the toggle panel
  togglePanel.classList.toggle('active'); // Toggle the 'active' class on the toggle panel
});

}
}
