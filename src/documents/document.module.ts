import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  // Для подключения сущностей с TypeORM
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { Document } from './document.entity';  // Импортируем сущность документа
import { User } from '../auth/user.entity';  // Импортируем сущность пользователя, если нужно для связи

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, User]),  // Регистрируем сущности для работы с TypeORM
  ],
  controllers: [DocumentController],  // Регистрируем контроллер
  providers: [DocumentService],  // Регистрируем сервис
})
export class DocumentModule {}
