import { Module } from '@nestjs/common';
import { HistoriqueConnexionController } from './historique-connexion.controller';
import { HistoriqueConnexionService } from './historique-connexion.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [HistoriqueConnexionController],
  providers: [HistoriqueConnexionService],
  exports: [HistoriqueConnexionService],
})
export class HistoriqueConnexionModule {}
