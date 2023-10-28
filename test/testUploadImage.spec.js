const { By, Builder } = require("selenium-webdriver");
const assert = require("assert");

describe("Upload Image", function () {
  let driver;

  before(async function () {
    driver = await new Builder().forBrowser("chrome").build();
    driver.manage().window().maximize();
  });

  it("Open dialog", async function () {
    await driver.get("http://localhost:3000");

    const addImageBtn = await driver.findElement(By.id("add-image-btn"));
    await addImageBtn.click();

    await driver.manage().setTimeouts({ implicit: 500 });

    const uploadImageCard = await driver.findElement(
      By.id("upload-image-card"),
    );
    assert.equal(true, await uploadImageCard.isDisplayed());
  });

  after(async () => await driver.quit());
});
