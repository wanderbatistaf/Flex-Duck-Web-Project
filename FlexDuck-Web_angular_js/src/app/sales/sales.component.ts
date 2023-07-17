import { Component, OnInit, ElementRef } from '@angular/core';
import { Payments } from '@app/_models';
import { PaymentsService } from '@app/_services';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})


export class SalesComponent implements OnInit {
  constructor() {
  }

// Executa ao inicializar o componente
  ngOnInit() {
  }
}
