import { Injectable } from '@angular/core';
import { from, Observable, share, switchMap } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private connectPromise: Promise<void> | null = null;
  endpoint = environment.apiEndpoint || 'http://localhost:3000';
  connectSocket(): Promise<void> {
    if (!this.socket) {
      this.socket = io(this.endpoint, {
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

  private listenToEvent<T>(eventName: string): Observable<T> {
    return new Observable((observer) => {
      const eventHandler = (data: T) => {
        console.log(`Event received: ${eventName}`, data);
        observer.next(data);
      };
      this.socket?.on(eventName, eventHandler);
      return () => {
        console.log(`Unsubscribing from event: ${eventName}`);
        this.socket?.off(eventName, eventHandler);
      };
    });
  }

  fromSocketEvent<T>(eventName: string): Observable<T> {
    const event$ = from(this.connectSocket()).pipe(
      switchMap(() => this.listenToEvent<T>(eventName)),
      share(),
    );
    return event$;
  }

  async emit(eventName: string, data: any): Promise<void> {
    await this.connectSocket();
    console.log(`Emitting event: ${eventName}`, data);
    this.socket!.emit(eventName, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
