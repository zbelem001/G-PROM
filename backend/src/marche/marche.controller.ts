import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMarcheDto } from './dto/create-marche.dto';
import { MarcheService } from './marche.service';

@UseGuards(JwtAuthGuard)
@Controller('marches')
export class MarcheController {
  constructor(private readonly marcheService: MarcheService) {}

  @Post()
  create(@Body() createMarcheDto: CreateMarcheDto) {
    return this.marcheService.create(createMarcheDto);
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
  update(@Param('numbMarche') numbMarche: string, @Body() updateMarcheDto: Partial<CreateMarcheDto>) {
    return this.marcheService.update(numbMarche, updateMarcheDto);
  }

  @Delete(':numbMarche')
  remove(@Param('numbMarche') numbMarche: string) {
    return this.marcheService.remove(numbMarche);
  }
}
