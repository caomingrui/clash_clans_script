console.log('test??111?')
requestScreenCapture(true);

let trainingCampImgPath = '../test/训练.png'
let jingong = '../test/进攻.png'
let seachPath = '../test/search.png'
let nextPath = '../test/next.png'
let assterPath = '../test/asster.png'
let soldierPath = '../test/兵种.png'

console.log('init iiiii')
const xlyConfig = ['军队概况', '训练部队', '配制法术', '建造攻城机器', '键训练']
// 训练营内tab 缓存
let cacheTrainingCampOptions = null


let jietuPic = captureScreen('../test/jietu.png');
sleep(1000);
let utils = new Utils();

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


let defuleAssterNumber = '100000'
function attack() {
    console.log('发起进攻！！')
    clickQueryImg(queryImg(jietuPic, jingong))
    clickQueryImg(queryImg(null, seachPath))
    getAttackMess()
}

let maxRetryNum = 3;


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
        return {};
    };
    return {
        imgPosition: _dom,
        minImg: img,
        bigImg
    };
}


// 获取区域内文字
function getRegionalText(img, x, y, width, height, savePath) {
    if (!img) {
        img = captureScreen();
        sleep(1000)
    }
    let subImg = images.clip(img, x, y, width, height);
    images.save(subImg, savePath || "../test/aa.jpg", "jpg", 50)
    let result = paddle.ocr(subImg);
    console.log('识别文字中...')
    if (result && result.length > 0) {
        
        for (let i = 0; i < result.length; i++) {
            let ocrResult = result[i]
            console.log("文本：" + utils.getResourceNum(ocrResult.words), "相似度 ：" + ocrResult.confidence.toFixed(2), "范围：" + ocrResult.bounds, "左边：" + ocrResult.bounds.left, "顶边：" + ocrResult.bounds.top, "右边：" + ocrResult.bounds.right, "底边：" + ocrResult.bounds.bottom)
        }
        return result.map((r, ind) => ({
            // ...r,
            val:  utils.getResourceNum(r.words),
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
    // 检索资源
    this.defuleAssterNumber = 10000

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
        console.log('[nextTarget]:')
        if (!this.cacheNextBut) {
            this.cacheNextBut = queryImg(null, nextPath);
        }
        clickQueryImg(this.cacheNextBut, "next 目标");
        this.getResourceRecord()
    }

    this.tryAgain = function() {
        console.log('[tryAgain]: 重试！！', this.reconnectNum)
        sleep(400)
        if (this.reconnectNum > 0) {
            this.reconnectNum -= 1;
            this.getResourceRecord();
        } else {
            this.reconnectNum = 5;
            this.nextTarget();
        }
    }

    this.getResourceRecord = function() {
        sleep(1200)
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
            this.reconnectNum = 5;
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
            console.log(jinbi, shenshui, this.defuleAssterNumber, '资源')
            // 黑油
            // let heiyou = result[2].val;
            // 满足金币圣水 大于50w
            if (jinbi > this.defuleAssterNumber && shenshui > this.defuleAssterNumber) {
                console.log('满足条件 进攻')
                this.handleMakeWar();
                // console.log(data);
            } else {
                console.log('不满足条件')
                this.nextTarget();
            }
        }
    }


    // 下兵开战
    this.handleMakeWar = function() {
        let branchType = new BranchType();
        branchType.init();
        branchType.release(0);
        // let bigImg = this.cacheResource? this.cacheResource.bigImg: null;
        // // queryImg(bigImg, soldierPath)
        // let img = images.read(soldierPath)
        // let result = images.matchTemplate(bigImg, img)
        // // console.log(result)
        // result.matches.forEach(match => {
        //     log("point = " + match.point + ", similarity = " + match.similarity);
        // });

        // let matchResult = result.matches.reduce((obj, item) => {
        //     const { point } = item;
        //     let key = `${point.x}--${point.y}`;
        //     if (!obj[key]) {
        //         obj[key] = item;
        //     }
        //     return obj;
        // }, {});
        
        // let matchList = Object.values(matchResult)
        // // 识别失败需要重试
        // if (!matchList.length) {

        //     return;
        // }
        // console.log(matchList[0].point, 'matchList')
        // console.log(matchList[0].point.x, 'matchList')
        // matchList.sort((a, b) => a.point.x - b.point.x)
        // let x = matchList[0].point.x;
        // let y = matchList[0].point.y;
        // let width = matchList.slice().pop().point.x - x;
        // console.log(x, y, width)
        // const typeNumber = getRegionalText(bigImg, x, y, width + img.getWidth() + 10, 40, '../test/bb.jpg');
        // console.log(typeNumber)
    }
}


function BranchType() {
    // 部队兵种信息
    this.armyRecords = null;
    // 法术信息
    this.magicArtsRecords = null;
    // 英雄信息
    this.heroRecords = null;

    // 获取兵队信息
    this.init = function(bigImg) {
        if (!bigImg) {
            bigImg = captureScreen();
            sleep(1000)
        }
        this.initArmy(bigImg);
        this.initMagicArts(bigImg);
        this.initHero(bigImg);
    }

    this.initArmy = function(bigImg) {
        this.baseQuery(bigImg, soldierPath, 'ARMY');
    }


    this.initMagicArts = function(bigImg) {
        this.baseQuery(bigImg, soldierPath, 'MAGIC_ARTS');
    }

    this.initHero = function(bigImg) {
        this.baseQuery(bigImg, soldierPath, 'HERO');
    }


    this.baseQuery = function(bigImg, minImgPath, type) {
        const result = utils.matchImg(bigImg, minImgPath)
        // 重试
        if (!result.length) {

            return;
        }
        result.sort((a, b) => a.point.x - b.point.x)
        let x = result[0].point.x;
        let y = result[0].point.y;
        let width = result.slice().pop().point.x - x;
        let typeNumber = getRegionalText(bigImg, x, y, width + img.getWidth() + 10, 40, `../test/${type}.jpg`);
        if (!typeNumber) {
            console.log(`[${type}] 识别失败`);

            return
        }
        const matchResult = result.map((res, ind) => ({
            point: res.point,
            number: typeNumber[ind].val
        }))

        switch (type) {
            case 'ARMY':
                this.armyRecords = matchResult;
                break;
            case 'MAGIC_ARTS':
                this.magicArtsRecords = matchResult;
                break
            case 'HERO':
                this.heroRecords = matchResult;
                break
            default:
                console.log(`[${type}] 匹配失败！`)
                break;
        }
    }


    this.release = function(ind, type) {
        let data = this.getBranchRecords(type)
        if (!data || !data[ind]) {
            return
        }
        let length = data.length;
        const { point, number } = data[ind];
        utils.positionClick({ position: point, width: 40, height: 70 })
        // 点击空白可下部队区域
        Array.from({ length: number }, () => {
            // utils.positionClick({ position: point, width: 40, height: 70 })
        })
        data[ind].number = 0;
        if (len + 1 < length) {
            this.release(ind + 1);
        } else {
            // 部队全部下完
            this.setBranchRecords(type, null);
        }
    }

    this.getBranchRecords = function(type) {
        switch (type) {
            case 'ARMY':
                return this.armyRecords;
                
            case 'MAGIC_ARTS':
                return this.magicArtsRecords;
                
            case 'HERO':
                return this.heroRecords;
            default:
                console.log(`[${type}] 匹配失败！`)
                return null
        }
    }

    this.setBranchRecords = function(type, newData) {
        this.getBranchRecords(type) = newData;
    }
}

// 工具
function Utils () {

    // 获取资源值
    this.getResourceNum = function(val) {
        let len = val.length;
        return Number(Array(len).fill(0).reduce((s, _, i) => {
            let item = val[i];
            if (!isNaN(Number(item))) {
                s += item;
            }
            return s;
        }, ""));
    }


    // 匹配图像
    this.matchImg = function(bigImg, minImgPath) {
        if (!bigImg) {
            bigImg = captureScreen();
            sleep(1000)
        }
        let img = images.read(minImgPath)
        let result = images.matchTemplate(bigImg, img)

        result.matches.forEach(match => {
            log("point = " + match.point + ", similarity = " + match.similarity);
        });

        let matchResult = result.matches.reduce((obj, item) => {
            const { point } = item;
            let key = `${point.x}--${point.y}`;
            if (!obj[key]) {
                obj[key] = item;
            }
            return obj;
        }, {});

        return matchResult.values();
    }

    // 区域点击
    this.positionClick = function(obj, msg) {
        let { position, minImg, width, height } = obj;
        if (!position) return;
        let { x, y } = position;

        let xx = random(x, x + width || minImg.getWidth())
        let yy = random(y, y + height || minImg.getHeight())
    
        click(xx, yy)
        console.log(`positionClick][${msg || ''}]:__点击成功`)
        sleep(500)
    }



}