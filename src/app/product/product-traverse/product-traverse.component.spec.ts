import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTraverseComponent } from './product-traverse.component';

describe('ProductTraverseComponent', () => {
  let component: ProductTraverseComponent;
  let fixture: ComponentFixture<ProductTraverseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductTraverseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTraverseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
