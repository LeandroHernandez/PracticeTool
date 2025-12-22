import { Routes } from '@angular/router';
import { RoleIds, RoutesApp } from '../../../../enums';
import { subMenuGuard } from '../../../../guards';

export const practiceListsRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./practice-lists.component').then(m => m.PracticeListsComponent),
    },
    {
        canActivate: [subMenuGuard([RoleIds.admin])],
        path: RoutesApp.add,
        loadComponent: () => import('./add-practice-list/add-practice-list.component').then(m => m.AddPracticeListComponent),
    },
    {
        canActivate: [subMenuGuard([RoleIds.admin])],
        path: `${RoutesApp.add}/:id`,
        loadComponent: () => import('./add-practice-list/add-practice-list.component').then(m => m.AddPracticeListComponent),
    },
    {
        path: RoutesApp.test,
        loadComponent: () =>
            import('../test').then((m) => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
