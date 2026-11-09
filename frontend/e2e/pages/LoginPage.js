import { By, until } from 'selenium-webdriver'

export default class LoginPage {
  constructor(driver, baseUrl) {
    this.driver = driver
    this.baseUrl = baseUrl
  }

  async open() {
    await this.driver.get(`${this.baseUrl}/login`)
    await this.driver.wait(until.elementLocated(By.css('h1')), 10000)
  }

  async getHeading() {
    return this.driver.findElement(By.css('h1')).getText()
  }

  async getDescription() {
    return this.driver.findElement(By.css('main p')).getText()
  }
}
