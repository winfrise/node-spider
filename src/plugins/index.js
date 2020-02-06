const axios = require('axios')
const fs = require('fs')
const http = require('http')

module.exports = {
  /**
   * 下载图片
   * @param {*} imageSrc 
   * @param {*} fileName 
   */
  async downloadImage ({referer, imageSrc, fileName, savePath}) {
    if (!fileName) {
      let arr = imageSrc.split('/')
      fileName = arr[arr.length - 1]
    }
    let headers = {
      Referer: imageSrc,
      // "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.19 Safari/537.36"
    }
    await axios({
      method: 'get',
      url: imageSrc,
      responseType: 'stream',
      headers
    }).then(function(response) {
      response.data.pipe(fs.createWriteStream(`${savePath}/${fileName}`))
    })
  },
  /**
   * 下载视频
   */
  async downloadVideo ({videoSrc, fileName, savePath}) {
    // 判断视频文件是否已经下载
    if (!fs.existsSync(`${savePath}/${fileName}`)) {
      await this.getVideoData(videoSrc, 'binary')
        .then(fileData => {
          this.savefileToPath(savePath, fileName, fileData)
          .then(res =>
            console.log(res)
          )
        })
    } else {
      console.log(`视频文件已存`)
    }
  },
  getVideoData (url, encoding) {
    return new Promise((resolve, reject) => {
      let req = http.get(url, function (res) {
        let result = ''
        encoding && res.setEncoding(encoding)
        res.on('data', function (d) {
          result += d
        })
        res.on('end', function () {
          resolve(result)
        })
        res.on('error', function (e) {
          reject(e)
        })
      })
      req.end()
    })
  },
  savefileToPath (savePath, fileName, fileData) {
    let fileFullName = `${savePath}/${fileName}`
    return new Promise((resolve, reject) => {
      fs.writeFile(fileFullName, fileData, 'binary', function (err) {
        if (err) {
          console.log('savefileToPath error:', err)
        }
        resolve('已下载')
      })
    })
  }
}

