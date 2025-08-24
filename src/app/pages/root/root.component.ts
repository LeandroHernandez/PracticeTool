import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavComponent],
  templateUrl: './root.component.html',
  styleUrl: './root.component.css'
})
export class RootComponent {
  // title = 'practiceTool';

  public showNav: boolean = false;

  onContentClick(event: MouseEvent): void {
    // const target = event.target as HTMLElement;
    // console.log({ target })
    // if (target.classList.contains('content') || target.classList.contains('main')) {
    //   this.showNav = false;
    // }
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    
    // Lista de etiquetas que NO deberían cerrar el nav
    const exceptions = ['input', 'select', 'textarea', 'button', 'label'];
    
    if (!exceptions.includes(tagName)) {
      this.showNav = false;
    }
  }
  
}
