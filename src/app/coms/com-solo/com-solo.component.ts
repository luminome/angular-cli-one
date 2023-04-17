import { Component, Input } from '@angular/core';
import { ICom } from 'src/app/entities/com/com.model';

@Component({
  selector: 'app-coms-solo',
  templateUrl: './com-solo.component.html',
  styleUrls: ['../../product/product-coms/product-coms.component.css']
})

export class ComSoloComponent{
  constructor() { }
  @Input() com: ICom | any | null;
  @Input() class: string | any | null;
  
  detail_on: boolean = false;
  detail_body: string | null = null;

  detail(){
    if(this.detail_body === null) this.detail_body = JSON.stringify(this.com, null, '\t');
    this.detail_on = !this.detail_on;
  }
}