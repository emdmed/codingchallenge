const puppeteer = require("puppeteer")
const secrets = require("./secrets");


(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(secrets.url);
    
    //LOGIN
    let user = await page.waitForSelector("input[name='username']")
    await user.type(secrets.user)
    let password = await page.waitForSelector("input[name='password']")
    await password.type(secrets.password)
    let loginbutton = await page.waitForSelector("button[type='submit']")
    await loginbutton.evaluate(loginbutton => loginbutton.click());

  
    //await browser.close();
  })();