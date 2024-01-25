import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { IAdmin, AdminRole } from '../../Interface'

@Entity()
export class Admin implements IAdmin {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    email: string

    @Column()
    password: string

    @Column()
    avatar?: string

    @Column({
        type: 'enum',
        enum: AdminRole,
        default: AdminRole.DASHBOARD
    })
    role: AdminRole

    @Column({ nullable: true })
    permissions: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date
}
