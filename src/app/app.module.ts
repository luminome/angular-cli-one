import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProductComsComponent } from './product/product-coms/product-coms.component';
import { ProductListComponent } from './product/product-list/product-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductTraverseComponent } from './product/product-traverse/product-traverse.component';
import { ProductDefineComponent } from './product/product-define/product-define.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ProductCreateFormComponent } from './product/product-create-form/product-create-form.component';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, } from '@angular/material/core';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomChangedDirective } from './dom.changed.directive';
import { ComSoloComponent } from './coms/com-solo/com-solo.component';



@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductCreateFormComponent,
    ProductTraverseComponent,
    ProductDefineComponent,
    DomChangedDirective,
    ProductComsComponent,
    ComSoloComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatSortModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatChipsModule,
    DragDropModule,
    MatButtonToggleModule,
    MatListModule,
    MatTooltipModule
  ],



  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'} },
    importProvidersFrom([BrowserModule, BrowserAnimationsModule])
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
