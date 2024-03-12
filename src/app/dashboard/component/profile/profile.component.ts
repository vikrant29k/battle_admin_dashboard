import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Route, Router } from '@angular/router';
import { environment } from 'src/environment/enviroment';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  @ViewChild('angularEditor') editor!: ElementRef;
  // content:any;
  // title:any
  newsContent = new FormGroup({
    content: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });

  ngOnInit(): void {}
}
