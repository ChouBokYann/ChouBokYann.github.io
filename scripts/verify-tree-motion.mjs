import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser = await chromium.launch();
try {
  for (const [width,height] of [[1280,720],[390,844],[844,390]]) {
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4328/');
    const boughs=page.locator('[data-bough]');
    await boughs.first().waitFor();
    await page.waitForTimeout(700);
    assert.equal(await boughs.count(),3);
    assert(await boughs.evaluateAll(elements=>elements.every(e=>e.complete && e.naturalWidth>0)));
    const before=await boughs.first().evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(650);
    assert.notEqual(await boughs.first().evaluate(e=>getComputedStyle(e).transform),before);
    assert.equal(await page.locator('[data-fixed-trunk]').count(),2);
    assert(await page.locator('[data-fixed-trunk]').evaluateAll(elements=>elements.every(e=>getComputedStyle(e).animationName==='none')));
    const clouds=page.locator('[data-motion-layer="clouds"]');
    const cloudBefore=await clouds.evaluate(e=>getComputedStyle(e).transform);
    await page.waitForTimeout(700);
    assert.notEqual(await clouds.evaluate(e=>getComputedStyle(e).transform),cloudBefore);
    assert(await page.locator('[data-scene-base] img').evaluate(e=>e.currentSrc.includes('scene-bare')));
    // Both image and branch plane share the same cover-scaled aspect ratio.
    const plane=await page.locator('[data-structured-trees]').boundingBox();
    assert(plane && plane.width>=width-1);
    await page.screenshot({path:`test-results/trees-verified-${width}.png`});
    for (const edge of [0,1]) {
      await boughs.evaluateAll((elements,edge)=>elements.forEach(e=>e.getAnimations().forEach(a=>{a.pause();a.currentTime=edge*Number(a.effect.getTiming().duration);})),edge);
      await page.screenshot({path:`test-results/trees-extreme-${width}-${edge}.png`});
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    assert(await boughs.evaluateAll(elements=>elements.every(e=>getComputedStyle(e).animationName==='none')));
    assert.equal(await clouds.evaluate(e=>getComputedStyle(e).animationName),'none');
    await page.locator('[data-fuji-secret-trigger]').dispatchEvent('click');
    assert.equal(await page.locator('[data-fuji-secret-trigger]').getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[]);
    await page.close();
  }
  console.log('TREE MOTION VERIFIED');
} finally { await browser.close(); }
