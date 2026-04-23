import { Module } from '@nestjs/common';
import { MarcheController } from './marche.controller';
import { MarcheService } from './marche.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [MarcheController],
  providers: [MarcheService],
})
export class MarcheModule {}
