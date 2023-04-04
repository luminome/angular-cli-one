import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';



export function formatMs(ms:number, decimals = 2) {
  if (!+ms) return '0 ms';
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['ms', 's', 'm'];
  const scales = [1, 1000, 60000];
  let i = 0;
  if(ms >= 1000) i = 1;
  if(ms >= 60000) i = 2;
  return `${i === 0 ? ms : (ms/scales[i]).toFixed(dm)}${sizes[i]}`;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationsService {

  coms_object: { [key: string]: any | null } | any = {
    level:'log',
    text: null,
    state: true,
    visible: true,
    icon:'message',
    delta: null
  }

  
  constructor() { }
  
  private messageSource = new BehaviorSubject(this.coms_object as any);
  coms_obs = this.messageSource.asObservable();

  log_delta = new Date().getTime();

  log(message: string | string[], alts:any = null) {
    this.coms_object.level = 'log';
    this.coms_object.icon = 'message';

    if(alts !== null && typeof alts === 'object'){
      Object.assign(this.coms_object, alts);
    }

    const now = new Date().getTime();
    this.coms_object.delta = formatMs(now-this.log_delta);
    this.coms_object.text = Array.isArray(message) ? message : [message];
    this.coms_object.visible = true;
    this.messageSource.next(this.coms_object);
    this.log_delta = now;
  }

}