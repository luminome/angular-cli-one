import { Component, OnInit } from '@angular/core';
import { CommunicationsService } from "src/app/shared/coms.service";

@Component({
  selector: 'app-product-coms',
  templateUrl: './product-coms.component.html',
  styleUrls: ['./product-coms.component.css']
})

export class ProductComsComponent {


  constructor(public coms: CommunicationsService) { }


  coms_obj: any = null;

  ngOnInit(): void {
    this.coms.log(['hello', 'inited'],{'state':'init'});
    this.coms.coms_obs.subscribe((ICom: any) => this.coms_obj = ICom);

  }


  hideComs() {
    this.coms_obj.visible = false;
  }

  // showError(message: string): void{
  //   this.error = true;
  //   this.errorMessage = message;
  // }

  // showNotify(message: string): void{
  //   this.notify = true;
  //   this.notifyMessage = message;
  // }

  // // Hide the error message.
  // hideError() {
  //   this.error = false;
  //   this.errorMessage = '';
  // }

  // // Hide the error message.
  // hideNotify() {
  //   this.notify = false;
  //   this.notifyMessage = '';
  // }

}
