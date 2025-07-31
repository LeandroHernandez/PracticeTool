import { CanActivateFn, Router } from '@angular/router';
import { localStorageLabels, RoutesApp } from '../constants';
import { inject } from '@angular/core';

export const testGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  console.log('GUARDIAN')
  if (!localStorage.getItem( router.url.split('/')[1] === RoutesApp.elementsToPractice ? localStorageLabels.customSelectedListOfETP : localStorageLabels.customSelectedListOfPL)) {
    console.log('Permiso negado');
    router.navigateByUrl(`/${RoutesApp.elementsToPractice}`);
    return false;
  }
  console.log('Permiso concedido');
  return true;
};
