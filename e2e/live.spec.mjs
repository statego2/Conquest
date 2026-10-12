import { test, expect } from '@playwright/test';

test('the actual public GitHub Pages URL runs a playable canvas and controls',async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const response=await page.goto('/',{waitUntil:'domcontentloaded'});
  expect(response?.status()).toBe(200);
  await expect(page.locator('#world')).toBeVisible({timeout:15000});
  await expect(page.locator('#land')).toContainText('/');
  await expect(page.locator('#view-label')).toContainText('TACTICAL');
  const details=await page.locator('#world').evaluate(canvas=>{
    const context=canvas.getContext('2d');
    const x=Math.floor(canvas.width/2), y=Math.floor(canvas.height/2);
    return {width:canvas.width,height:canvas.height,drawn:context?context.getImageData(x,y,1,1).data[3]:0};
  });
  expect(details.width).toBeGreaterThan(500);
  expect(details.height).toBeGreaterThan(200);
  expect(details.drawn).toBeGreaterThan(0);
  await page.screenshot({path:testInfo.outputPath('live-tactical.png')});
  await page.locator('#view-strategic').click();
  await expect(page.locator('#view-label')).toContainText('WORLD COMMAND');
  await expect(page.locator('#command-deck')).toHaveClass(/is-strategic/);
  await page.screenshot({path:testInfo.outputPath('live-world.png')});
  await page.locator('#view-tactical').click();
  await expect(page.locator('#view-label')).toContainText('TACTICAL');
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('90%');
  await page.waitForTimeout(1000);
  expect(errors).toEqual([]);
});
