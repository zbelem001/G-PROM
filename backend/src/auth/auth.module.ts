import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { HistoriqueConnexionModule } from '../historique-connexion/historique-connexion.module';

@Module({
  imports: [SupabaseModule, HistoriqueConnexionModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
