import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComSoloComponent } from './com-solo.component';

describe('ComSoloComponent', () => {
  let component: ComSoloComponent;
  let fixture: ComponentFixture<ComSoloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComSoloComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComSoloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
