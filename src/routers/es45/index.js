const router = require('@koa/router')()
const puppeteer = require('puppeteer')
const {timeout, moment} = require('../../tools/index.js')

router.get('/es45', async (ctx) => {
  ctx.redirect('/es45/index')
})

router.get('/es45/index', async (ctx) => {
  return await ctx.render('es45/index')
})

router.post('/api/es45/start', async (ctx) => {
  let date = moment("Y-M-DTh:m:s");

  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()

  page.setViewport({width: 1200, height: 600})

  try {
    await page.goto('http://es45.com/f/17/new/1.html')
    await timeout(1000)
  } catch (e) {
    console.log('err', e)
  }


  // console.log(await page.content());
  // await page.screenshot({path: `screenshot_${date}.png`});

  // await browser.close();
})
module.exports = router