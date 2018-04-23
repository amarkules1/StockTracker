import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Cat } from '../shared/models/cat.model';

@Injectable()
export class CatService {

  constructor(private http: HttpClient) { }
//figure out how to add username here
  getCats(userName): Observable<Cat[]> {
    return this.http.get<Cat[]>('http://18.216.107.92:3000/api/cats/' + userName);
  }

  getPrice(name, i): Observable<number> {
    var data = this.http.get<number>('http://18.216.107.92:3000/api/cats/price/' + name +'/' + i);
    console.log(data);
    return data;
  }

  countCats(): Observable<number> {
    return this.http.get<number>('http://18.216.107.92:3000/apicats/count');
  }

  addCat(cat: Cat): Observable<Cat> {
	  console.log(cat);
      return this.http.post<Cat>('http://18.216.107.92:3000/api/cat', cat);
  }

  getCat(cat: Cat): Observable<Cat> {
    return this.http.get<Cat>(`http://18.216.107.92:3000/api/cat/${cat._id}`);
  }

  editCat(cat: Cat): Observable<string> {
    return this.http.put(`http://18.216.107.92:3000/api/cat/${cat._id}`, cat, { responseType: 'text' });
  }

  deleteCat(cat: Cat): Observable<string> {
    return this.http.delete(`http://18.216.107.92:3000/api/cat/${cat._id}`, { responseType: 'text' });
  }

}
