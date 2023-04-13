import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAssocComponent } from './product-assoc.component';

describe('ProductAssocComponent', () => {
  let component: ProductAssocComponent;
  let fixture: ComponentFixture<ProductAssocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductAssocComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductAssocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
