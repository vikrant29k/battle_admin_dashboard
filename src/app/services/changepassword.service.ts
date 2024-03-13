import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChangepasswordService {

  showOtherDiv = new EventEmitter<boolean>();
  constructor() { }
  
}
