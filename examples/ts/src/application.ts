// 应用服务层：只做编排（第 7、8、9 章）。
import { CompanyFactory, type DomainEvent, UserFactory, UserType } from './domain.js'
import { CompanyRepository, type Transaction, UserRepository } from './persistence.js'

/** 系统的最边缘：包在消息总线 SDK 外面的适配器。测试里只替换这一层（第 9 章）。 */
export interface IBus {
  send(message: string): void
}

/** 领域消息。它决定发到总线上的文本长什么样。 */
export class MessageBus {
  constructor(private readonly bus: IBus) {}

  sendEmailChangedMessage(userId: number, newEmail: string): void {
    this.bus.send(`Type: USER EMAIL CHANGED; Id: ${userId}; NewEmail: ${newEmail}`)
  }
}

/** 支持日志：业务要求记录的事件，逐个列成方法（第 8 章）。 */
export interface IDomainLogger {
  userTypeHasChanged(userId: number, oldType: UserType, newType: UserType): void
}

export class DomainLogger implements IDomainLogger {
  constructor(private readonly log: (message: string) => void = console.info) {}

  userTypeHasChanged(userId: number, oldType: UserType, newType: UserType): void {
    this.log(`User ${userId} changed type from ${UserType[oldType]} to ${UserType[newType]}`)
  }
}

/** 把领域事件翻译成对不受管依赖的调用。 */
export class EventDispatcher {
  constructor(
    private readonly messageBus: MessageBus,
    private readonly domainLogger: IDomainLogger,
  ) {}

  dispatch(events: readonly DomainEvent[]): void {
    for (const ev of events) {
      switch (ev.kind) {
        case 'EmailChanged':
          this.messageBus.sendEmailChangedMessage(ev.userId, ev.newEmail)
          break
        case 'UserTypeChanged':
          this.domainLogger.userTypeHasChanged(ev.userId, ev.oldType, ev.newType)
          break
      }
    }
  }
}

export class UserController {
  private readonly userRepository: UserRepository
  private readonly companyRepository: CompanyRepository
  private readonly eventDispatcher: EventDispatcher

  constructor(
    private readonly transaction: Transaction,
    messageBus: MessageBus,
    domainLogger: IDomainLogger,
  ) {
    this.userRepository = new UserRepository(transaction)
    this.companyRepository = new CompanyRepository(transaction)
    this.eventDispatcher = new EventDispatcher(messageBus, domainLogger)
  }

  async changeEmail(userId: number, newEmail: string): Promise<string> {
    const userData = await this.userRepository.getUserById(userId)
    const user = UserFactory.create(userData!)

    const error = user.canChangeEmail()
    if (error !== null) return error

    const companyData = await this.companyRepository.getCompany()
    const company = CompanyFactory.create(companyData!)

    user.changeEmail(newEmail, company)

    await this.companyRepository.saveCompany(company)
    await this.userRepository.saveUser(user)
    this.eventDispatcher.dispatch(user.domainEvents)

    this.transaction.commit()
    return 'OK'
  }
}
