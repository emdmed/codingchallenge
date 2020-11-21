const puppeteer = require("puppeteer");
const secrets = require("./secrets");

var mysql = require('mysql');

var con = mysql.createConnection({
  host: secrets.db.host,
  user: secrets.db.user,
  password: secrets.db.password,
  database: "sql10377593"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});


(async () => {
  const browser = await puppeteer.launch({ headless: true });

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

  await page.goto(secrets.rooturl + "/list?type=dates");

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
  await page.evaluate(() => {
    let dropdown = $("button.applyBtn")
    console.log("CLICK ", dropdown[0])
    $(dropdown[0]).click();
  })

  await page.waitFor(2000)



  console.log("GETTING TABLE")
  //grab data
  for (var i = 3; i < 9; i++) {
    //get pagination buttons
    await page.evaluate((i) => {
      let lielements = $(".pagination").find("li");
      $(lielements[i]).click();
    }, i)

    await page.waitFor(1000)

    //grab table values
    let table = await getTableData(page)

    try{
      insertElementInDB(table)
    } catch(err){
      console.log("Error inserting into db")
    }
    
  }

  //await browser.close();
})();

async function getTableData(page) {
  let data = await page.evaluate(() => {
    let tableArray = [];
    let table = $("table[data-url='dates']")
    //table body
    let line = $(table).find('> tbody > tr');

    for (key in line) {
      let lineObject = {}
      let data = $(line[key]).find("td")
      if (data.length === 8) {
        for (let i = 0; i < data.length; i++) {
          if (i === 0) {
            lineObject.date = $(data[i]).text().replace(",", "")
          } else if (i === 1) {
            lineObject.comissions = $(data[i]).text().replace(",", "")
          } else if (i === 2) {
            lineObject.sales = $(data[i]).text().replace(",", "")
          } else if (i === 3) {
            lineObject.leads = $(data[i]).text().replace(",", "")
          } else if (i === 4) {
            lineObject.clicks = $(data[i]).text().replace(",", "")
          } else if (i === 5) {
            lineObject.epc = $(data[i]).text().replace(",", "")
          } else if (i === 6) {
            lineObject.impressions = $(data[i]).text().replace(",", "")
          } else if (i === 7) {
            lineObject.cr = $(data[i]).text().replace(",", "")
          } else {

          }
        }
        tableArray.push(lineObject);
        lineObject = {}
      }
    }
    console.log("Table retrieved")
    return tableArray
  })

  return data
}


function insertElementInDB(tableArray){
  tableArray.forEach(element=>{
    var sql = `INSERT INTO dateTable (date_, comissionTotal, salesNet, leadsNet, clicks, epc, impressions, cr) VALUES (${element.date}, ${parseInt(element.comissions.replace("$", ""))}, ${parseInt(element.sales)}, ${parseInt(element.leads)}, ${parseInt(element.clicks)}, ${parseFloat(element.epc.replace("$", ""))}, ${parseInt(element.impressions)}, ${parseFloat(element.cr.replace("%", ""))})`;
    console.log(sql)
    
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });

  })

}

