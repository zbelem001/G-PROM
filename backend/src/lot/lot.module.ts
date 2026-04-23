import { Module } from '@nestjs/common';
import { LotController } from './lot.controller';
import { LotService } from './lot.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [LotController],
  providers: [LotService],
})
export class LotModule {}
