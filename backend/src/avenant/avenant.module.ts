import { Module } from '@nestjs/common';
import { AvenantController } from './avenant.controller';
import { AvenantService } from './avenant.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [SupabaseModule, AuditModule],
  controllers: [AvenantController],
  providers: [AvenantService],
})
export class AvenantModule {}
