import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import {
    Assets,
    AuthToken,
    Features,
    UserState,
    checkPageAccess,
} from '@app/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { environment } from 'src/environments/environment';

@Component({
    standalone: true,
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    imports: [
        CommonModule,
        RouterModule,
        BadgeModule,
        DividerModule,
        ButtonModule,
        MenuModule,
    ],
})
export class NavbarComponent {
    @Input() displayMenuButton = false;
    @Output() menuButtonClick = new EventEmitter<void>();

    authService = inject(AuthToken);
    userState = inject(UserState);
    router = inject(Router);

    isLoading$ = this.userState.isLoading$.pipe(startWith(true));
    user$ = this.userState.aspNetUser$;
    profilePicture$ = this.user$.pipe(
        map((user) => {
            if (user?.profilePicturePath) {
                // prevent caching
                const rand = new Date().getTime();
                return `${user.profilePicturePath}?${rand}`;
            } else {
                return '';
            }
        })
    );

    headerLogo = `${environment.cruiseCodeApiBaseUrl}${Assets.headers.cruiseCodeLogoTransparent}`;

    hasProfileAccess$ = this.userState.controls$.pipe(
        map((featureControls) =>
            checkPageAccess(
                featureControls,
                Features.profile.name,
                Object.values(Features.profile.pages).map((page) => page.name)
            )
        )
    );

    mobileMenu$: Observable<
        {
            label: string;
            escape: boolean;
            routerLink?: string;
            command?: () => void;
        }[]
    > = combineLatest([this.user$, this.userState.controls$]).pipe(
        map(([user, featureControls]) => {
            if (user) {
                return [
                    ...(checkPageAccess(
                        featureControls,
                        Features.profile.name,
                        Object.values(Features.profile.pages).map(
                            (page) => page.name
                        )
                    )
                        ? [
                              {
                                  label: this.createMenuItemTemplate(
                                      'Account',
                                      'pi-user'
                                  ),
                                  escape: false,
                                  routerLink: '/operator/profile',
                              },
                          ]
                        : []),
                    {
                        label: this.createMenuItemTemplate(
                            'Logout',
                            'pi-sign-out'
                        ),
                        escape: false,
                        command: () => {
                            this.logout();
                        },
                    },
                ];
            } else {
                return [
                    {
                        label: this.createMenuItemTemplate(
                            'Login',
                            'pi-sign-in'
                        ),
                        escape: false,
                        command: () => {
                            this.login();
                        },
                    },
                ];
            }
        })
    );

    login(): void {
        this.authService.login();
    }

    logout(): void {
        this.authService.logout();
    }

    onMenuButtonClick(): void {
        this.menuButtonClick.emit();
    }

    navigateToProfile(): void {
        this.router.navigate(['/operator/profile']);
    }

    private createMenuItemTemplate(name: string, iconName: string): string {
        return `
            <div class="menu-item-link">
                <i class="pi ${iconName}"></i>
                <span>${name}</span>
            </div>
        `;
    }
}
