import { Module, Global } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';

@Global()
@Module({
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
