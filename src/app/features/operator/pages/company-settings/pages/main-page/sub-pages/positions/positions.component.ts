import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule, TreeTable } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import {
    AddNewPositionModalComponent,
    EditPositionModalComponent,
    RemovePositionModalComponent,
    PostJobModalComponent,
} from './components/modals';
import { CompanyDepartmentListItem, CompanyPositionListItem } from '@app/core';
import { UIState, PositionsState, PayRatesState } from './state';
import { LoaderEmbedComponent, PermissionDirective } from '@app/shared';

@Component({
    standalone: true,
    selector: 'app-positions',
    templateUrl: './positions.component.html',
    styleUrls: ['./positions.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TreeModule,
        TreeTableModule,
        InputTextModule,
        TooltipModule,
        AddNewPositionModalComponent,
        EditPositionModalComponent,
        RemovePositionModalComponent,
        PostJobModalComponent,
        LoaderEmbedComponent,
        PermissionDirective,
    ],
    providers: [UIState, PositionsState, PayRatesState],
})
export class PositionsComponent {
    uiState = inject(UIState);
    positionsState = inject(PositionsState);
    @ViewChild('qualificationTable', { static: false })
    qualificationTable: TreeTable | undefined;
    keyword: string = '';
    private destroyed$ = new Subject<void>();
    statuses$ = this.positionsState.statuses$;
    departmentsTree$ = new BehaviorSubject<TreeNode[]>([]);
    positionsTree$ = new BehaviorSubject<TreeNode[]>([]);
    selectedNode: TreeNode | null = null;
    positions$ = this.positionsState.positionList$;

    ngOnInit(): void {
        this.positionsState.init();
        this.convertDepartmentsToTree();
    }

    private convertDepartmentsToTree(): void {
        this.positionsState.positionList$.subscribe((positions) => {
            const tree = this.buildPositionsTree(positions);
            this.positionsTree$.next(tree);
        });
        this.positionsState.departmentList$.subscribe((departments) => {
            const tree = this.buildDepartmentsTree(departments);
            this.departmentsTree$.next(tree);
        });
    }

    private buildDepartmentsTree(
        departments: CompanyDepartmentListItem[]
    ): TreeNode[] {
        const map = new Map<number, TreeNode>();
        const tree: TreeNode[] = [];

        departments.forEach((department) => {
            map.set(department.departmentId, {
                label: department.departmentName,
                data: department,
                expanded: true,
                children: [],
            });
        });

        departments.forEach((department) => {
            if (department.parentDepartmentId) {
                const parentNode = map.get(department.parentDepartmentId);
                if (parentNode) {
                    parentNode.children?.push(
                        map.get(department.departmentId)!
                    );
                }
            } else {
                tree.push(map.get(department.departmentId)!);
                this.onNodeSelect({ node: map.get(department.departmentId)! });
            }
        });

        return tree;
    }

    private buildPositionsTree(
        positions: CompanyPositionListItem[]
    ): TreeNode[] {
        const map = new Map<number, TreeNode>();
        const tree: TreeNode[] = [];
        positions.forEach((position) => {
            const treeNode: TreeNode = {
                data: position,
                expanded: true,
                label: position.departmentName || position.positionName,
                children: position.children
                    ? this.getChildPositions(position.children)
                    : [],
            };
            map.set(position.positionId, treeNode);
        });
        positions.forEach((position) => {
            if (position.parentDepartmentId !== null) {
                const parentNode = map.get(position.parentDepartmentId);
                if (parentNode) {
                    parentNode.children?.push(map.get(position.positionId)!);
                }
            } else {
                tree.push(map.get(position.positionId)!);
            }
        });
        return tree;
    }

    private getChildPositions(
        positions: CompanyPositionListItem[]
    ): TreeNode[] {
        const tree: TreeNode[] = [];
        positions.forEach((position) => {
            tree.push({
                data: position,
                expanded: true,
                label: position.departmentName || position.positionName,
                children: position.children
                    ? this.getChildPositions(position.children)
                    : [],
            });
        });
        return tree;
    }

    onNodeSelect(event: { node: TreeNode }) {
        this.selectedNode = event.node;
        this.positionsState.getPositions(event.node.data.departmentId);
    }

    refresh(): void {
        this.positionsState.refresh();
    }

    search(): void {
        if (this.qualificationTable) {
            this.qualificationTable.filterGlobal(this.keyword, 'contains');
        }
    }

    openAddNewPositionModal(): void {
        this.uiState.openAddNewPositionModal();
    }

    openEditPositionModal(positionId: number): void {
        this.positionsState.setPositionId(positionId);
        this.uiState.openEditPositionModal(positionId);
    }

    openRemovePositionModal(positionId: number): void {
        this.uiState.openRemovePositionModal(positionId);
    }

    openPostJobModal(positionId: number): void {
        this.uiState.openPostJobModal(positionId);
        console.log(positionId);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
