import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatHistoryItem, sendChatMessage } from '../../api.service';

interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
})
export class ChatWidgetComponent {
  open = false;
  sending = false;
  draft = '';
  messages: DisplayMessage[] = [
    { role: 'assistant', content: "Bonjour ! Je peux vous renseigner sur les statistiques, l'état d'un marché ou si un document a été chargé. Que voulez-vous savoir ?" },
  ];

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  toggle() {
    this.open = !this.open;
  }

  async send() {
    const text = this.draft.trim();
    if (!text || this.sending) return;

    const history: ChatHistoryItem[] = this.messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    this.messages = [...this.messages, { role: 'user', content: text }];
    this.draft = '';
    this.sending = true;

    try {
      const reply = await sendChatMessage(text, history);
      this.ngZone.run(() => {
        this.messages = [...this.messages, { role: 'assistant', content: reply || "(pas de réponse)" }];
        this.sending = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.messages = [
          ...this.messages,
          { role: 'assistant', content: error?.message || "Une erreur est survenue.", error: true },
        ];
        this.sending = false;
        this.cd.markForCheck();
      });
    }
  }
}
