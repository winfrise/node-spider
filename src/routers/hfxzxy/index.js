const router = require('@koa/router')()
const puppeteer = require('puppeteer')
const {timeout, moment} = require('../../tools/index.js')
const {downloadImage, mkdirSaveFolder}  = require( '../../plugins/index.js')

router.get('/hfxzxy', async (ctx) => {
  ctx.redirect('/hfxzxy/index')
})

router.get('/hfxzxy/index', async (ctx) => {
  return await ctx.render('hfxzxy/index')
})

router.post('/api/hfxzxy/start', async (ctx) => {
  let { 
    savePath // 图片保存的路径
  } = ctx.request.body

  let now = moment("Y-M-DTh:m:s");

  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()

  page.setViewport({width: 1400, height: 800})

  let totalPage = 58
  for(let pageIndex = 1; pageIndex <=  totalPage; pageIndex++) {
      console.log(`开始抓取第${pageIndex}/${totalPage}页的文章链接`)

      let url = `http://www.hfxzxy.com/index.php/art/type/id/21/page/${pageIndex}.html`
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 0
      })
  
      // 获取文章列表
      let articleList = await page.evaluate(() => {
          var list = [...document.querySelectorAll('.list ul li a')]
  
          return list.map(el => {
              return {
                  href: el.href.trim(), 
                  title: el.title.trim()
              }
          })
      })
      // console.table(articleList)

      for (let currentIndex = 0, articleLength = articleList.length; currentIndex <= articleLength; currentIndex++) {
        console.log(`开始抓取第${pageIndex}/${totalPage}页-第${currentIndex+1}/${articleList.length}篇文章中的图片`)
        
        let articleInfo = articleList[currentIndex]

        let { href, title}  = articleInfo
        await page.goto(href,  {
          waitUntil: 'networkidle2',
          timeout: 0
        })
  
        // 创建保存图片的目录
        let dirname = `${savePath}/${title}`
        mkdirSaveFolder(dirname)
        
        // 保存页面截图
        // await page.screenshot({
        //   path: `${dirname}/${currentIndex + 1}_${articleList[currentIndex].title}.png`,
        //   fullPage: true,
        //   type: 'png'
        // })
  
        // 获取详情页的图片
        let imgList = await page.evaluate(() => {
          var list = [...document.querySelectorAll('.fed-arti-content img')]
  
          return list.map(el => {
              return {
                  src: el.src.trim()
              }
          })
        })
  
        // 下载全部图片
        imgList.forEach(async (item, index) => {
          await downloadImage({
            imageSrc: item.src,
            savePath: `${savePath}/${title}`,
            fileName: undefined
          })
        })
        
  
        await page.goBack()
      }

  }




  // await browser.close();

  return ctx.body = {
    code: 200,
    message: 'success',
    data: {

    }
  }
})
module.exports = router