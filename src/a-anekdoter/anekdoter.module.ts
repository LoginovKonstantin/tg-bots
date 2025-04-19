import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AnekdoterService } from './anekdoter.service';
import { SentimentModule } from './sentiment/sentiment.module';
import { BoobsService } from './boobs.service';

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot(), SentimentModule],
  controllers: [],
  providers: [AnekdoterService, BoobsService],
})
export class AnekdoterModule {}
