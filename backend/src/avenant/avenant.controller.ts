import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AvenantService } from './avenant.service';
import { CreateAvenantDto } from './dto/create-avenant.dto';

@Controller('avenants')
export class AvenantController {
  constructor(private readonly avenantService: AvenantService) {}

  @Post()
  create(@Body() createAvenantDto: CreateAvenantDto) {
    return this.avenantService.create(createAvenantDto);
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
  update(@Param('idAvenant') idAvenant: string, @Body() updateAvenantDto: Partial<CreateAvenantDto>) {
    return this.avenantService.update(Number(idAvenant), updateAvenantDto);
  }

  @Delete(':idAvenant')
  remove(@Param('idAvenant') idAvenant: string) {
    return this.avenantService.remove(Number(idAvenant));
  }
}
