import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendedorModalComponent } from './vendedor-modal.component';

describe('VendedorModalComponent', () => {
  let component: VendedorModalComponent;
  let fixture: ComponentFixture<VendedorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendedorModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
