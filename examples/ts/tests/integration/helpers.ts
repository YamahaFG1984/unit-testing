// 集成测试里与业务无关的技术细节：清库、造数据、执行、查询、断言（第 10 章）。
import pg from 'pg'
import { beforeEach, expect } from 'vitest'
import { type IBus, type IDomainLogger, type MessageBus, UserController } from '../../src/application.js'
import { Company, CompanyFactory, User, UserFactory, UserType } from '../../src/domain.js'
import { CompanyRepository, Transaction, UserRepository } from '../../src/persistence.js'

export const CONNECTION_STRING =
  process.env.CRM_DB_URL ?? 'postgresql://crm:crm@localhost:54329/crm'

/** 在每个测试「开始」时清理普通数据；不动参考数据 user_type。 */
export function useCleanDatabase(): void {
  beforeEach(async () => {
    const client = new pg.Client({ connectionString: CONNECTION_STRING })
    await client.connect()
    try {
      await client.query('DELETE FROM users; DELETE FROM company;')
    } finally {
      await client.end()
    }
  })
}

async function inTransaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
  const transaction = await Transaction.begin(CONNECTION_STRING)
  try {
    return await work(transaction)
  } finally {
    await transaction.dispose()
  }
}

// ---- 准备段：Object Mother ----
export function createUser({
  email = 'user@mycorp.com',
  type = UserType.Employee,
  isEmailConfirmed = false,
}: { email?: string; type?: UserType; isEmailConfirmed?: boolean } = {}): Promise<User> {
  return inTransaction(async (transaction) => {
    const user = new User(0, email, type, isEmailConfirmed)
    await new UserRepository(transaction).saveUser(user)
    transaction.commit()
    return user
  })
}

export function createCompany(domainName: string, numberOfEmployees: number): Promise<Company> {
  return inTransaction(async (transaction) => {
    const company = new Company(domainName, numberOfEmployees)
    await new CompanyRepository(transaction).saveCompany(company)
    transaction.commit()
    return company
  })
}

// ---- 执行段：装饰方法 ----
export function execute(
  func: (controller: UserController) => Promise<string>,
  messageBus: MessageBus,
  logger: IDomainLogger,
): Promise<string> {
  return inTransaction((transaction) => func(new UserController(transaction, messageBus, logger)))
}

// ---- 断言段：重新查库 + 流式断言 ----
export function queryUser(userId: number): Promise<User | null> {
  return inTransaction(async (transaction) => {
    const data = await new UserRepository(transaction).getUserById(userId)
    return data ? UserFactory.create(data) : null
  })
}

export function queryCompany(): Promise<Company | null> {
  return inTransaction(async (transaction) => {
    const data = await new CompanyRepository(transaction).getCompany()
    return data ? CompanyFactory.create(data) : null
  })
}

export function expectUser(user: User | null) {
  const api = {
    toExist() {
      expect(user).not.toBeNull()
      return api
    },
    withEmail(email: string) {
      expect(user!.email).toBe(email)
      return api
    },
    withType(type: UserType) {
      expect(user!.type).toBe(type)
      return api
    },
  }
  return api
}

export function expectCompany(company: Company | null) {
  const api = {
    toExist() {
      expect(company).not.toBeNull()
      return api
    },
    withNumberOfEmployees(number: number) {
      expect(company!.numberOfEmployees).toBe(number)
      return api
    },
  }
  return api
}

/** 手写的 Mock，站在系统的最边缘（第 9 章）。消息格式在这里独立地又写了一遍。 */
export class BusSpy implements IBus {
  private readonly sentMessages: string[] = []

  send(message: string): void {
    this.sentMessages.push(message)
  }

  shouldSendNumberOfMessages(number: number): this {
    expect(this.sentMessages).toHaveLength(number)
    return this
  }

  withEmailChangedMessage(userId: number, newEmail: string): this {
    const message = `Type: USER EMAIL CHANGED; Id: ${userId}; NewEmail: ${newEmail}`
    expect(this.sentMessages).toContain(message)
    return this
  }
}
