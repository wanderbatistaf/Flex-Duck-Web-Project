import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContabilidadeComponent } from './contabilidade.component';

describe('ContabilidadeComponent', () => {
  let component: ContabilidadeComponent;
  let fixture: ComponentFixture<ContabilidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContabilidadeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContabilidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
