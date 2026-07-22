import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async login({ identifiant, motDePasse }: LoginDto) {
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
