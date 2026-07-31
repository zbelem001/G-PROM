import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { OptionMarcheService } from './option-marche.service';
import { CreateOptionMarcheDto } from './dto/create-option-marche.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('options-marche')
export class OptionMarcheController {
  constructor(private readonly optionMarcheService: OptionMarcheService) {}

  @Get()
  findAll(@Query('categorie') categorie?: string) {
    return this.optionMarcheService.findAll(categorie);
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() dto: CreateOptionMarcheDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.optionMarcheService.create(dto, user?.email);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.optionMarcheService.remove(Number(id), user?.email);
  }
}
