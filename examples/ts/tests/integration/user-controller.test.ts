import { describe, expect, test, vi } from 'vitest'
import { type IDomainLogger, MessageBus } from '../../src/application.js'
import { UserType } from '../../src/domain.js'
import {
  BusSpy,
  createCompany,
  createUser,
  execute,
  expectCompany,
  expectUser,
  queryCompany,
  queryUser,
  useCleanDatabase,
} from './helpers.js'

describe('UserController', () => {
  useCleanDatabase()

  test('changing email from corporate to non corporate', async () => {
    // Arrange
    const user = await createUser({ email: 'user@mycorp.com', type: UserType.Employee })
    await createCompany('mycorp.com', 1)

    const busSpy = new BusSpy()
    const messageBus = new MessageBus(busSpy)
    const loggerMock: IDomainLogger = { userTypeHasChanged: vi.fn() }

    // Act
    const result = await execute(
      (x) => x.changeEmail(user.userId, 'new@gmail.com'),
      messageBus,
      loggerMock,
    )

    // Assert
    expect(result).toBe('OK')

    expectUser(await queryUser(user.userId))
      .toExist()
      .withEmail('new@gmail.com')
      .withType(UserType.Customer)

    expectCompany(await queryCompany())
      .toExist()
      .withNumberOfEmployees(0)

    busSpy.shouldSendNumberOfMessages(1).withEmailChangedMessage(user.userId, 'new@gmail.com')
    expect(loggerMock.userTypeHasChanged).toHaveBeenCalledOnce()
    expect(loggerMock.userTypeHasChanged).toHaveBeenCalledWith(
      user.userId,
      UserType.Employee,
      UserType.Customer,
    )
  })
})
