import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { AvenantService } from './avenant.service';
import { CreateAvenantDto } from './dto/create-avenant.dto';

@UseGuards(JwtAuthGuard)
@Controller('avenants')
export class AvenantController {
  constructor(private readonly avenantService: AvenantService) {}

  @Post()
  create(@Body() createAvenantDto: CreateAvenantDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.avenantService.create(createAvenantDto, user?.email);
  }

  @Get()
  findAll() {
    return this.avenantService.findAll();
  }

  @Get(':idAvenant')
  findOne(@Param('idAvenant') idAvenant: string) {
    return this.avenantService.findOne(Number(idAvenant));
  }

  @Patch(':idAvenant')
  update(
    @Param('idAvenant') idAvenant: string,
    @Body() updateAvenantDto: Partial<CreateAvenantDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.avenantService.update(Number(idAvenant), updateAvenantDto, user?.email);
  }

  @Delete(':idAvenant')
  remove(@Param('idAvenant') idAvenant: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.avenantService.remove(Number(idAvenant), user?.email);
  }
}
