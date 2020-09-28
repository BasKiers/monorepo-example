import {sum} from "./index";

describe('it', () => {
  it('dummy', () => {
    expect(true).toEqual(true)
  })

  it('check sum', () => {
    expect(sum(5, 10)).toBe(15)
  })
});