import { Module } from '@nestjs/common';
import { SoumissionController } from './soumission.controller';
import { SoumissionService } from './soumission.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SoumissionController],
  providers: [SoumissionService],
})
export class SoumissionModule {}
