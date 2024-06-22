import { Module } from '@nestjs/common';
import { TournamentsModule } from './t-tournaments/tournaments.module';
import { AnekdoterModule } from './a-anekdoter/anekdoter.module';

@Module({
  imports: [TournamentsModule, AnekdoterModule],
})
export class AppModule {}
