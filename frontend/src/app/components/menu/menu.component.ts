import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  constructor(private router: Router) {}

  navigate(path: string, event: Event) {
    console.debug('[Menu] click', path, event.type);
    event.preventDefault();
    this.router.navigateByUrl(path);
  }
}
