import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forgotPassword, resetPassword, verifyResetCode } from '../../api.service';

type Step = 'email' | 'code' | 'password' | 'done';

@Component({
  standalone: true,
  selector: 'app-mot-de-passe-oublie',
  imports: [CommonModule, FormsModule],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrls: ['./mot-de-passe-oublie.component.css'],
})
export class MotDePasseOublieComponent {
  step: Step = 'email';
  submitting = false;
  errorMessage = '';

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  async submitEmail(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    try {
      await forgotPassword(this.email.trim());
      this.step = 'code';
    } catch (error: any) {
      this.errorMessage = this.extractErrorMessage(error);
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  async resendCode(): Promise<void> {
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    try {
      await forgotPassword(this.email.trim());
    } catch (error: any) {
      this.errorMessage = this.extractErrorMessage(error);
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  async submitCode(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    try {
      const { valid } = await verifyResetCode(this.email.trim(), this.code.trim());
      if (!valid) {
        this.errorMessage = 'Code invalide ou expiré.';
        return;
      }
      this.step = 'password';
    } catch (error: any) {
      this.errorMessage = this.extractErrorMessage(error);
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  async submitPassword(event: Event): Promise<void> {
    event.preventDefault();
    if (this.submitting) return;
    this.errorMessage = '';

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    this.submitting = true;
    try {
      await resetPassword(this.email.trim(), this.code.trim(), this.newPassword);
      this.step = 'done';
    } catch (error: any) {
      this.errorMessage = this.extractErrorMessage(error);
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  backToLogin(): void {
    this.router.navigate(['/connexion']);
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
    return 'Une erreur est survenue, veuillez réessayer.';
  }
}
