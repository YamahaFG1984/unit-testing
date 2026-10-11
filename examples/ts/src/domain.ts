// 领域模型：只做决定，不碰任何进程外依赖（第 7 章）。

export class Precondition {
  static requires(condition: boolean): void {
    if (!condition) throw new Error('Precondition failed')
  }
}

export enum UserType {
  Customer = 1,
  Employee = 2,
}

// 领域事件：不可变的值
export type EmailChangedEvent = {
  readonly kind: 'EmailChanged'
  readonly userId: number
  readonly newEmail: string
}
export type UserTypeChangedEvent = {
  readonly kind: 'UserTypeChanged'
  readonly userId: number
  readonly oldType: UserType
  readonly newType: UserType
}
export type DomainEvent = EmailChangedEvent | UserTypeChangedEvent

export class Company {
  constructor(
    readonly domainName: string,
    private _numberOfEmployees: number,
  ) {}

  get numberOfEmployees(): number {
    return this._numberOfEmployees
  }

  changeNumberOfEmployees(delta: number): void {
    Precondition.requires(this._numberOfEmployees + delta >= 0)
    this._numberOfEmployees += delta
  }

  isEmailCorporate(email: string): boolean {
    const emailDomain = email.split('@')[1]
    return emailDomain === this.domainName
  }
}

export class User {
  private readonly _domainEvents: DomainEvent[] = []

  constructor(
    public userId: number,
    private _email: string,
    private _type: UserType,
    readonly isEmailConfirmed: boolean,
  ) {}

  get email(): string {
    return this._email
  }
  get type(): UserType {
    return this._type
  }
  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents
  }

  canChangeEmail(): string | null {
    if (this.isEmailConfirmed) return "Can't change a confirmed email"
    return null
  }

  changeEmail(newEmail: string, company: Company): void {
    Precondition.requires(this.canChangeEmail() === null)

    if (this._email === newEmail) return

    const newType = company.isEmailCorporate(newEmail) ? UserType.Employee : UserType.Customer

    if (this._type !== newType) {
      const delta = newType === UserType.Employee ? 1 : -1
      company.changeNumberOfEmployees(delta)
      this._domainEvents.push({
        kind: 'UserTypeChanged',
        userId: this.userId,
        oldType: this._type,
        newType,
      })
    }

    this._email = newEmail
    this._type = newType
    this._domainEvents.push({ kind: 'EmailChanged', userId: this.userId, newEmail })
  }
}

/** 把数据库里的一行还原成 User。没有协作者，可以直接做单元测试。 */
export class UserFactory {
  static create(data: unknown[]): User {
    Precondition.requires(data.length >= 4)
    return new User(
      data[0] as number,
      data[1] as string,
      data[2] as UserType,
      data[3] as boolean,
    )
  }
}

export class CompanyFactory {
  static create(data: unknown[]): Company {
    Precondition.requires(data.length >= 2)
    return new Company(data[0] as string, data[1] as number)
  }
}
