import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const phrasalVerbRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./phrasal-verbs.component').then(m => m.PhrasalVerbsComponent),
    },
    {
        path: RoutesApp.addPhrasalVerb,
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        path: `${RoutesApp.addPhrasalVerb}/:id`,
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        // path: RoutesApp.testPhrasalVerbs,
        path: RoutesApp.test,
        // loadComponent: () => import('./test-words/test-words.component').then(m => m.TestWordsComponent),
        loadComponent: () => import('../test/test.component').then(m => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
