import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { Role, User } from '../auth/user.entity'; // Импортируем пользователя для добавления в компанию

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createCompany(name: string, description: string, currentUser: User): Promise<Company> {
    const company = new Company();
    company.name = name;
    company.description = description;
    company.createdBy = currentUser; // Assign the current user as the creator of the company

    // Save the company entity with the assigned createdBy user
    return this.companyRepository.save(company);
  }

  async addUserToCompany(companyId: number, userId: number, currentUser: User): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users', 'createdBy'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!company || !user) {
      throw new Error('Company or User not found');
    }

    // Проверяем, имеет ли текущий пользователь право добавлять сотрудников
    if (![Role.SUPER_MANAGER, Role.MANAGER].includes(currentUser.role)) {
      throw new ForbiddenException('You do not have permission to add employees');
    }

    // Проверяем, может ли текущий пользователь назначать роли
    if (currentUser.role === Role.SUPER_MANAGER) {
      company.users.push(user);
      return this.companyRepository.save(company);
    }

    throw new ForbiddenException('Only super managers can assign roles');
  }

  async assignRoleToUser(companyId: number, userId: number, newRole: Role, currentUser: User): Promise<User> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users', 'createdBy'],
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!company || !user) {
      throw new Error('Company or User not found');
    }

    // Проверяем, имеет ли текущий пользователь право изменять роли
    if (company.createdBy.id !== currentUser.id || currentUser.role !== Role.SUPER_MANAGER) {
      throw new ForbiddenException('Only the super manager who created the company can assign roles');
    }

    // Назначаем роль
    user.role = newRole;
    return this.userRepository.save(user);
  }

  async getUsersOfCompany(companyId: number): Promise<User[]> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'],
    });
    return company?.users || [];
  }

  async getCompanyById(companyId: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
      relations: ['users'], // Загружаем всех пользователей компании
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }
}
