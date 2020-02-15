const router = require('@koa/router')()
const puppeteer = require('puppeteer')
const {timeout, moment} = require('../../tools/index.js')

router.get('/juejin', async (ctx) => {
  ctx.redirect('/juejin/index')
})

router.get('/juejin/index', async (ctx) => {
  return await ctx.render('juejin/index')
})

router.post('/api/juejin/start', async (ctx) => {

      let {
        username: userName, 
        password: userPwd
      } = ctx.request.body

      var delay = 1000
      let browser = await puppeteer.launch({headless: false})

      let now = moment("Y-M-DTh:m:s");

      var page = await browser.newPage()
      page.setViewport({width: 1200, height: 800})

      let articleList = [] // 最新的文章列表

        /** 
         * 1. 获取最新的前端文章 
         */
      try {
          await page.goto('https://juejin.im/welcome/frontend')
          await timeout(delay)

          //抓取列表信息
          articleList = await page.evaluate(() => {
              var list = [...document.querySelectorAll('.entry-list .info-row.title-row a')]

              return list.map(el => {
                  return {
                      href: el.href.trim(), 
                      title: el.innerText
                  }
              })
          })

          await page.screenshot({
            path: `./screenshot/juejin/juejin_${now}.png`,
            type: 'png',
            fullPage: false
          });
      } catch (e) {
          console.log('抓取文单列表error::', e);
      }
  
      /** 
       * 2. 登录juejin 
       */
      try {
          await timeout(3000)

          await page.goto('https://juejin.im')

          await timeout(3000)
  
          // 点击登录按钮
          var login = await page.$('.login')
          await login.click()
  
          // 输入用户名
          var loginPhoneOrEmail = await page.$('[name=loginPhoneOrEmail]')
          await loginPhoneOrEmail.click()
          await page.type('[name=loginPhoneOrEmail]', userName, {delay: 20})
  
          // 输入密码
          var password = await page.$('[placeholder=请输入密码]')
          await password.click()
          await page.type('[placeholder=请输入密码]', userPwd, {delay: 20})
  
          // 点击登录按钮
          var loginBtn = await page.$('.panel .btn')
          await loginBtn.click()
   
      } catch (e) {
        console.log('登录error:', e)
      }
  
      /** 
       * 3. 分享文章到掘金
       */
      try {
          await timeout(2500)

          var theArtile = {
            href: 'https://segmentfault.com/a/1190000021749429',
            title: '前端工程实践之数据埋点分析系统（一）'
          }
  
          // 显示菜单
          var add = await page.$('.main-nav .more')
          await add.click()
  
          await timeout(2500)
          
          // 点击分享链接
          var addLink = await page.$$('.more-list .item')
          await addLink[1].click()
  
          await timeout(2500)
  
          // 输入链接
          await page.focus('.entry-form-input .url-input')
          await page.type('.entry-form-input .url-input', theArtile.href, {delay: 20})

          // 输入标题
          await page.focus('.entry-form-input .title-input')
          await page.type('.entry-form-input  .title-input', theArtile.title, {delay: 20})
  
          // 输入内容
          await page.focus('.entry-form-input .description-input')
          await page.type('.entry-form-input .description-input', theArtile.title, {delay: 20})
  
          await page.evaluate(() => {
              let li = [...document.querySelectorAll('.category-list-box .category-list .item')]
              li.forEach(el => {
                  if (el.innerText == '前端')
                      el.click()
              })
          })

          // 选择 tag
          await page.focus('.entry-form-input .tag-title-input')
          await page.type('.entry-form-input .tag-title-input', '前端', {delay: 20})

          timeout(2000)

          var tag = await page.$('.suggested-tag-list .tag')
          console.log(tag)
          await tag.click()
  
          var submitBtn = await page.$('.submit-btn')
          await submitBtn.click()
  
      } catch (e) {
          await page.screenshot({path: `./screenshot/juejin/err_${now}.png`, type: 'png'});
      }
  
      await page.screenshot({path: `./screenshot/juejin/done_${now}.png`, type: 'png'});
      // await page.close()
      // await browser.close()

      ctx.body = {
        message: '成功',
        code: 200,
        data: {
          articleList
        }
      }
  
  
})
module.exports = router