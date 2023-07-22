import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteModalComponent } from './cliente-modal.component';

describe('ClienteModalComponent', () => {
  let component: ClienteModalComponent;
  let fixture: ComponentFixture<ClienteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClienteModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
