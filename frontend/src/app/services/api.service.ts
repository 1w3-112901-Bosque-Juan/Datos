import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  post(path: string, body: any, token?: string) {
    let headers = new HttpHeaders({'Content-Type': 'application/json'});
    if (token) headers = headers.set('X-Session-Token', token);
    return this.http.post(API + path, body, { headers });
  }

  get(path: string, token?: string) {
    let headers = new HttpHeaders();
    if (token) headers = headers.set('X-Session-Token', token);
    return this.http.get(API + path, { headers });
  }

  put(path: string, body: any) { return this.http.put(API + path, body); }
  delete(path: string) { return this.http.delete(API + path); }
}
