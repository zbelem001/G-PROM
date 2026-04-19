import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-rapports',
  imports: [HeaderComponent, MenuComponent],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.css'],
})
export class RapportsComponent {}
