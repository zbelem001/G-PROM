import { Module } from '@nestjs/common';
import { FournisseurController } from './fournisseur.controller';
import { FournisseurService } from './fournisseur.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FournisseurController],
  providers: [FournisseurService],
})
export class FournisseurModule {}
