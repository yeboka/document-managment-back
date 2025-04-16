import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user.entity'; // Import User entity for lazy loading

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique ID of the company' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Name of the company' })
  name: string;

  @Column()
  @ApiProperty({ description: 'Description of the company' })
  description: string;

  // A user can create only one company (ManyToOne with lazy loading)
  @ManyToOne(() => User, (user) => user.company, { nullable: false })
  @ApiProperty({ type: () => User, description: 'Creator of the company' })
  createdBy: User; // Creator of the company

  // A company can have many users (OneToMany with lazy loading)
  @OneToMany(() => User, (user) => user.company)
  @ApiProperty({ type: () => User, isArray: true, description: 'Users associated with the company' })
  users: User[];
}