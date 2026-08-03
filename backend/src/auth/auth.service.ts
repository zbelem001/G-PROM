import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomInt } from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';
import { HistoriqueConnexionService } from '../historique-connexion/historique-connexion.service';
import { EmailService } from '../email/email.service';
import { UtilisateurService } from '../utilisateur/utilisateur.service';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;
const RESET_CODE_TTL_MINUTES = 15;
const RESET_CODE_RESEND_COOLDOWN_SECONDS = 60;

interface ValidResetCode {
  id: number;
  idutilisateur: number;
  userEmail: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly historiqueConnexionService: HistoriqueConnexionService,
    private readonly emailService: EmailService,
    private readonly utilisateurService: UtilisateurService,
  ) {}

  async login({ identifiant, motDePasse }: LoginDto, ipaddress: string | null, useragent: string | null) {
    if (!identifiant?.trim() || !motDePasse) {
      throw new UnauthorizedException('Identifiant et mot de passe requis.');
    }

    const user = await this.findByIdentifiant(identifiant.trim());
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (user.statut && user.statut !== 'actif') {
      throw new UnauthorizedException('Ce compte est désactivé.');
    }

    const valid = await this.verifyPassword(motDePasse, user);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    await this.supabaseService.client
      .from('Utilisateur')
      .update({ dernierlogin: new Date().toISOString() })
      .eq('idutilisateur', user.idutilisateur);

    await this.historiqueConnexionService.record(user.idutilisateur, ipaddress, useragent);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET manquant côté serveur.');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h';

    const accessToken = jwt.sign(
      { sub: user.idutilisateur, email: user.email, role: user.role ?? 'user' },
      secret,
      { expiresIn } as jwt.SignOptions,
    );

    const { motdepasse, ...safeUser } = user;
    return { access_token: accessToken, user: safeUser };
  }

  // Always returns the same generic message, whether or not the email is registered,
  // so this endpoint can't be used to enumerate valid accounts.
  async forgotPassword(email: string): Promise<{ message: string }> {
    const generic = { message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé.' };
    const trimmedEmail = email?.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new BadRequestException('Email requis.');
    }

    const { data: user, error: userError } = await this.supabaseService.client
      .from('Utilisateur')
      .select('idutilisateur, email, prenom')
      .eq('email', trimmedEmail)
      .maybeSingle();
    if (userError) {
      throw new InternalServerErrorException(userError.message);
    }
    if (!user) {
      return generic;
    }

    const { data: recent, error: recentError } = await this.supabaseService.client
      .from('PasswordReset')
      .select('created_at')
      .eq('idutilisateur', user.idutilisateur)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentError) {
      throw new InternalServerErrorException(recentError.message);
    }
    if (recent) {
      const secondsSince = (Date.now() - new Date(recent.created_at).getTime()) / 1000;
      if (secondsSince < RESET_CODE_RESEND_COOLDOWN_SECONDS) {
        throw new BadRequestException('Veuillez patienter avant de redemander un code.');
      }
    }

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await this.supabaseService.client
      .from('PasswordReset')
      .insert([{ idutilisateur: user.idutilisateur, code, expires_at: expiresAt, used: false }]);
    if (insertError) {
      throw new InternalServerErrorException(insertError.message);
    }

    await this.emailService.send({
      to: user.email,
      subject: 'G-PROM — Code de réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1a2e44;">Réinitialisation de mot de passe</h2>
          <p>Bonjour${user.prenom ? ' ' + user.prenom : ''},</p>
          <p>Voici votre code de réinitialisation, valable ${RESET_CODE_TTL_MINUTES} minutes :</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #039CD3; text-align: center; padding: 16px; background: #f8f9fb; border-radius: 10px;">${code}</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">G-PROM — Institut 2iE</p>
        </div>
      `,
    });

    return generic;
  }

  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    const entry = await this.findValidResetCode(email, code);
    return { valid: !!entry };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères.');
    }

    const entry = await this.findValidResetCode(email, code);
    if (!entry) {
      throw new UnauthorizedException('Code invalide ou expiré.');
    }

    await this.utilisateurService.update(entry.idutilisateur, { motDePasse: newPassword }, entry.userEmail);

    const { error } = await this.supabaseService.client.from('PasswordReset').update({ used: true }).eq('id', entry.id);
    if (error) {
      console.error('AuthService.resetPassword — failed to mark code as used:', error.message);
    }

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  private async findValidResetCode(email: string, code: string): Promise<ValidResetCode | null> {
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedCode = code?.trim();
    if (!trimmedEmail || !trimmedCode) return null;

    const { data: user, error: userError } = await this.supabaseService.client
      .from('Utilisateur')
      .select('idutilisateur, email')
      .eq('email', trimmedEmail)
      .maybeSingle();
    if (userError) {
      throw new InternalServerErrorException(userError.message);
    }
    if (!user) return null;

    const { data: reset, error: resetError } = await this.supabaseService.client
      .from('PasswordReset')
      .select('id, expires_at')
      .eq('idutilisateur', user.idutilisateur)
      .eq('code', trimmedCode)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (resetError) {
      throw new InternalServerErrorException(resetError.message);
    }
    if (!reset) return null;
    if (new Date(reset.expires_at).getTime() < Date.now()) return null;

    return { id: reset.id, idutilisateur: user.idutilisateur, userEmail: user.email };
  }

  private async findByIdentifiant(identifiant: string): Promise<any | null> {
    const byEmail = await this.supabaseService.client
      .from('Utilisateur')
      .select('*')
      .eq('email', identifiant)
      .maybeSingle();
    if (byEmail.error) {
      throw new InternalServerErrorException(byEmail.error.message);
    }
    if (byEmail.data) {
      return byEmail.data;
    }

    const byUsername = await this.supabaseService.client
      .from('Utilisateur')
      .select('*')
      .eq('nomutilisateur', identifiant)
      .maybeSingle();
    if (byUsername.error) {
      throw new InternalServerErrorException(byUsername.error.message);
    }
    return byUsername.data ?? null;
  }

  // Existing rows may still hold a plaintext password from before hashing was
  // introduced. Accept a direct match once and transparently upgrade it to a
  // bcrypt hash so every account ends up hashed after its first login.
  private async verifyPassword(motDePasse: string, user: any): Promise<boolean> {
    const stored: string | undefined = user.motdepasse;
    if (!stored) return false;

    const isHashed = stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$');
    if (isHashed) {
      return bcrypt.compare(motDePasse, stored);
    }

    if (motDePasse !== stored) {
      return false;
    }

    const newHash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
    await this.supabaseService.client
      .from('Utilisateur')
      .update({ motdepasse: newHash })
      .eq('idutilisateur', user.idutilisateur);
    user.motdepasse = newHash;
    return true;
  }
}
