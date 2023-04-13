import { Component, Input, OnInit } from '@angular/core';
import { CommunicationsService } from "src/app/shared/coms.service";
import { Com, ICom } from 'src/app/entities/com/com.model';

@Component({
  selector: 'app-product-coms',
  templateUrl: './product-coms.component.html',
  styleUrls: ['./product-coms.component.css']
})

export class ProductComsComponent {

  constructor(public coms: CommunicationsService) { }

  coms_obj: ICom[] | any = [];
  coms_history: ICom[] = [];

  coms_new: boolean = false;

  ngOnInit(): void {
    // this.coms.log('session started',{'state':'init'});
    this.coms.coms_obs.subscribe((ICom: ICom|any) => this.showComs(ICom));
    this.coms.coms_history.subscribe((IComs: ICom[]|any) => this.procComsHistory(IComs));
  }

  procComsHistory(IComs:ICom[]|any): void{
    this.coms_history = IComs;
    this.coms_obj = this.coms_history;//.reverse();
  }

  showComs(obj:ICom) {
    if(!this.coms_history.includes(obj)) this.coms_history.unshift(obj);
    this.coms_obj = [obj];
    this.coms_new = true;
  }

  hideComs() {
    this.coms_new = false;
  }
  
  showComsHistory(active:boolean | any): void{
    if(active){
      this.coms.get();
    }else{
      this.coms_obj = [this.coms_history[0]];
    }
  }
}
