import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasEntradaComponent } from './notas-entrada.component';

describe('NotasEntradaComponent', () => {
  let component: NotasEntradaComponent;
  let fixture: ComponentFixture<NotasEntradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotasEntradaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotasEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
