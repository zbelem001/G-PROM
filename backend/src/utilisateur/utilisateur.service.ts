import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';

const SALT_ROUNDS = 10;

// Institutional email convention: prenom.nom@2ie-edu.org (hyphenated names allowed).
const EMAIL_PATTERN = /^[a-z]+(-[a-z]+)*\.[a-z]+(-[a-z]+)*@2ie-edu\.org$/;

@Injectable()
export class UtilisateurService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private normalizeKeys(dto: object): Record<string, unknown> {
    return Object.entries(dto).reduce((normalized, [key, value]) => {
      const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
      normalized[lowerKey] = value;
      return normalized;
    }, {} as Record<string, unknown>);
  }

  private sanitize<T extends { motdepasse?: unknown }>(user: T): Omit<T, 'motdepasse'> {
    const { motdepasse, ...rest } = user;
    return rest;
  }

  private validateEmail(payload: Record<string, unknown>) {
    if (typeof payload.email !== 'string') return;
    const email = payload.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new BadRequestException(
        "L'email doit respecter le format prenom.nom@2ie-edu.org",
      );
    }
    payload.email = email;
  }

  async create(createUtilisateurDto: CreateUtilisateurDto) {
    const payload = this.normalizeKeys(createUtilisateurDto);
    this.validateEmail(payload);
    if (typeof payload.motdepasse === 'string') {
      payload.motdepasse = await bcrypt.hash(payload.motdepasse, SALT_ROUNDS);
    }

    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .insert([payload])
      .select();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return (data ?? []).map((row) => this.sanitize(row));
  }

  async findAll() {
    const { data, error } = await this.supabaseService.client.from('Utilisateur').select('*');
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return (data ?? []).map((row) => this.sanitize(row));
  }

  async findOne(idUtilisateur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .select('*')
      .eq('idutilisateur', idUtilisateur)
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return this.sanitize(data);
  }

  async update(idUtilisateur: number, updateUtilisateurDto: Partial<CreateUtilisateurDto>) {
    const payload = this.normalizeKeys(updateUtilisateurDto);
    this.validateEmail(payload);
    if (typeof payload.motdepasse === 'string') {
      payload.motdepasse = await bcrypt.hash(payload.motdepasse, SALT_ROUNDS);
    }

    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .update(payload)
      .eq('idutilisateur', idUtilisateur)
      .select()
      .single();
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return this.sanitize(data);
  }

  async remove(idUtilisateur: number) {
    const { data, error } = await this.supabaseService.client
      .from('Utilisateur')
      .delete()
      .eq('idutilisateur', idUtilisateur);
    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }
}
