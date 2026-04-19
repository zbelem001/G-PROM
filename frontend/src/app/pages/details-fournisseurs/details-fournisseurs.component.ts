import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-details-fournisseurs',
  imports: [HeaderComponent, MenuComponent],
  templateUrl: './details-fournisseurs.component.html',
  styleUrls: ['./details-fournisseurs.component.css'],
})
export class DetailsFournisseursComponent {}
