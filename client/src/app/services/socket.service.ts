import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

   private socket: Socket | null = null;

  // constructor() {
  //   this.socket = io('http://localhost:3000', {
  //     withCredentials: true
  //   });
  // }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      this.connectSocket();
    }
    console.log('Listening for event:', eventName);
    console.log('Socket ID:', this.socket?.id);
    this.socket?.on(eventName, callback);
  }

  connectSocket() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true, 
      });

      this.socket.on('connect', () => {
        console.log('Socket connected: ', this.socket?.id);
      });
    }
  }

  emit(eventName: string, data: any) {
    this.socket?.emit(eventName, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
