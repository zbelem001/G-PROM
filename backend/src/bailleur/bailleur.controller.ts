import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BailleurService } from './bailleur.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';

@Controller('bailleurs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class BailleurController {
  constructor(private readonly bailleurService: BailleurService) {}

  @Post()
  create(@Body() createBailleurDto: CreateBailleurDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.bailleurService.create(createBailleurDto, user?.email);
  }

  @Get()
  findAll() {
    return this.bailleurService.findAll();
  }

  @Get(':idBailleur')
  findOne(@Param('idBailleur') idBailleur: string) {
    return this.bailleurService.findOne(Number(idBailleur));
  }

  @Patch(':idBailleur')
  update(
    @Param('idBailleur') idBailleur: string,
    @Body() updateBailleurDto: Partial<CreateBailleurDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.bailleurService.update(Number(idBailleur), updateBailleurDto, user?.email);
  }

  @Delete(':idBailleur')
  remove(@Param('idBailleur') idBailleur: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.bailleurService.remove(Number(idBailleur), user?.email);
  }
}
