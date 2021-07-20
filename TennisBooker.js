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

  // Full Screen
  //await driver.switchTo().activeElement().sendKeys(Key.F11);

  await driver.manage().window().fullscreen();

  //await Login(driver, email, pwd);

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
    await driver.sleep(2000);

    // Enable this to scroll if screen height is not sufficient
    //await driver.executeScript("window.scrollBy(0,130)");

    let time = await driver.findElement(
      By.xpath(`.//tr[@data-time='${hr}:00']`)
    );

    let timeCoord = await time.getRect();
    const timeYCoord = await timeCoord.y;
    const adjustedTimeYCoord = parseInt(timeYCoord) + 10;

    let courts = await driver.findElements(
      By.xpath(
        `//div[@class='fc-scroller fc-time-grid-container']//td[@data-date]`
      )
    );

    let bookedCourtNo;
    // Loop through courts, prioritize court #4 Because it has nets on both sides so balls don't fly away :)
    for (let i = courts.length - 1; i >= 0; i--) {
      let courtCoord = await courts[i].getRect();
      const courtXCoord = await courtCoord.x;
      const adjustedCourtXCoord = parseInt(courtXCoord) + 10;

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
      //     "adjustedCourtXCoord",
      //     adjustedCourtXCoord,
      //     "adjustedTimeYCoord",
      //     adjustedTimeYCoord
      //   )
      // );
      await driver.sleep(2000);
      let maxRegistrants = await driver.findElements(
        By.xpath(`//select[@name='max_reg']`)
      );

      // If there exists a vacant slot, choose it, the next page that contains maxRegistrants list should be displayed
      if (await IsDisplayed(maxRegistrants)) {
        await driver.sleep(2000);
        await maxRegistrants[0].click();
        let solo = await getSubElement(
          maxRegistrants[0],
          `.//option[text()[contains(.,'Solo')]]`
        );
        solo.click();
        let checkMark = await getElement(
          driver,
          `//form[@id='bookcourt_form']//ins[@class="iCheck-helper"]`
        );
        checkMark.click();
        let submit = await getElement(
          driver,
          `//form[@id='bookcourt_form']//input[@id="submitprivate"]`
        );
        submit.click();
        bookedCourtNo = i + 1;
        break;
      }
    }
    await driver.sleep(10000);

    let myBooking = await driver.findElements(
      By.xpath(`.//div[text()[contains(.,'My Booking.')]]`)
    );
    if (await IsDisplayed(myBooking)) {
      console.log(
        `Success! you are booked court number ${bookedCourtNo} for ${hr}`
      );
    } else {
      throw new Error(`ERROR: My Booking could not be found`);
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

async function getElement(driver, xpath) {
  let webElements = await driver.findElements(By.xpath(xpath));
  if (webElements.length != 0) {
    return webElements[0];
  } else {
    throw new Error(`ERROR: getElement: Unable to find ${xpath}`);
  }
}

async function getSubElement(parentElement, xpath) {
  return await parentElement.findElement(By.xpath(xpath));
}
async function IsDisplayed(webElements) {
  if (webElements.length != 0 && (await webElements[0].isDisplayed())) {
    return true;
  } else {
    return false;
  }
}
module.exports = TennisBooker;
