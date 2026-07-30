import { Module } from '@nestjs/common';
import { OptionMarcheController } from './option-marche.controller';
import { OptionMarcheService } from './option-marche.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [OptionMarcheController],
  providers: [OptionMarcheService],
})
export class OptionMarcheModule {}
