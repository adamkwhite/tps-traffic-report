const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Load configuration from config.json
const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('Missing config.json — copy config.example.json and fill in your details.');
  process.exit(1);
}
const CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const FORM_URL = 'https://www.tps.ca/services/online-reporting/local-neighbourhood-traffic-issue-concern/';

function getTodayParts() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const monthNames = [
    '01-January', '02-February', '03-March', '04-April',
    '05-May', '06-June', '07-July', '08-August',
    '09-September', '10-October', '11-November', '12-December'
  ];
  const month = monthNames[now.getMonth()];
  const day = now.getDate().toString().padStart(2, '0');
  return { year, month, day };
}

function isSunday() {
  return new Date().getDay() === 0;
}

async function submitReport() {
  if (isSunday()) {
    console.log('Skipping: today is Sunday.');
    return;
  }

  console.log(`Starting report submission at ${new Date().toISOString()}`);
  const today = getTodayParts();

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to form
    await page.goto(FORM_URL, { waitUntil: 'networkidle', timeout: 30000 });
    const iframe = page.frameLocator('iframe');

    // Wait for form to load inside iframe
    await iframe.locator('#firstNameField').waitFor({ timeout: 15000 });
    console.log('Form loaded - filling Yourself page');

    // === YOURSELF PAGE ===
    await iframe.locator('#firstNameField').fill(CONFIG.firstName);
    await iframe.locator('#lastNameField').fill(CONFIG.lastName);
    // Home address left blank intentionally
    await iframe.locator('#emailField').fill(CONFIG.email);
    await iframe.locator('#emailConfirmField').fill(CONFIG.email);

    // Phone - type char by char so form auto-inserts dashes
    const phoneField = iframe.locator('#hmPhoneField');
    await phoneField.click();
    await phoneField.type(CONFIG.phone, { delay: 50 });

    // Gender
    await iframe.locator('#sexField').selectOption(CONFIG.gender);

    // DOB
    await iframe.locator('#year1').selectOption(CONFIG.dob.year);
    await iframe.locator('#month1').selectOption(CONFIG.dob.month);
    await iframe.locator('select[name="day1"]').selectOption(CONFIG.dob.day);

    // Click Continue
    await iframe.getByRole('link', { name: 'Continue >' }).click();
    console.log('Yourself page submitted');

    // Wait for Incident page
    await iframe.locator('#stNoField').waitFor({ timeout: 15000 });
    console.log('On Incident page');

    // === INCIDENT PAGE ===
    await iframe.locator('#stNoField').fill(CONFIG.incidentStreetNum);
    await iframe.locator('#stNameField').fill(CONFIG.incidentStreetName);
    await iframe.locator('#stTypeField').selectOption(CONFIG.incidentStreetType);
    await iframe.locator('#incStateField').selectOption(CONFIG.incidentProvince);

    // Incident Time (start) - use today's date
    await iframe.locator('#year2').selectOption(today.year);
    await iframe.locator('#month2').selectOption(today.month);
    await iframe.locator('#day2').selectOption(today.day);
    await iframe.locator('#hour').selectOption(CONFIG.incidentStartHour);
    await iframe.locator('#minute').selectOption(CONFIG.incidentStartMinute);
    await iframe.locator('#ampm').selectOption(CONFIG.incidentStartAmPm);

    // Incident Time (end)
    await iframe.locator('#year2_0').selectOption(today.year);
    await iframe.locator('#month2_0').selectOption(today.month);
    await iframe.locator('#day2_0').selectOption(today.day);
    await iframe.locator('#hour_0').selectOption(CONFIG.incidentEndHour);
    await iframe.locator('#minute_0').selectOption(CONFIG.incidentEndMinute);
    await iframe.locator('#ampm_0').selectOption(CONFIG.incidentEndAmPm);

    // Ongoing incident checkbox
    if (CONFIG.ongoingIncident) {
      const checkbox = iframe.locator('input[type="checkbox"]').first();
      if (!(await checkbox.isChecked())) {
        await checkbox.check();
      }
    }

    // Location Type
    await iframe.locator('#locTypeField').selectOption(CONFIG.locationType);

    // Vehicle Info: No
    if (!CONFIG.hasVehicleInfo) {
      await iframe.locator('#radio_30').check();
    }

    // Click Continue
    await iframe.getByRole('link', { name: 'Continue >' }).click();
    console.log('Incident page submitted');

    // Wait for Narrative page
    await iframe.locator('textarea').first().waitFor({ timeout: 15000 });
    console.log('On Narrative page');

    // === NARRATIVE PAGE ===
    await iframe.locator('textarea').first().fill(CONFIG.narrative);

    // Click Continue
    await iframe.getByRole('link', { name: 'Continue >' }).click();
    console.log('Narrative page submitted');

    // Wait for Review page
    await iframe.getByRole('link', { name: 'Submit Report' }).first().waitFor({ timeout: 15000 });
    console.log('On Review page - submitting report');

    // === SUBMIT ===
    await iframe.getByRole('link', { name: 'Submit Report' }).first().click();

    // Wait for confirmation
    await page.waitForTimeout(5000);
    const bodyText = await iframe.locator('body').innerText();

    if (bodyText.includes('Finish') || bodyText.includes('submitted') || bodyText.includes('approved')) {
      console.log('Report submitted successfully!');
    } else {
      console.log('Submission result unclear. Page text:');
      console.log(bodyText.substring(0, 500));
    }

  } catch (error) {
    console.error('Error submitting report:', error.message);

    // Take a screenshot for debugging
    const screenshotPath = `C:\\Scripts\\tps-report\\error-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.error(`Screenshot saved to ${screenshotPath}`);

  } finally {
    await browser.close();
    console.log(`Finished at ${new Date().toISOString()}`);
  }
}

submitReport();
