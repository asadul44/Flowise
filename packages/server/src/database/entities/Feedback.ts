/* eslint-disable */
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Index, OneToMany, ManyToOne } from 'typeorm'
import { IFeedback } from '../../Interface'
import { ChatMessage } from './ChatMessage'
import { User } from './User'
@Entity()
export class Feedback implements IFeedback {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    key: string

    @Column()
    score: number

    @Column({ nullable: true })
    comment: string

    @Index()
    @Column()
    chatflowid: string

    @Index()
    @Column()
    chatId: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => ChatMessage, (chatMessage) => chatMessage.feedbacks)
    chatMessage: ChatMessage

    @ManyToOne(() => User, (user) => user.feedbacks)
    user: User
}
