import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin',
      database: 'documentsdb',
      autoLoadEntities: true, // Автоматически загружает сущности
      synchronize: true, // Включает авто-создание таблиц (для разработки)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
