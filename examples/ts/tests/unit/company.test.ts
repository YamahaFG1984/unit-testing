import { expect, test } from 'vitest'
import { Company } from '../../src/domain.js'

test.each([
  ['mycorp.com', 'email@mycorp.com', true],
  ['mycorp.com', 'email@gmail.com', false],
])('differentiates a corporate email from non corporate (%s, %s)', (domain, email, expectedResult) => {
  const sut = new Company(domain, 0)

  const isEmailCorporate = sut.isEmailCorporate(email)

  expect(isEmailCorporate).toBe(expectedResult)
})

test('the number of employees cannot become negative', () => {
  const sut = new Company('mycorp.com', 0)

  expect(() => sut.changeNumberOfEmployees(-1)).toThrow()
})
