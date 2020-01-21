import { someFunction } from './index'

describe('simple tests', () => {
  test('return 1', () => {
    expect(someFunction()).toEqual(1)
  })
})
