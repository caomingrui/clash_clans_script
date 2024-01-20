console.log('test??111?')
requestScreenCapture(true);

let trainingCampImgPath = '../test/训练.png'
let jingong = '../test/进攻.png'
let seachPath = '../test/search.png'
let nextPath = '../test/next.png'
let assterPath = '../test/asster.png'

console.log('init iiiii')
const xlyConfig = ['军队概况', '训练部队', '配制法术', '建造攻城机器', '键训练']
// 训练营内tab 缓存
let cacheTrainingCampOptions = null


let jietuPic = captureScreen('../test/jietu.png');
sleep(1000);

const init = () => {
    try {
        console.log('star ------->>>>')
        
        jietuPic = images.read('../test/jietu.png')
        attack();
        // const data = openTrainingCamp(jietuPic)
        // console.log(data, '???')

        // const batchTraining = data['键训练']
        // clickBatchTraining(batchTraining);
    } catch (e) {
        console.log(e);
    }
}

sleep(1000);
init();



// 打开快捷训练营
function openTrainingCamp(initPic) {
    console.log('star openTrainingCamp------->>>>')
    // let resolve, reject;
    // let promise = new Promise((x, y) => { resolve = x; reject = y; });

    let img = images.read(trainingCampImgPath)
    let _dom = findImage(initPic, img);
    console.log(_dom ,'dom....')
    if (!_dom) {
        return '未找到训练营';
    };
    let { x, y } = _dom;
    let xx = random(x, x + img.getWidth())
    let yy = random(y, y + img.getHeight())

    click(xx, yy)
    console.log('打开训练营')
    sleep(1000)

    if (!cacheTrainingCampOptions) {
        cacheTrainingCampOptions = {};
        let capture = captureScreen();
        sleep(1000)
        let result = paddle.ocr(capture);
        if (result && result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                let ocrResult = result[i]
                console.log("文本：" + ocrResult.words, "相似度 ：" + ocrResult.confidence.toFixed(2), "范围：" + ocrResult.bounds, "左边：" + ocrResult.bounds.left, "顶边：" + ocrResult.bounds.top, "右边：" + ocrResult.bounds.right, "底边：" + ocrResult.bounds.bottom)
                if (xlyConfig.includes(ocrResult.words)) {
                    cacheTrainingCampOptions[ocrResult.words] = ocrResult.bounds
                }
            }
        }
        // resolve(result);
    } else {
        // resolve(cacheTrainingCampOptions);
    }

    return cacheTrainingCampOptions;
}




function clickBatchTraining(config) {
    console.log('打开一键训练')
    sleep(100)
    let xx = random(config.left, config.right)
    let yy = random(config.top, config.bottom)
    click(xx, yy)
}


function attack() {
    console.log('发起进攻！！')
    clickQueryImg(queryImg(jietuPic, jingong))
    clickQueryImg(queryImg(null, seachPath))
    sleep(3500)
    const nextRecord = queryImg(null, nextPath)
    const assterRecord = queryImg(nextRecord.bigImg, assterPath);
    
    if (assterRecord) {
        const { imgPosition, minImg, bigImg } = assterRecord;
        let { x, y } = imgPosition;
        // 获取当前攻略资源
        const result = getRegionalText(bigImg, x + minImg.getWidth(), y - 120, 200, 200)
        
    }
    console.log(assterRecord, nextRecord)
}


function clickQueryImg(obj) {
    const { imgPosition, minImg } = obj;
    if (!imgPosition) return;
    let { x, y } = imgPosition;
    let xx = random(x, x + minImg.getWidth())
    let yy = random(y, y + minImg.getHeight())

    click(xx, yy)
    console.log('点击成功')
    sleep(500)
}


function queryImg(bigImg, minImgPath) {
    if (!bigImg) {
        bigImg = captureScreen();
        sleep(1000)
    }
    let img = images.read(minImgPath)
    let _dom = findImage(bigImg, img);
    console.log(_dom ,'dom....')
    if (!_dom) {
        return null;
    };
    return {
        imgPosition: _dom,
        minImg: img,
        bigImg
    };
}


// 获取区域内文字
function getRegionalText(img, x, y, width, height) {
    if (!img) {
        img = captureScreen();
        sleep(1000)
    }
    let subImg = images.clip(img, x, y, width, height);
    images.save(subImg, "../test/aa.jpg", "jpg", 50)
    let result = paddle.ocr(subImg);
    console.log('识别文字中...')
    if (result && result.length > 0) {
        for (let i = 0; i < result.length; i++) {
            let ocrResult = result[i]
            console.log("文本：" + ocrResult.words, "相似度 ：" + ocrResult.confidence.toFixed(2), "范围：" + ocrResult.bounds, "左边：" + ocrResult.bounds.left, "顶边：" + ocrResult.bounds.top, "右边：" + ocrResult.bounds.right, "底边：" + ocrResult.bounds.bottom)
        }
    }
    return result;
}