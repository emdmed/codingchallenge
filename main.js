const puppeteer = require("puppeteer");
const { start } = require("repl");
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

    await page.waitFor(2000)

  
    
    let datepicker = await page.waitForSelector("#datepicker");
    await datepicker.evaluate(datepicker => datepicker.click())

    //set custom range
    let date1 = await page.waitForSelector("td[data-title='r0c4']")
    await date1.evaluate(date1 => date1.click());
    let date2 = await page.waitForSelector("td[data-title='r4c5']")
    await date2.evaluate(date2 => date2.click());

    //specify desired date range
    await page.waitForSelector(".applyBtn");
    await page.evaluate(()=>{
        let dropdown = $("button.applyBtn")
        console.log("CLICK ", dropdown[0])
        $(dropdown[0]).click();
    })
    

    //await browser.close();
  })();