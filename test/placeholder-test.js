/* eslint-env babel-eslint, node, mocha */
import { expect } from 'chai'

import View from '../src/views/index'

describe('placeholder test of view', () => {
  let view
  before(() => {
    view = new View()
  })

  it('.render is a function', () => {
    expect(typeof view.render).to.equal('function')
  })

  it('.render() returns an object', () => {
    const element = view.render()
    expect(typeof element).to.equal('object')
  })
})
