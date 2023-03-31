import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDefineComponent } from './product-define.component';

describe('ProductDefineComponent', () => {
  let component: ProductDefineComponent;
  let fixture: ComponentFixture<ProductDefineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductDefineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDefineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
