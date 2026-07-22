import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { login } from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-connexion',
  imports: [CommonModule, FormsModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
})
export class ConnexionComponent {
  identifiant = '';
  motDePasse = '';
  submitting = false;
  errorMessage = '';

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    try {
      const { access_token, user } = await login(this.identifiant.trim(), this.motDePasse);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('gprom_token', access_token);
        window.localStorage.setItem('gprom_user', JSON.stringify(user));
      }
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = this.extractErrorMessage(error);
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  private extractErrorMessage(error: any): string {
    const raw: string = error?.message || '';
    const jsonStart = raw.indexOf('{');
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(raw.slice(jsonStart));
        if (parsed?.message) return parsed.message;
      } catch {
        // fall through to generic message
      }
    }
    return 'Identifiants invalides.';
  }
}
