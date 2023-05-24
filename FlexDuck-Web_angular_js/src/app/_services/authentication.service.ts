import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('user')!)
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        map((user) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('access_token', user.access_token);

          // Decode the JWT token to extract information
          const decodedToken: any = jwt_decode(user.access_token);
          console.log('Decoded Token:', decodedToken);

          // Extract the level property from the decoded token
          const level = decodedToken?.sub?.level;

          // Set the name property with an appropriate value
          const name = decodedToken?.sub?.name;

          // Extract the status property from the decoded token
          const active = decodedToken?.sub?.active;

          // Create a new User object with the extracted level and name properties
          const userWithLevel: User = {
            ...user,
            level: level,
            name: name,
            active: active,
          };

          console.log('User with Level:', userWithLevel);

          this.userSubject.next(userWithLevel);
          return user;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('access_token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
