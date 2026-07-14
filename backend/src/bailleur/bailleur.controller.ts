import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BailleurService } from './bailleur.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';

@Controller('bailleurs')
export class BailleurController {
  constructor(private readonly bailleurService: BailleurService) {}

  @Post()
  create(@Body() createBailleurDto: CreateBailleurDto) {
    return this.bailleurService.create(createBailleurDto);
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
  update(@Param('idBailleur') idBailleur: string, @Body() updateBailleurDto: Partial<CreateBailleurDto>) {
    return this.bailleurService.update(Number(idBailleur), updateBailleurDto);
  }

  @Delete(':idBailleur')
  remove(@Param('idBailleur') idBailleur: string) {
    return this.bailleurService.remove(Number(idBailleur));
  }
}
