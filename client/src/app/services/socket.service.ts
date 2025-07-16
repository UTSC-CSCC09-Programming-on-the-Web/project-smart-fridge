import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket | null = null;
  private connectPromise: Promise<void> | null = null;

  connectSocket(): Promise<void> {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true,
      });

      this.connectPromise = new Promise((resolve) => {
        this.socket!.on('connect', () => {
          console.log('Socket connected:', this.socket?.id);
          resolve(); 
        });
      });
    }
    return this.connectPromise!;
 }


  async on(eventName: string, callback: (...args: any[]) => void) {
    await this.connectSocket();
    console.log('Listening for event:', eventName);
    console.log('Socket ID:', this.socket?.id);
    this.socket?.on(eventName, callback);
  }

  emit(eventName: string, data: any) {
    this.socket?.emit(eventName, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
