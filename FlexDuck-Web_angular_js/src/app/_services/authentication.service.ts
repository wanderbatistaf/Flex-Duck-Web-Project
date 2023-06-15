import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, throwError} from 'rxjs';
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

          // Extract the user_id property from the decoded token
          const user_id = decodedToken?.sub?.user_id;

          // Create a new User object with the extracted level and name properties
          const userWithLevel: User = {
            ...user,
            level: level,
            name: name,
            active: active,
            user_id: user_id,
          };

          console.log('User with Level:', userWithLevel);
          console.log('User id is:', userWithLevel.user_id);

          this.userSubject.next(userWithLevel);
          return userWithLevel;
        })
      );
  }

  checkDbConnection(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/server/status/check-connection`)
      .pipe(
        catchError(error => {
          return throwError(error);
        })
      );
  }

  updateLastLogin(userId: number): Observable<any> {
    const lastLogin = new Date();
    lastLogin.setHours(lastLogin.getHours() - 3);
    const lastLoginFormatted = lastLogin.toISOString().replace('T', ' ').substr(0, 19);
    return this.http.put(`${environment.apiUrl}/users/update/access-date/${userId}`, { last_login: lastLoginFormatted });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('access_token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
