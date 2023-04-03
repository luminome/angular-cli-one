import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductComsComponent } from './product-coms.component';

describe('ProductComsComponent', () => {
  let component: ProductComsComponent;
  let fixture: ComponentFixture<ProductComsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductComsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductComsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
