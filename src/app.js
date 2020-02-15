const Koa = require('koa')
const bodyParser = require('koa-bodyparser');
const router = require('@koa/router')()
const views = require('koa-views')
const serve = require('koa-static')
const puppeteer = require('puppeteer')
const ejs = require('ejs')
const axios = require('axios')
const cheerio = require('cheerio')
var iconv = require('iconv-lite') 
const methods  = require( './plugins/index.js')

const app = new Koa()

app.use(views(__dirname + '/views', {
  // extension: 'ejs'
  map: {
    html: 'ejs'
  }
}))

app.use(serve(__dirname + '/static'))
app.use(bodyParser())
app.use(router.routes())

app.listen(3000)

/**
 * 【接口】通过 url 爬取页面
 */
router.post('/api/spider-page', async (ctx) => {

  try {
    let { url, container, goal} = ctx.request.body
    if (!container) {
      container  = 'body'
    }
    console.log(url, container, goal)
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 0,
    })

    const elems = Array.from(await page.$$('li.wp-item a'))
    
    let result = elems.map(async elem => {
      return elem.innerHTML
    })

    // let result = await page.evaluate(async (container, goal) => {
    //   const elems = Array.from($(container).find(goal.elem))

    //   return Array.from(elems).map(elem => {
    //     return {
    //       src: elem[goal.prop]
    //     }
    //   })
    // }, container, goal)

    // const $containers = await page.$$(container,)

    // let elems = []
    // $containers.forEach(container => {
    //   elems.push(Array.from(container.$$(goal.elem)))
    // })
    // console.log(elems)
    // let result = Array.from(elems).map(elem => {
    //   return {
    //     src: elem[goal.prop]
    //   }
    // })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        result
      }
    }
   
    await browser.close()
  } catch (e) {
    console.log('error', e)
    ctx.body = e
  }

        // rules.forEach(rule => {
        //   let elems = $(type, rule.parent)
        //   Array.prototype.forEach.call(elems, item  => {
        //     let src = $(item).attr('src')

        //     let alt = $(item).attr('alt')
        //     let srcArr = src.split('/')
        //     let fileName = srcArr[srcArr.length - 1]
        //     result.push({
        //       src,
        //       alt,
        //       fileName
        //     })
        //   })
        // })
})

/**
 * 【接口】通过 url 爬取页面的视频
 */
router.post('/api/spider-video', async (ctx) => {
  let { url, rules, type } = ctx.request.body
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
  }
  await axios.get(url, {headers})
    .then(res => {
      let docHtml = res.data
      let result = []
      

        const $ = cheerio.load(docHtml)

        if (rules.length === 0) {
          rules = [{
            parent: 'html'
          }]
        }


        ctx.body = {
          code: '000',
          message: 'success',
          data: {
            docHtml,
            result
          }
        }

    })
    .catch(err => {
      console.log(err)
      ctx.body = err
    })
})


/**
 * 【接口】下载图片
 */
router.post('/api/download-picture', async (ctx) => {
  let {fileName, imgs, savePath} = ctx.request.body

  if (typeof imgs === 'string') {
    imgs = [imgs]
  }

  for(let i = 0, l = imgs.length; i < l; i++) {
    await methods.downloadImage({
      imageSrc: imgs[i],
      savePath: savePath,
      fileName
    })
  }

  ctx.body = {
    code: 200,
    message: 'success',
    data: {}
  }
})

/**
 * 【接口】
 *  下载视频
 */
router.post('/api/download-video', async (ctx) => {
  const {
    videoSrc,
    savePath,
    fileName
  } = ctx.request.body

  await methods.downloadVideo({
    videoSrc,
    savePath,
    fileName
  })
})

/**
 * 【接口】
 *  puppetter
 */
router.post('/api/puppetter', async (ctx) => {
  try {
    const { url } = ctx.request.body
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded']
    })
    let result = await page.evaluate(() => {
      let imgs = document.querySelectorAll('img')
      return Array.from(imgs).map(img => {
        return {
          src: img.src,
          alt: img.alt
        }
      })
    })
    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        imgs: result
      }
    }
    await page.screenshot({path: 'example.png'})
   
    await browser.close()
  } catch (e) {
    console.log('error')
    ctx.body = e
  }

})

/**
 * 【页面】
 *   首页
 */
router.get('/', async (ctx) => {
  return await ctx.render('home')
})


/**
 * 【页面】
 *   抓取图片
 */
router.get('/spider-picture', async (ctx) => {
  return await ctx.render('spider-picture')
})

/**
 * 【页面】
 *   抓取视频
 */
router.get('/spider-video', async (ctx) => {
  return await ctx.render('spider-video')
})

/**
 * 【页面】
 *  播放视频
 */
router.get('/play-video', async (ctx) => {
  return await ctx.render('play-video')
})

/**
 * 【页面】
 *  嗅探图片
 */
router.get('/sniffe-picture', async (ctx) => {
  return await ctx.render('sniffe-picture')
})

/**
 * 【页面】
 *  下载视频
 */
router.get('/download-video', async (ctx) => {
  return await ctx.render('download-video')
})

/**
 * 【页面】
 */
router.get('/puppeteer', async (ctx) => {
  return await ctx.render('puppeteer')
})

/**
 * 【页面】开始
 */

router.get('/start', async (ctx) => {
  return await ctx.render('start')
})


app.use(require('./routers/es45').routes())
app.use(require('./routers/hfxzxy').routes())
app.use(require('./routers/juejin').routes())

// app.use(async ctx => {
//   const videoPath = path.resolve(__dirname, './source/mv-01.mp4')
//   ctx.body = 'hello world'
// })
