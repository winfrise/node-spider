const router = require('@koa/router')()
const puppeteer = require('puppeteer')
const {timeout, moment} = require('../../tools/index.js')

router.get('/hfxzxy', async (ctx) => {
  ctx.redirect('/hfxzxy/index')
})

router.get('/hfxzxy/index', async (ctx) => {
  return await ctx.render('hfxzxy/index')
})

router.post('/api/hfxzxy/start', async (ctx) => {
  let now = moment("Y-M-DTh:m:s");

  const browser = await puppeteer.launch({headless: false})
  const page = await browser.newPage()

  page.setViewport({width: 1400, height: 800})

  try {
    await page.goto('http://www.hfxzxy.com/index.php/art/type/id/21/page/1.html', {
      waitUntil: 'networkidle2',
      timeout: 0
    })
    await timeout(1000)

    // 获取文章列表
    let articleList = await page.evaluate(() => {
        var list = [...document.querySelectorAll('.list ul li a')]

        return list.map(el => {
            return {
                href: el.href.trim(), 
                title: el.innerText
            }
        })
    })

    let currentIndex = 0

    factorial()
    async function factorial (num) { 
      console.log(currentIndex)
      await page.goto(articleList[currentIndex].href,  {
        waitUntil: 'networkidle2',
        timeout: 0
      })
      timeout(5000)

      await page.screenshot({
        path: `./screenshot/hfxzxy/${currentIndex + 1}_${articleList[currentIndex].title}_${now}.png`,
        fullPage: true,
        type: 'png'
      })

      await page.goBack()
      
      if (currentIndex < articleList.length) {
        currentIndex++
        factorial()
      }
  };


  } catch (e) {
    console.log('err', e)
  }


  // await browser.close();

  ctx.body = {
    code: 200,
    message: 'success',
    data: {

    }
  }
})
module.exports = router