var webdriver = require("selenium-webdriver");
require("geckodriver");
var firefox = require("selenium-webdriver/firefox");

var until = webdriver.until;
var By = webdriver.By;
var Key = webdriver.Key;
var element = webdriver.WebElement;

async function TennisBooker(hr, email, pwd) {
  var options = new firefox.Options();
  options.setProfile(
    "/Users/naser/Library/Application Support/Firefox/Profiles/43nh5j2m.default-release-1"
  );
  var builder = new webdriver.Builder().forBrowser("firefox");
  builder.setFirefoxOptions(options);
  driver = builder.build();

  await driver.get("https://edenbridgetennis.com/courtbooking/courts");

  await Login(driver, email, pwd);

  // Wait for page load
  await Promise.race([
    driver.wait(
      until.elementsLocated(
        By.xpath("//span[text()[contains(.,'Dashboard')]]")
      ),
      40000
    ),
    driver.wait(
      until.elementsLocated(
        By.xpath("//span[text()[contains(.,'Court Booking')]]")
      ),
      40000
    ),
  ]).then(async () => {
    await Book(driver, hr);
  });
}

async function Book(driver, hr) {
  try {
    // Move to next Day
    let nextButton = await driver.findElements(
      By.xpath(".//span[@class='fc-icon fc-icon-right-single-arrow']")
    );
    if (nextButton.length != 0) {
      nextButton[0].click();
    }

    let time = await driver.findElement(
      By.xpath(`.//tr[@data-time='${hr}:00']`)
    );

    let timeCoord = await time.getRect();
    const timeYCoord = await timeCoord.y;
    const adjustedTimeYCoord = parseInt(timeYCoord) + 5;
    // console.log(
    //   "🚀 ~ file: TennisBooker.js ~ line 57 ~ Book ~ timeYCoord",
    //   timeYCoord
    // );
    let courts = await driver.findElements(
      By.xpath(
        `//div[@class='fc-scroller fc-time-grid-container']//td[@data-date]`
      )
    );
    for (let i = 0; i < courts.length; i++) {
      let courtCoord = await courts[i].getRect();
      const courtXCoord = await courtCoord.x;
      const adjustedCourtXCoord = parseInt(courtXCoord) + 5;
      // console.log(
      //   "🚀 ~ file: TennisBooker.js ~ line 69 ~ Book ~ courtXCoord",
      //   courtXCoord
      // );

      const actions = driver.actions({ async: true });
      // Performs mouse move action onto the element
      await actions
        .move({
          x: adjustedCourtXCoord,
          y: adjustedTimeYCoord,
        })
        .press()
        .release()
        .perform();
      // .then(() =>
      //   console.log(
      //     "courtXCoordinate",
      //     courtXCoordinate,
      //     "timeYCoord",
      //     timeYCoord
      //   )
      // );
      await driver.sleep(2000);
      let maxRegistrants = await driver.findElements(
        By.xpath(`//select[@name='max_reg']`)
      );
      if (
        maxRegistrants.length != 0 &&
        (await maxRegistrants[0].isDisplayed())
      ) {
        await driver.sleep(2000);
        await maxRegistrants[0].click();
        await maxRegistrants[0]
          .findElement(By.xpath(`.//option[text()[contains(.,'Solo')]]`))
          .click();
        await driver
          .findElement(
            By.xpath(
              `//form[@id='bookcourt_form']//ins[@class="iCheck-helper"]`
            )
          )
          .click();
        await driver
          .findElement(
            By.xpath(`//form[@id='bookcourt_form']//input[@id="submitprivate"]`)
          )
          .click();
        break;
      }
    }
  } catch (error) {
    console.log("ERROR: ", error);
  }
}

async function Login(driver, email, pwd) {
  await driver.findElement(By.xpath("//input[@id='email']")).sendKeys(email);
  await driver.findElement(By.xpath("//input[@id='password']")).sendKeys(pwd);
  await driver
    .findElement(By.xpath("//span[text()[contains(.,'Login')]]"))
    .click();
}

module.exports = TennisBooker;
