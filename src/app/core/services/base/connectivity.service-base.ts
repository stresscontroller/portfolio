import { Observable } from 'rxjs';

export abstract class ConnectivityServiceBase {
    abstract isOnline$: Observable<boolean>;
    abstract isOnline(): Promise<boolean>;
    abstract startMonitoring(): void;
    abstract stopMonitoring(): void;
}
