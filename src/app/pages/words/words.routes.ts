import { Routes } from '@angular/router';
import { RoutesApp } from '../../constants';

export const wordRoutes: Routes = [
    {
        path: RoutesApp.root,
        loadComponent: () => import('./words.component').then(m => m.WordsComponent),
    },
    {
        path: RoutesApp.addWord,
        // loadComponent: () => import('./add-word/add-word.component').then(m => m.AddWordComponent),
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        path: `${RoutesApp.addWord}/:id`,
        // loadComponent: () => import('./add-word/add-word.component').then(m => m.AddWordComponent),
        loadComponent: () => import('../components/add-element-to-prectice/add-element-to-prectice.component').then(m => m.AddElementToPrecticeComponent),
    },
    {
        // path: RoutesApp.testWords,
        path: RoutesApp.test,
        // loadComponent: () => import('./test-words/test-words.component').then(m => m.TestWordsComponent),
        loadComponent: () => import('../test/test.component').then(m => m.TestComponent),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.root,
    }
];
