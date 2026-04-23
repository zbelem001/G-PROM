import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SoumissionService } from './soumission.service';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@Controller('soumissions')
export class SoumissionController {
  constructor(private readonly soumissionService: SoumissionService) {}

  @Post()
  create(@Body() createSoumissionDto: CreateSoumissionDto) {
    return this.soumissionService.create(createSoumissionDto);
  }

  @Get()
  findAll() {
    return this.soumissionService.findAll();
  }

  @Get(':idSoumission')
  findOne(@Param('idSoumission') idSoumission: string) {
    return this.soumissionService.findOne(idSoumission);
  }

  @Patch(':idSoumission')
  update(@Param('idSoumission') idSoumission: string, @Body() updateSoumissionDto: Partial<CreateSoumissionDto>) {
    return this.soumissionService.update(idSoumission, updateSoumissionDto);
  }

  @Delete(':idSoumission')
  remove(@Param('idSoumission') idSoumission: string) {
    return this.soumissionService.remove(idSoumission);
  }
}
