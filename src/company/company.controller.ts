import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiOperation, ApiResponse, ApiParam, ApiTags, ApiBody, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { Company } from './company.entity';
import { Role, User } from '../auth/user.entity';
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";

class CompanyCreateDto {
  @ApiProperty({ example: 'Name of Company', description: 'title of the future company' })
  name: string;
  @ApiProperty({ example: 'Company for document management', description: 'description of the future company' })
  description: string;
}

@ApiTags('Company') // Группировка эндпоинтов под тегом "Company" в Swagger
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @ApiOperation({
    summary: 'Создание новой компании',
    description: 'Этот эндпоинт позволяет создать новую компанию, указав её название и описание.'
  })
  @ApiBody({
    type: CompanyCreateDto // Validating the input with CompanyCreateDto
  })
  @ApiResponse({
    status: 201,
    description: 'Компания успешно создана.',
    type: Company,
  })
  @UseGuards(JwtAuthGuard) // Ensure the route is protected with JWT authentication
  async createCompany(
    @Body() body: CompanyCreateDto, // Using DTO for validation
    @Request() req // Get the currently authenticated user
  ) {
    const currentUser = req.user; // Extract the user from the request object (added by JwtAuthGuard)
    return this.companyService.createCompany(body.name, body.description, currentUser); // Pass the user as the creator
  }

  @Post(':companyId/user/:userId')
  @ApiOperation({
    summary: 'Добавить нового сотрудника в компанию',
    description: 'Только менеджеры и супер-менеджеры могут добавлять сотрудников.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID компании, для которой нужно добавить сотрудника.',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя, которого нужно добавить.',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Сотрудник успешно добавлен в компанию.',
    type: Company,
  })
  @UseGuards(JwtAuthGuard) // Добавляем защиту для только авторизованных пользователей
  async addUserToCompany(
    @Param('companyId') companyId: number,
    @Param('userId') userId: number,
    @CurrentUser() currentUser: User, // Встраиваем текущего пользователя из JWT токена
  ) {
    return this.companyService.addUserToCompany(companyId, userId, currentUser);
  }

  @Post(':companyId/user/:userId/role')
  @ApiOperation({
    summary: 'Назначить роль пользователю',
    description: 'Только супер-менеджер, который создал компанию, может назначать роли пользователям.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID компании.',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя, которому нужно назначить роль.',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Роль успешно назначена.',
    type: User,
  })
  @UseGuards(JwtAuthGuard) // Защита эндпоинта с помощью JWT
  async assignRole(
    @Param('companyId') companyId: number,
    @Param('userId') userId: number,
    @Body() body: { role: Role },
    @CurrentUser() currentUser: User,
  ) {
    return this.companyService.assignRoleToUser(companyId, userId, body.role, currentUser);
  }


  @Get(':companyId/users')
  @ApiBody({
    description: 'Этот эндпоинт позволяет получить список всех пользователей, связанных с компанией по её ID.'
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID компании, для которой нужно получить список сотрудников.',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Список сотрудников компании.',
    type: [User],
  })
  async getUsersOfCompany(@Param('companyId') companyId: number) {
    return this.companyService.getUsersOfCompany(companyId);
  }

  @Get(':companyId')
  @ApiOperation({
    summary: 'Получить информацию о компании',
    description: 'Этот эндпоинт позволяет получить информацию о компании по её ID.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'ID компании, для которой нужно получить информацию.',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о компании.',
    type: Company,
  })
  async getCompany(@Param('companyId') companyId: number) {
    return this.companyService.getCompanyById(companyId);
  }
}
