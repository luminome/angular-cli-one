import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StatusService } from './shared/status.service';
import { TextService } from './shared/text.service';
import { IProduct } from './entities/product/product.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'angular-cli-one';
  message = 'Hello, World!';

  // createdProduct: IProduct | any = null;
  // selectedProduct: IProduct | any = null;

  constructor(protected statusService: StatusService, protected text: TextService) { }

  @ViewChild('productDefineComponent') productDefineComponent!: ElementRef;
  // @ViewChild(MatSort, {static: true}) 'sort': MatSort;

  // Get the server status when starting the view.
  ngOnInit() {
    this.text.ez.set_text('app.module ngOnInit configured', true);
    //this.message = this.statusService.getStatus().text;
    this.statusService
      .getStatus()
      .then((result: any) => {
        this.text.ez.set_text("status:\n"+JSON.stringify(result, null, '\t'), true);
      });
  }

  // // Get the new product created.
  // onCreatedProduct(createdProduct: IProduct) {
  //   this.createdProduct = createdProduct;
  // }

  // // Get the new product created.
  // onSelectProduct(selectedProduct: IProduct) {
  //   this.selectedProduct = selectedProduct;
  // }
  
  // // // Get the new product created.
  // // onPrepareProduct(preparingProduct: IProduct) {
  // //   console.log('module onPrepareProduct', preparingProduct);
  // //   this.preparingProduct = preparingProduct;
  // // }

}
