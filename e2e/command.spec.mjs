import { test,expect } from '@playwright/test';

test('landscape tactical map loads and supports all three command scales',async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#world')).toBeVisible();
  await expect(page.locator('#land')).toContainText('/');
  await expect(page.locator('#view-label')).toContainText('TACTICAL');
  const canvas=page.locator('#world');
  const visible=await canvas.evaluate(node=>({
    w:node.width,h:node.height,ctx:!!node.getContext('2d')
  }));
  expect(visible.ctx).toBe(true);
  expect(visible.w).toBeGreaterThan(400);
  expect(visible.h).toBeGreaterThan(200);
  await page.screenshot({path:testInfo.outputPath('micro-landscape.png')});

  await page.locator('#view-operational').click();
  await expect(page.locator('#view-label')).toContainText('OPERATIONAL');
  await page.screenshot({path:testInfo.outputPath('regional-landscape.png')});

  await page.locator('#view-strategic').click();
  await expect(page.locator('#view-label')).toContainText('WORLD COMMAND');
  await page.screenshot({path:testInfo.outputPath('world-landscape.png')});
  await expect(page.locator('#command-deck')).toHaveClass(/is-strategic/);
  // WORLD is now a real command mode, not a forced zoom-in.
  // Tapping a region should keep strategic mode and the army-order deck alive.
  await page.locator('#world').click({position:{x:290,y:160}});
  await expect(page.locator('#view-label')).toContainText('WORLD COMMAND');
  await expect(page.locator('#command-deck')).toHaveClass(/is-strategic/);
  await expect(page.locator('#commitment')).toBeVisible();
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('90%');
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('35%');
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('65%');

  await page.locator('#view-tactical').click();
  await expect(page.locator('#view-label')).toContainText('TACTICAL');
  await expect(page.locator('#view-tactical')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#commitment')).toContainText('65%');
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('90%');
  await page.locator('#commitment').click();
  await expect(page.locator('#commitment')).toContainText('35%');
  expect(errors).toEqual([]);
});

test('portrait phone has a visible canvas and accessible battle actions',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  for(const id of ['world','view-auto','view-tactical','view-operational','view-strategic','pause','commitment','support','mobilize','revolt']){
    await expect(page.locator('#'+id)).toBeVisible();
  }
  await page.locator('#view-auto').click();
  const order=await page.locator('#commitment').boundingBox();
  expect(order).not.toBeNull();
  expect(order.x).toBeGreaterThanOrEqual(-1);
  expect(order.x+order.width).toBeLessThanOrEqual(391);
  await page.screenshot({path:testInfo.outputPath('portrait-controls.png')});
});

test('WORLD map dispatches a real assault without forcing MICRO zoom',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#view-label')).toContainText('TACTICAL');
  await page.locator('#view-strategic').click();
  await expect(page.locator('#view-label')).toContainText('WORLD COMMAND');
  // Seed 24102. From capital (4,9), this hits adjacent neutral sector (4,10).
  // Coordinates are relative to an 844 x 390 landscape phone viewport.
  await page.locator('#world').click({position:{x:235,y:155}});
  await expect(page.locator('#toast')).toContainText('OFFENSIVE DISPATCHED',{timeout:5000});
  await expect(page.locator('#view-label')).toContainText('WORLD COMMAND');
});
