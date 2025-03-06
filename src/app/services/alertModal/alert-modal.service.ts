import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertModalService {

  constructor() { }

  isAlertModalOpenService = false;

  private modalState = new BehaviorSubject<{ message: string, type: 'success' | 'error' | 'warning' | 'info', showInput: boolean } | null>(null);
  modalState$ = this.modalState.asObservable();

  openModal(message: string, type: 'success' | 'error' | 'warning' | 'info', showInput: boolean = false) {
    this.modalState.next({ message, type, showInput });
    this.isAlertModalOpenService = true;
  }

  closeModal() {
    this.modalState.next(null);
    this.isAlertModalOpenService = false;
  }
}
