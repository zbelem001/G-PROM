import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || 'G-PROM <onboarding@resend.dev>';
    if (!apiKey) {
      throw new InternalServerErrorException("Configuration d'envoi d'email manquante côté serveur.");
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[EmailService] Resend API error:', response.status, text);
      throw new InternalServerErrorException("Échec de l'envoi de l'email.");
    }
  }
}
