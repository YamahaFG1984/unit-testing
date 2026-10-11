// 受管依赖：应用自己的数据库。事务与仓储分开（第 10 章）。
import pg from 'pg'
import type { Company, User } from './domain.js'

/** 贯穿一次业务操作。commit() 只在成功时调用；dispose() 时没提交就回滚。 */
export class Transaction {
  private committed = false

  private constructor(readonly client: pg.Client) {}

  static async begin(connectionString: string): Promise<Transaction> {
    const client = new pg.Client({ connectionString })
    await client.connect()
    await client.query('BEGIN')
    return new Transaction(client)
  }

  commit(): void {
    this.committed = true
  }

  async dispose(): Promise<void> {
    try {
      await this.client.query(this.committed ? 'COMMIT' : 'ROLLBACK')
    } finally {
      await this.client.end()
    }
  }
}

export class UserRepository {
  constructor(private readonly transaction: Transaction) {}

  async getUserById(userId: number): Promise<unknown[] | null> {
    const result = await this.transaction.client.query({
      text: 'SELECT user_id, email, type, is_email_confirmed FROM users WHERE user_id = $1',
      values: [userId],
      rowMode: 'array',
    })
    return result.rows[0] ?? null
  }

  async saveUser(user: User): Promise<void> {
    if (user.userId === 0) {
      const result = await this.transaction.client.query(
        'INSERT INTO users (email, type, is_email_confirmed) VALUES ($1, $2, $3) RETURNING user_id',
        [user.email, user.type, user.isEmailConfirmed],
      )
      user.userId = result.rows[0].user_id
    } else {
      await this.transaction.client.query(
        'UPDATE users SET email = $1, type = $2, is_email_confirmed = $3 WHERE user_id = $4',
        [user.email, user.type, user.isEmailConfirmed, user.userId],
      )
    }
  }
}

export class CompanyRepository {
  constructor(private readonly transaction: Transaction) {}

  async getCompany(): Promise<unknown[] | null> {
    const result = await this.transaction.client.query({
      text: 'SELECT domain_name, number_of_employees FROM company',
      rowMode: 'array',
    })
    return result.rows[0] ?? null
  }

  async saveCompany(company: Company): Promise<void> {
    const result = await this.transaction.client.query(
      'UPDATE company SET domain_name = $1, number_of_employees = $2',
      [company.domainName, company.numberOfEmployees],
    )
    if (result.rowCount === 0) {
      await this.transaction.client.query(
        'INSERT INTO company (domain_name, number_of_employees) VALUES ($1, $2)',
        [company.domainName, company.numberOfEmployees],
      )
    }
  }
}
