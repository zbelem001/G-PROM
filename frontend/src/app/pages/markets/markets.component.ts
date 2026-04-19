import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-markets',
  imports: [CommonModule, HeaderComponent, MenuComponent, RouterModule],
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.css'],
})
export class MarketsComponent {
  showAddMarket = false;

  toggleAddMarket() {
    this.showAddMarket = !this.showAddMarket;
  }
}
