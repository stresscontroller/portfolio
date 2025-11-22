import { BehaviorSubject, Observable } from 'rxjs';
import { Account } from '../common/auth.service-common';
import { EventMessage } from '@azure/msal-browser';

export abstract class AuthServiceBase {
    abstract authInProgress$: Observable<boolean>;
    abstract msalEvents$: Observable<EventMessage>;
    abstract user$: BehaviorSubject<Account | undefined>;
    abstract isAdmin$: Observable<boolean>;
    abstract isAgent$: Observable<boolean>;
    abstract isUser$: Observable<boolean>;
    abstract isInhouseAgent$: Observable<boolean>;
    abstract getAuthToken(): string | undefined;
    abstract init(): void;
    abstract login(): Promise<void>;
    abstract logout(): Promise<void>;
    abstract initListeners(): void;
    abstract getAccount(): Account | undefined;
    abstract getUserId(): string | null;
}
