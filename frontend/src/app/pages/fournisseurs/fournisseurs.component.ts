import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-fournisseurs',
  imports: [CommonModule, HeaderComponent, MenuComponent, RouterModule],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css'],
})
export class FournisseursComponent {
  showAddFournisseur = false;

  toggleAddFournisseur() {
    this.showAddFournisseur = !this.showAddFournisseur;
  }
}
