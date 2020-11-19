const puppeteer = require("puppeteer")
const secrets = require("./secrets");


(async () => {
    const browser = await puppeteer.launch({headless: false});

    //override notifications popup (not working)
    const context = browser.defaultBrowserContext();
    context.overridePermissions(secrets.rooturl, ["notifications", "geolocation"])
    const page = await browser.newPage();
    await page.goto(secrets.url);

    //login
    let user = await page.waitForSelector("input[name='username']")
    await user.type(secrets.user)
    let password = await page.waitForSelector("input[name='password']")
    await password.type(secrets.password)
    let loginbutton = await page.waitForSelector("button[type='submit']")
    await loginbutton.evaluate(loginbutton => loginbutton.click());

    //refuse notifications
    let notification = await page.waitForSelector("#pushActionRefuse")
    await notification.evaluate(notification => notification.click())

    //change date range
    let datepicker = await page.waitForSelector("#datepicker");
    await datepicker.evaluate(datepicker => datepicker.click())
  
    //await browser.close();
  })();