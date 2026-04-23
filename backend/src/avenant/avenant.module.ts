import { Module } from '@nestjs/common';
import { AvenantController } from './avenant.controller';
import { AvenantService } from './avenant.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AvenantController],
  providers: [AvenantService],
})
export class AvenantModule {}
