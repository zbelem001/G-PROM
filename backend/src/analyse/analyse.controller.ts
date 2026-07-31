import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { AnalyseService } from './analyse.service';
import { CreateAnalyseDto } from './dto/create-analyse.dto';

@UseGuards(JwtAuthGuard)
@Controller('analyses')
export class AnalyseController {
  constructor(private readonly analyseService: AnalyseService) {}

  @Post()
  create(@Body() createAnalyseDto: CreateAnalyseDto, @CurrentUser() user?: AuthenticatedUser) {
    return this.analyseService.create(createAnalyseDto, user?.email);
  }

  @Get()
  findAll() {
    return this.analyseService.findAll();
  }

  @Get(':numbLot')
  findOne(@Param('numbLot') numbLot: string) {
    return this.analyseService.findOne(numbLot);
  }

  @Patch(':numbLot')
  update(
    @Param('numbLot') numbLot: string,
    @Body() updateAnalyseDto: Partial<CreateAnalyseDto>,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.analyseService.update(numbLot, updateAnalyseDto, user?.email);
  }

  @Delete(':numbLot')
  remove(@Param('numbLot') numbLot: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.analyseService.remove(numbLot, user?.email);
  }
}
