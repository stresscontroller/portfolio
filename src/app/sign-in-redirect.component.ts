import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthToken } from '@app/core';

@Component({
    standalone: true,
    selector: 'app-auth',
    template: `<div></div>`,
    imports: [RouterModule],
})
export class SignInRedirectComponent {
    authService = inject(AuthToken);
    router = inject(Router);
    ngOnInit() {
        this.router.navigate(['/']);
        this.authService.login();
    }
}
