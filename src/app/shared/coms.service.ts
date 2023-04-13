import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TextService } from './text.service';
import { Com, ICom } from '../entities/com/com.model';

export const normVal = (val:number, mi:number, ma:number) => (val - mi) / (ma - mi);

export function formatMs(ms:number, decimals = 2) {
  if (!+ms) return '0 ms';
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['ms', 's', 'm', 'h'];
  const scales = [1, 1000, 60000, 3600000];
  let i = 0;
  if(ms >= 1000) i = 1;
  if(ms >= 60000) i = 2;
  if(ms >= 3600000) i = 3;
  return `${i === 0 ? ms : (ms/scales[i]).toFixed(dm)}${sizes[i]}`;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationsService {

  coms_object: { [key: string]: any | null } | any = {
    from_id: undefined,
    from_obj_id: undefined,
    from_obj: undefined,
    level:'log',
    text: undefined,
    state: undefined,
    icon:'message',
    delta: undefined,
    time: undefined,
    object: {}
  }

  com: ICom | any;

  constructor(
    private logger: TextService,
    public http: HttpClient
    ) { }
  
  private comsHistory = new BehaviorSubject<ICom>([] as any);
  coms_history = this.comsHistory.asObservable();

  private comsCurrent = new BehaviorSubject<ICom>(this.coms_object as any);
  coms_obs = this.comsCurrent.asObservable();

  // public comsState = new BehaviorSubject<String>('initial-state' as any);
  coms_state:string = 'initial-state';//this.comsState.asObservable();

  log_delta = new Date().getTime();

  public async get() {
    const req = this.http.get('/api/coms', {responseType: 'json'});
    return await firstValueFrom(req)
        .then((response : Array<ICom> | any | null) => this.comsHistory.next(response))
        .catch(this.error);
    }

  public async create(com: ICom){
    const req = this.http.post('/api/coms', com);
    return await firstValueFrom(req)
        .then((response : ICom | any | null) => {
          com.saved = true;
          return response;
        })
        .catch(this.error);
    }

  // Error handling
  private error(error: any) {
    let message = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(message);
  }

  state(state:string | null = null):string{
    if(state) this.coms_state = state;
    return this.coms_state;
  }

  log(message: string | string[], alts:any = undefined) {
    this.coms_object.level = 'log';
    this.coms_object.icon = 'message';
    this.coms_object.object = undefined;

    if(alts !== undefined && typeof alts === 'object'){
      Object.assign(this.coms_object, alts);
    }

    
    const time = new Date();
    const now = time.getTime();

    this.coms_object.delta = formatMs(now-this.log_delta);
    this.coms_object.text = Array.isArray(message) ? message : [message];
    this.coms_object.time = time; 

    this.com = new Com();
    
    Object.assign(this.com, this.coms_object);

    if(this.coms_object.level === 'log') this.create(this.com);
    
    this.comsCurrent.next(this.com);
    

    if(this.coms_object.object !== undefined){
      this.logger.ez.set_text(JSON.stringify(this.coms_object.object, null, '\t'), true);
    }

    this.logger.ez.set_text([this.coms_object.text, this.coms_object.state, this.coms_object.delta ], true);
    this.log_delta = now;
  }

}