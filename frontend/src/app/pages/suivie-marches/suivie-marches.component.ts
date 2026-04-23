import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-suivie-marches',
  imports: [CommonModule, HeaderComponent, MenuComponent],
  templateUrl: './suivie-marches.component.html',
  styleUrls: ['./suivie-marches.component.css'],
})
export class SuivieMarchesComponent {}
