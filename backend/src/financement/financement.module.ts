import { Module } from '@nestjs/common';
import { FinancementController } from './financement.controller';
import { FinancementService } from './financement.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FinancementController],
  providers: [FinancementService],
})
export class FinancementModule {}
