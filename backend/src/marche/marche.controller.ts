import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { CreateMarcheDto } from './dto/create-marche.dto';
import { MarcheService } from './marche.service';

@UseGuards(JwtAuthGuard)
@Controller('marches')
export class MarcheController {
  constructor(private readonly marcheService: MarcheService) {}

  @Post()
  create(@Body() createMarcheDto: CreateMarcheDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.marcheService.create(createMarcheDto, user?.email);
  }

  @Get()
  findAll() {
    return this.marcheService.findAll();
  }

  @Get(':numbMarche')
  findOne(@Param('numbMarche') numbMarche: string) {
    return this.marcheService.findOne(numbMarche);
  }

  @Patch(':numbMarche')
  update(
    @Param('numbMarche') numbMarche: string,
    @Body() updateMarcheDto: Partial<CreateMarcheDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.marcheService.update(numbMarche, updateMarcheDto, user?.email);
  }

  @Delete(':numbMarche')
  remove(@Param('numbMarche') numbMarche: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.marcheService.remove(numbMarche, user?.email);
  }
}
