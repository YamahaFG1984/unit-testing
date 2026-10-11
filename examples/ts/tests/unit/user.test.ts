import { expect, test } from 'vitest'
import { Company, User, UserFactory, UserType } from '../../src/domain.js'

test('changing email from non corporate to corporate', () => {
  const company = new Company('mycorp.com', 1)
  const sut = new User(1, 'user@gmail.com', UserType.Customer, false)

  sut.changeEmail('new@mycorp.com', company)

  expect(company.numberOfEmployees).toBe(2)
  expect(sut.email).toBe('new@mycorp.com')
  expect(sut.type).toBe(UserType.Employee)
  expect(sut.domainEvents).toEqual([
    { kind: 'UserTypeChanged', userId: 1, oldType: UserType.Customer, newType: UserType.Employee },
    { kind: 'EmailChanged', userId: 1, newEmail: 'new@mycorp.com' },
  ])
})

test('changing email from corporate to non corporate', () => {
  const company = new Company('mycorp.com', 1)
  const sut = new User(1, 'user@mycorp.com', UserType.Employee, false)

  sut.changeEmail('new@gmail.com', company)

  expect(company.numberOfEmployees).toBe(0)
  expect(sut.email).toBe('new@gmail.com')
  expect(sut.type).toBe(UserType.Customer)
  expect(sut.domainEvents).toEqual([
    { kind: 'UserTypeChanged', userId: 1, oldType: UserType.Employee, newType: UserType.Customer },
    { kind: 'EmailChanged', userId: 1, newEmail: 'new@gmail.com' },
  ])
})

test('changing email without changing user type', () => {
  const company = new Company('mycorp.com', 1)
  const sut = new User(1, 'user@gmail.com', UserType.Customer, false)

  sut.changeEmail('new@gmail.com', company)

  expect(company.numberOfEmployees).toBe(1)
  expect(sut.email).toBe('new@gmail.com')
  expect(sut.type).toBe(UserType.Customer)
  expect(sut.domainEvents).toEqual([{ kind: 'EmailChanged', userId: 1, newEmail: 'new@gmail.com' }])
})

test('changing email to the same one', () => {
  const company = new Company('mycorp.com', 1)
  const sut = new User(1, 'user@gmail.com', UserType.Customer, false)

  sut.changeEmail('user@gmail.com', company)

  expect(company.numberOfEmployees).toBe(1)
  expect(sut.email).toBe('user@gmail.com')
  expect(sut.type).toBe(UserType.Customer)
  expect(sut.domainEvents).toEqual([])
})

test('a confirmed email cannot be changed', () => {
  const sut = new User(1, 'user@gmail.com', UserType.Customer, true)

  const error = sut.canChangeEmail()

  expect(error).toBe("Can't change a confirmed email")
})

test('changing a confirmed email fails fast', () => {
  const company = new Company('mycorp.com', 1)
  const sut = new User(1, 'user@gmail.com', UserType.Customer, true)

  expect(() => sut.changeEmail('new@gmail.com', company)).toThrow()
})

test('a user is restored from a database row', () => {
  const user = UserFactory.create([5, 'user@mycorp.com', 2, true])

  expect(user.userId).toBe(5)
  expect(user.email).toBe('user@mycorp.com')
  expect(user.type).toBe(UserType.Employee)
  expect(user.isEmailConfirmed).toBe(true)
})
