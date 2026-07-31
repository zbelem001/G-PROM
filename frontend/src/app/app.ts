import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { hasValidSession } from '../session';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  showChat = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.showChat = hasValidSession();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.debug('[App] navigation end', event.urlAfterRedirects);
        this.showChat = hasValidSession();
      }
    });
  }
}
