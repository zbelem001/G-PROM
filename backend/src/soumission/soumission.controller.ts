import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { SoumissionService } from './soumission.service';
import { CreateSoumissionDto } from './dto/create-soumission.dto';

@UseGuards(JwtAuthGuard)
@Controller('soumissions')
export class SoumissionController {
  constructor(private readonly soumissionService: SoumissionService) {}

  @Post()
  create(@Body() createSoumissionDto: CreateSoumissionDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.soumissionService.create(createSoumissionDto, user?.email);
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
  update(
    @Param('idSoumission') idSoumission: string,
    @Body() updateSoumissionDto: Partial<CreateSoumissionDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.soumissionService.update(idSoumission, updateSoumissionDto, user?.email);
  }

  @Delete(':idSoumission')
  remove(@Param('idSoumission') idSoumission: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.soumissionService.remove(idSoumission, user?.email);
  }
}
