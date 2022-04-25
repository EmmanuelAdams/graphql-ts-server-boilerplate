import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string | any;

  @Column('varchar', { length: 255 })
  email: string;

  @Column('text')
  password: string;

  @Column('boolean', { default: false }) confirmed: boolean;
}
