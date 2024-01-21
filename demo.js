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
        let a = new Attack();
        console.log(a, 'attack')
        a.run();
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


let defuleAssterNumber = '500000'
function attack() {
    console.log('发起进攻！！')
    clickQueryImg(queryImg(jietuPic, jingong))
    clickQueryImg(queryImg(null, seachPath))
    getAttackMess()
}

let maxRetryNum = 3;
// function getAttackMess() {
//     sleep(1000)
//     const nextRecord = queryImg(null, nextPath)
//     const assterRecord = queryImg(nextRecord.bigImg, assterPath);
    
//     if (assterRecord) {
//         const { imgPosition, minImg, bigImg } = assterRecord;
//         let { x, y } = imgPosition;
//         maxRetryNum = 5;
//         // 获取当前攻略资源
//         const result = getRegionalText(bigImg, x + minImg.getWidth(), y - 120, 200, 200)
//         console.log(result, '资源结果');
//         if (!result) {
//             console.log('识别识别')
//             return
//         }
//         let jinbi = result[0].val;
//         let shenshui = result[1].val;
//         let heiyou = result[2].val;
//         if (jinbi > defuleAssterNumber && shenshui > defuleAssterNumber) {
//             console.log('满足条件')
//         } else {
//             console.log('不满足条件')
//             clickQueryImg(nextRecord);
//             getAttackMess();
//         }
//     } else {
//         if (maxRetryNum > 0) {
//             maxRetryNum --;
//             console.log('重试！！！！')
//             getAttackMess();
//         } else {
//             clickQueryImg(nextRecord);
//         }
//     }
// }


function clickQueryImg(obj, msg) {
    const { imgPosition, minImg } = obj;
    if (!imgPosition) return;
    let { x, y } = imgPosition;
    let xx = random(x, x + minImg.getWidth())
    let yy = random(y, y + minImg.getHeight())

    click(xx, yy)
    console.log(`[${msg || ''}]:__点击成功`)
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
        return result.map((r, ind) => ({
            // ...r,
            val:  r.words,
            type: ind
        }))
    }
    return null;
}

// 进攻
function Attack () {
    // 缓存资源坐标
    this.cacheResource = null;
    // 缓存Next 按钮
    this.cacheNextBut = null;
    // 主界面进攻缓存
    this.cacheHomeAttack = null;
    // 重连数量
    this.reconnectNum = 5;

    this.run = function() {
        console.log('主界面发起进攻！！')
        if (!this.cacheHomeAttack) {
            this.cacheHomeAttack = queryImg(jietuPic, jingong)
        }
        clickQueryImg(this.cacheHomeAttack, "主界面进攻")
        clickQueryImg(queryImg(null, seachPath), '开始搜索')
        this.getResourceRecord();
    }

    this.nextTarget = function() {
        if (!this.cacheNextBut) {
            this.cacheNextBut = queryImg(null, nextPath);
        }
        clickQueryImg(this.cacheNextBut, "next 目标");
        this.getResourceRecord()
    }

    this.tryAgain = function() {
        console.log('[tryAgain]: 重试！！')
        sleep(400)
        if (this.maxRetryNum > 0) {
            this.maxRetryNum -= 1;
            this.getResourceRecord();
        } else {
            this.maxRetryNum = 3;
            this.nextTarget();
        }
    }

    this.getResourceRecord = function() {
        sleep(1000)
        let resource;
        if (!this.cacheResource) {
            resource = queryImg(null, assterPath);
        } else {
            resource = this.cacheResource;
        }
        // 拿不到资源
        // 重试 不然下一个目标
        if (!resource.imgPosition) {
            console.log('资源查询失败！');
            this.tryAgain();
        } else {
            this.maxRetryNum = 3;
            let { imgPosition, minImg, bigImg } = resource;
            if (!this.cacheResource) {
                this.cacheResource = resource;
            } else {
                bigImg = null;
            }
            
            let { x, y } = imgPosition;
            // 获取当前攻略资源
            const result = getRegionalText(bigImg, x + minImg.getWidth(), y - 120, 200, 200)
            
            if (!result || result.length < 3) {
                this.tryAgain();
                return
            }
            // 金币
            let jinbi = result[0].val;
            // 圣水
            let shenshui = result[1].val;
            // 黑油
            // let heiyou = result[2].val;
            // 满足金币圣水 大于50w
            if (jinbi > defuleAssterNumber && shenshui > defuleAssterNumber) {
                console.log('满足条件 进攻')
            } else {
                console.log('不满足条件')
                this.nextTarget();
            }
        }
    }


    // 下兵开战
    this.handleMakeWar = function() {
        
    }
}

// 工具
function Utils () {
    
}