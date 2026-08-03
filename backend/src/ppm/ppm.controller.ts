import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { PpmService } from './ppm.service';
import { CreatePpmDto } from './dto/create-ppm.dto';

@UseGuards(JwtAuthGuard)
@Controller('ppm')
export class PpmController {
  constructor(private readonly ppmService: PpmService) {}

  @Post()
  create(@Body() dto: CreatePpmDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.ppmService.create(dto, user?.email);
  }

  @Get()
  findAll() {
    return this.ppmService.findAll();
  }

  @Get(':numbMarche')
  findOne(@Param('numbMarche') numbMarche: string) {
    return this.ppmService.findOne(numbMarche);
  }

  @Patch(':numbMarche')
  update(
    @Param('numbMarche') numbMarche: string,
    @Body() dto: Partial<CreatePpmDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.ppmService.update(numbMarche, dto, user?.email);
  }

  @Delete(':numbMarche')
  remove(@Param('numbMarche') numbMarche: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.ppmService.remove(numbMarche, user?.email);
  }
}
