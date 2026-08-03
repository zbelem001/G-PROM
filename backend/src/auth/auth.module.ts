import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { HistoriqueConnexionModule } from '../historique-connexion/historique-connexion.module';
import { EmailModule } from '../email/email.module';
import { UtilisateurModule } from '../utilisateur/utilisateur.module';

@Module({
  imports: [SupabaseModule, HistoriqueConnexionModule, EmailModule, UtilisateurModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
