import { Module } from '@nestjs/common';
import { BailleurController } from './bailleur.controller';
import { BailleurService } from './bailleur.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BailleurController],
  providers: [BailleurService],
})
export class BailleurModule {}
