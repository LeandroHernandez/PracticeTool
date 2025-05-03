import { Routes } from '@angular/router';
import { RoutesApp } from './constants';

export const routes: Routes = [
    {
        path: RoutesApp.auth,
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    },
    {
        path: RoutesApp.words,
        // loadComponent: () => import('./pages/words/words.component').then(m => m.WordsComponent),
        loadChildren: () => import('./pages/words/words.routes').then(m => m.wordRoutes),
        // loadChildren: () => [
            //     {
        //         path: RoutesApp.addWord,
        //         loadComponent: () => import('./pages/words/add-word/add-word.component').then(m => m.AddWordComponent),
        //     },
        //     {
            //         path: RoutesApp.testWords,
        //         loadComponent: () => import('./pages/words/test-words/test-words.component').then(m => m.TestWordsComponent),
        //     },
        // ]
    },
    {
        path: RoutesApp.idioms,
        // loadComponent: () => import('./pages/idioms/idioms.component').then(m => m.IdiomsComponent),
        loadChildren: () => import('./pages/idioms/idioms.routes').then(m => m.idiomRoutes),
    },
    {
        path: RoutesApp.expressions,
        loadChildren: () => import('./pages/expressions/expressions.routes').then(m => m.expressionRoutes),
    },
    {
        path: RoutesApp.phrasalVerbs,
        // loadComponent: () => import('./pages/phrasal-verbs/phrasal-verbs.component').then(m => m.PhrasalVerbsComponent),
        loadChildren: () => import('./pages/phrasal-verbs/phrasal-verbs.routes').then(m => m.phrasalVerbRoutes),
    },
    {
        path: RoutesApp.grammar,
        loadComponent: () => import('./pages/grammar/grammar.component').then(m => m.GrammarComponent),
    },
    {
        path: RoutesApp.test,
        loadComponent: () => import('./pages/test/test.component').then(m => m.TestComponent),
    },
    {
        path: RoutesApp.practiceLists,
        loadChildren: () => import('./pages/practice-lists/practice-lists.routes').then(m => m.practiceListsRoutes),
    },
    {
        path: RoutesApp.other,
        redirectTo: RoutesApp.words,
    }
];
