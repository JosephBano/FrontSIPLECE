// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private valueSource = new BehaviorSubject<number | null>(null);
  currentValue = this.valueSource.asObservable();
  private reloadSource = new BehaviorSubject<boolean>(false);
  reload$ = this.reloadSource.asObservable();

  private myMethodSubject = new Subject<void>();
  myMethod$ = this.myMethodSubject.asObservable();

  triggerMethod() {
    this.myMethodSubject.next();
  }

  changeValue(value: number) {
    this.valueSource.next(value);
  }
  triggerReload() {
    this.reloadSource.next(true);
  }
}