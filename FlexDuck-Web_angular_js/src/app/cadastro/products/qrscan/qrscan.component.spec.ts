import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrscanComponent } from './qrscan.component';

describe('QrscanComponent', () => {
  let component: QrscanComponent;
  let fixture: ComponentFixture<QrscanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QrscanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrscanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
