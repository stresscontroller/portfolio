import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { CompanyOrgChart, PositionList } from '@app/core';
import { LoaderEmbedComponent } from '@app/shared';
import { OrganizationChartState, UIState } from './state';
import { OrgUsersModalComponent } from './modals';

@Component({
    standalone: true,
    selector: 'app-organization-chart',
    templateUrl: './organization-chart.component.html',
    styleUrls: ['./organization-chart.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        OrganizationChartModule,
        LoaderEmbedComponent,
        OrgUsersModalComponent,
    ],
    providers: [OrganizationChartState, UIState],
})
export class OrganizationChartComponent {
    organizationChartState = inject(OrganizationChartState);
    uiState = inject(UIState);
    status$ = this.organizationChartState.statuses$.pipe(
        map((statuses) => statuses.loadOrgChart)
    );

    isExpanded$ = new BehaviorSubject<boolean>(false);
    expandAll$ = new BehaviorSubject<boolean>(false);

    orgChart$ = this.organizationChartState.orgChart$.pipe(
        switchMap((org) => {
            return this.expandAll$.pipe(
                map((expandAll) => {
                    this.isExpanded$.next(expandAll);
                    if (!org) {
                        return null;
                    }
                    // default to only expanding the 2 levels deep
                    const topTierData = this.formatDepartmentData(
                        org,
                        expandAll ? 100 : 2
                    );
                    return topTierData;
                })
            );
        })
    );

    ngOnInit(): void {
        this.organizationChartState.init();
    }

    refresh(): void {
        this.organizationChartState.refresh();
    }

    toggleExpandAll(): void {
        this.expandAll$.next(!this.isExpanded$.getValue());
    }

    onNodeExpand(companyOrgTree: TreeNode<CompanyOrgChart>[]): void {
        this.isExpanded$.next(this.isAllExpanded(companyOrgTree));
    }

    onNodeCollapse(): void {
        this.isExpanded$.next(false);
    }

    viewPositionUsers(position: PositionList): void {
        this.uiState.openViewOrgModal(position);
    }

    viewDepartmentUsers(
        department: CompanyOrgChart,
        variant: 'all' | 'department'
    ): void {
        this.uiState.openViewOrgModal({ ...department, variant });
    }

    private formatDepartmentData(
        companyOrg: CompanyOrgChart[],
        expandedLevels?: number
    ): TreeNode<CompanyOrgChart>[] {
        if (!companyOrg) {
            return [];
        }
        if (expandedLevels) {
            expandedLevels -= 1;
        }
        return companyOrg.map((childPosition) => {
            const totalHiredStats = this.getTotalHiredStats([childPosition]);
            return {
                expanded: expandedLevels && expandedLevels > 0 ? true : false,
                styleClass: `org-chart-card-container ${
                    childPosition.staffHired < childPosition.totalStaffNeeded ||
                    totalHiredStats.totalHired < totalHiredStats.totalNeeded
                        ? 'alert'
                        : 'fulfilled'
                }`,
                label: childPosition.departmentName,
                data: {
                    ...childPosition,
                    ...this.getTotalHiredStats([childPosition]),
                },
                children: this.formatDepartmentData(
                    childPosition.listChildPositions,
                    expandedLevels
                ),
            };
        });
    }
    private getTotalHiredStats(companyOrg: CompanyOrgChart[]): {
        totalHired: number;
        totalNeeded: number;
    } {
        return companyOrg.reduce(
            (acc, curr) => {
                const childStats = this.getTotalHiredStats(
                    curr.listChildPositions
                );
                acc.totalHired += curr.staffHired + childStats?.totalHired;
                acc.totalNeeded +=
                    curr.totalStaffNeeded + childStats?.totalNeeded;

                return acc;
            },
            {
                totalHired: 0,
                totalNeeded: 0,
            }
        );
    }

    private isAllExpanded(
        companyOrgTree: TreeNode<CompanyOrgChart>[]
    ): boolean {
        let isExpanded = true;
        for (let i = 0; i < companyOrgTree.length; i++) {
            const children = companyOrgTree[i].children;
            if (children && children.length > 0) {
                if (
                    !companyOrgTree[i].expanded ||
                    !this.isAllExpanded(children)
                ) {
                    isExpanded = false;
                    break;
                }
            }
        }
        return isExpanded;
    }
}
