import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotasSaidaComponent } from './notas-saida.component';

describe('NotasSaidaComponent', () => {
  let component: NotasSaidaComponent;
  let fixture: ComponentFixture<NotasSaidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotasSaidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotasSaidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
