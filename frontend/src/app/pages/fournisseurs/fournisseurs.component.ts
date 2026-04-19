import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-fournisseurs',
  imports: [HeaderComponent, MenuComponent],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css'],
})
export class FournisseursComponent {}
