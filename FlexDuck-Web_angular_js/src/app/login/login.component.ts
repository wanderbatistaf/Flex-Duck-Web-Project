import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {delay, first, retry} from 'rxjs/operators';

import { AuthenticationService } from '@app/_services';
import {catchError, throwError} from "rxjs";

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;
  isActive: number | boolean = false; // Property to store the value of 'active'
  isDbConnectionSuccess = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // Redirect to the home page if already logged in
    if (this.authenticationService.userValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.authenticationService.user.subscribe((user) => {
      this.isActive = user?.active || false; // Assign the value of 'active' to the isActive property
      console.log('isActive:', this.isActive);

      if (user) {
        this.router.navigateByUrl('/home'); // Redirecionar para '/home'
      }
    });

    this.checkDbConnection()
  }

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  checkDbConnection() {
    this.authenticationService.checkDbConnection()
      .subscribe(
        () => {
          // Conexão com o banco de dados OK
          this.isDbConnectionSuccess = true;
          console.log('Conectado ao banco de dados.')
        },
        (error) => {
          // Falha na conexão com o banco de dados
          this.isDbConnectionSuccess = false;
          console.log('Falha na conexão com o banco de dados.')
          if (error.status === 500) {
            this.error = 'Falha na conexão com o banco de dados.';
          }
        }
      );
  }



  onSubmit() {
    this.submitted = true;

    // Stop if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;
    this.authenticationService.login(this.f.username.value, this.f.password.value)
      .pipe(
        first(),
        // retry(100), // Tenta a solicitação novamente até 10 vezes em caso de erro
        // delay(9000), // Atraso de 9 segundos entre as tentativas
        catchError(error => {
          // Trata o erro após todas as tentativas
          this.error = error;
          this.loading = false;
          return throwError(error);
        })
      )
      .subscribe({
        next: (user) => {
          if (this.isActive) {
            // Get the return URL from route parameters or use the default '/'
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.router.navigate([returnUrl]);

            // Call the updateLastLogin function with the user's ID
            this.authenticationService.updateLastLogin(user.user_id).subscribe(() => {
              console.log('Last login updated successfully.');
            });
          } else {
            alert('O usuário está desativado. Entre em contato com o Administrador.');
          }
        },
        error: error => {
          this.error = error;
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
