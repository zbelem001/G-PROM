import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FinancementService } from './financement.service';
import { CreateFinancementDto } from './dto/create-financement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('financements')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FinancementController {
  constructor(private readonly financementService: FinancementService) {}

  @Post()
  create(@Body() createFinancementDto: CreateFinancementDto) {
    return this.financementService.create(createFinancementDto);
  }

  @Get()
  findAll(@Query('idBailleur') idBailleur?: string) {
    return this.financementService.findAll(idBailleur ? Number(idBailleur) : undefined);
  }

  @Get(':idFinancement')
  findOne(@Param('idFinancement') idFinancement: string) {
    return this.financementService.findOne(Number(idFinancement));
  }

  @Patch(':idFinancement')
  update(@Param('idFinancement') idFinancement: string, @Body() updateFinancementDto: Partial<CreateFinancementDto>) {
    return this.financementService.update(Number(idFinancement), updateFinancementDto);
  }

  @Delete(':idFinancement')
  remove(@Param('idFinancement') idFinancement: string) {
    return this.financementService.remove(Number(idFinancement));
  }
}
