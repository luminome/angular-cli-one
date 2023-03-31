import { Injectable } from '@angular/core';
import { eztext as text } from 'src/assets/ez-text/eztext.js'

@Injectable({
  providedIn: 'root'
})
export class TextService {
  
  ez: any;

  constructor() {
    const domNodeName = 'module-window';
    this.ez = text(domNodeName).init();
    this.ez.set_text('holla');
  }

}
