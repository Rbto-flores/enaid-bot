/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from 'events'

export class TypedEventEmitter<TEvents extends Record<string, any>> {
    private readonly emitter = new EventEmitter()
  
    emit<TEventName extends string & keyof TEvents>(
      eventName: TEventName,
      ...eventArg: TEvents[TEventName]
    ): void {
      this.emitter.emit(eventName, ...(eventArg as []))
    }
  
    on<TEventName extends string & keyof TEvents>(
      eventName: TEventName,
      handler: (...eventArg: TEvents[TEventName]) => void
    ): void {
      this.emitter.on(eventName, handler as any)
    }
  
    off<TEventName extends string & keyof TEvents>(
      eventName: TEventName,
      handler: (...eventArg: TEvents[TEventName]) => void
    ): void {
      this.emitter.off(eventName, handler as any)
    }
  }

