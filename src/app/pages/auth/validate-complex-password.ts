import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function validateComplexPassword(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        
        if (!value) {
          // No es un error si el campo no tiene valor (puedes combinar esto con el validador `required`)
          return null;
        }
        
        // Expresión regular para los requisitos
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value); // Ajusta los caracteres según tus necesidades
        
        if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
          return null; // El password es válido
        } else {
          // Devolvemos un objeto de error indicando qué falló
          return {
            complexPassword: {
              hasUpperCase,
              hasLowerCase,
              hasNumber,
              hasSpecialChar,
            },
          };
        }
      };
    }
