import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { AuditService } from './audit.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('audit-log')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query('table') table?: string, @Query('recordId') recordId?: string) {
    return this.auditService.findAll(table, recordId);
  }
}
