const html = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Undefined</title>
</head>
<body>
    "this is undefined page!"
</body>
</html>`;

function init(str) {
    const dom = new DOMParser().parseFromString(str, 'text/html');
    document.head.innerHTML = dom.head.innerHTML;
    document.body.innerHTML = dom.body.innerHTML;
}
init(html);

function appendElement() {
    const on_the_page = document.body;
    const canvas_height = 200;
    const canvas_width = on_the_page.clientWidth / 2;

    var wraper = document.createElement('div');

    var spanB = document.createElement('div');
    wraper.style.marginTop = "24px";
    spanB.innerText = "by MyCoSc";
    wraper.appendChild(spanB);

    var wrap = document.createElement('div');
    var cvs = document.createElement('canvas');
    cvs.width = canvas_width;
    cvs.height = canvas_height;
    cvs.style.backgroundColor = 'white';
    cvs.style.display = 'block';
    wrap.appendChild(cvs);

    var rightSide = document.createElement('div');
    rightSide.style.display = 'flex';
    rightSide.style.height = '200px';
    rightSide.style.flexDirection = 'column';
    rightSide.style.flexWrap = 'wrap';
    rightSide.style.alignItems = 'flex-start';
    var dateDiv = document.createElement('div');
    var priceDiv = document.createElement('div');

    dateDiv.style.position = priceDiv.style.position = 'absolute';
    dateDiv.style.padding = priceDiv.style.padding = '0 5px';
    dateDiv.style.backgroundColor = 'orange';
    priceDiv.style.backgroundColor = 'orange';
    dateDiv.style.top = canvas_height + 'px';
    priceDiv.style.left = canvas_width + 'px';

    wrap.appendChild(rightSide);
    wrap.appendChild(dateDiv);
    wrap.appendChild(priceDiv);
    wrap.style.display = 'flex';
    wrap.style.position = 'relative';

    wraper.appendChild(wrap);
    on_the_page.appendChild(wraper);
    return {
        canvas: cvs,
        rightSide,
        priceDiv,
        dateDiv
    }
}
function main() {
    const face = appendElement();
    const ctx = face.canvas.getContext('2d');
    let sliceData;
    var tmp = [{"时间戳":"1682524800","时间":"2023-04-27","开盘":"7.96","收盘":"7.84","成交量":"35365703","最高":"8.04","最低":"7.83","成交额":"282473849.00","涨跌额":"-0.14","涨跌幅":"-1.75","换手率":"3.12","昨收":"7.98","ma5均价":"7.99","ma5成交量":"33264782","ma10均价":"8.45","ma10成交量":"40153819","ma20均价":"8.97","ma20成交量":"48324117"}];
    const core = {
        draw (arr) {
            const {width, height} = ctx.canvas;
            ctx.clearRect(0,0,width,height);
            
            this.drawKLine(arr);
            this.drawAverageLine(arr);
        },
        drawKLine (arr) {
            const chooseColor = (open, close, prevday) => {
                return open < close ? 'red' : open > close ? 'green' : (
                    !!prevday ? chooseColor(prevday.收盘, close) : 'black'
                );
            }
            const len = arr.length;
            const w = ctx.canvas.width / len;
            const min = arr.min;
            const max = arr.max;
            for (let i = 0; i < len; i++) {
                const x = arr[i];
                const highest = x.最高;
                const lowest = x.最低;
                const open = parseFloat(x.开盘);
                const close = parseFloat(x.收盘);
                const color = chooseColor(open, close, arr[i-1])
                const y = this.calcY(lowest,min,max);
                const h = this.calcY(highest,min,max) - y;
                ctx.fillStyle = color;
                ctx.fillRect(i * w + w / 2 - 0.5, y, 1, h);
                const yy = this.calcY(open,min,max);
                const hh = this.calcY(close,min,max) - yy;
                if (open < close) {
                    ctx.fillStyle = 'white';
                    ctx.strokeStyle = color;
                    ctx.fillRect(i * w + 1, yy, w - 2, hh);
                    ctx.strokeRect(i * w + 1, yy, w - 2, hh);
                }else if (open == close) {
                    ctx.fillRect(i * w + 1, yy, w - 2, 1);
                }else {
                    ctx.fillRect(i * w + 1, yy, w - 2, hh);
                }
            }
        },
        calcY (price, min, max, height = ctx.canvas.height) {
            return height - (price - min) / (max - min) * height;
        },
        drawAverageLine (arr) {
            const len = arr.length;
            const w = ctx.canvas.width / len;
            const min = arr.min;
            const max = arr.max;
            const draw = (keyword, color) => {
                ctx.beginPath();
                ctx.moveTo(w/2-0.5, this.calcY(arr[0][keyword],min,max));
                for (let i = 0; i < len; i++) {
                    const x = arr[i];
                    const average = x[keyword];
                    const y = this.calcY(average,min,max);
                    ctx.lineTo(i * w + w / 2 - 0.5, y);
                }
                ctx.strokeStyle = color;
                ctx.stroke();
            }
            var list = {
                'ma5均价': 'black',
                'ma10均价': 'yellow',
                'ma20均价': 'deeppink'
            };
            for (const key in list) {
                const element = list[key];
                draw(key, element);
            }
        },
        drawFocus (x,y) {
            core.draw(sliceData);
            const {width, height} = ctx.canvas;
            ctx.strokeStyle = 'blue';
            ctx.beginPath()
            ctx.moveTo(0,y);
            ctx.lineTo(width,y);
            ctx.moveTo(x,0);
            ctx.lineTo(x,height);
            ctx.stroke();
        }
    }
    
    const fetchKLineData = {
        generateUrlString (code, ktype, start_time) {
            var url =  `https://finance.pae.baidu.com/selfselect/
            getstockquotation?all=1&code=${code}&isIndex=false&is
            Bk=false&isBlock=false&isFutures=false&isStock=true&n
            ewFormat=1&is_kc=0&start_time=${start_time}+00:00:00&kty
            pe=${ktype}&group=quotation_kline_ab&finClientType=pc`;
            return url.replaceAll('\n','').replaceAll(' ','');
        },
        fetchData (url) {
            return fetch(url).then(x=>x.text()).then(txt=>{
                const result = JSON.parse(txt).Result.newMarketData;
                window.data = result.marketData.split(';').map(x=>{
                    x = x.split(',');
                    const obj = {};
                    for (let i = 0; i < x.length; i++) {
                        obj[result.headers[i]] = x[i];
                    }
                    return obj;
                });
                return window.data;
            });
        },
        day (code, start_time = '1990-12-01') {
            const url = this.generateUrlString(code, '1', start_time);
            return this.fetchData(url);
        },
        week (code, start_time = '1990-12-01') {
            const url = this.generateUrlString(code, '2', start_time);
            return this.fetchData(url);
        },
        month (code, start_time = '1990-12-01') {
            const url = this.generateUrlString(code, '3', start_time);
            return this.fetchData(url);
        }
    }
    function fetchDayKLineData(code, start_time = "1990-12-01") {
        return fetchKLineData.day(code, start_time);
    }
    function fetchMinuteData(code) {
        var url =  `https://finance.pae.baidu.com/selfselect/
        getstockquotation?all=1&code=${code}&isIndex=false&is
        Bk=false&isBlock=false&isFutures=false&isStock=true&n
        ewFormat=1&is_kc=0&group=quotation_minute_ab&finClien
        tType=pc`;
        url = url.replaceAll('\n','').replaceAll(' ','');
        return fetch(url).then(x=>x.text()).then(txt=>{
            const result = JSON.parse(txt);
            return result;
        });
    }

    const stockList = [
        { name: '邮储银行', code: 601658 },
        { name: '湘财股份', code: 600095 }
    ]

    function init(arg) {
        const i = parseInt(Math.random() * SH_stocks.length);
        let {name, code} = arg || SH_stocks[i];
        fetchDayKLineData(code, '2023-01-01').then( data => {
            sliceData = data.slice(-100);
            const minResult = sliceData.map(x => x.最低);
            const maxResult = sliceData.map(x => x.最高);
            sliceData.min = Math.min(...minResult);
            sliceData.max = Math.max(...maxResult);
            core.draw(sliceData);
            const title = face.canvas.parentElement.parentElement.children[0];
            title.innerHTML = name + ' ' + code;
            title.onclick = ()=>{
                title.innerHTML = 'loading...'
                title.onclick = null;
                init();
            };
        });
    }
    init(stockList[1]);

    face.canvas.onmousemove = () => {
        try {
            data;
            face.canvas.onmouseenter = ()=>{
                face.priceDiv.style.display = 'block';
                face.dateDiv.style.display = 'block';
            };
            face.canvas.onmousemove = e => {
                const { x, y } = { x: e.offsetX, y: e.offsetY };
                core.drawFocus(x, y);
                const ofst = parseFloat(getComputedStyle(face.dateDiv).width) / 2;
                face.dateDiv.style.left = x +(-ofst-5)+ 'px';
                face.priceDiv.style.top = y +(-12)+ 'px';
                const xp = x / (ctx.canvas.width);
                const px = parseInt(xp * sliceData.length);
                const yp = 1 - y / (ctx.canvas.height-1);
                const py = sliceData.max - sliceData.min;
                face.dateDiv.textContent = sliceData[px].时间;
                face.priceDiv.textContent = (sliceData.min + yp * py).toFixed(2);
                
                var obj = sliceData[px];
                
                var str = '<div>' + "ma20 与 收盘: " + (obj.收盘 - obj.ma20均价).toFixed(2) + '</div>';
                str += '<div>' + "ma20 与 开盘: " + (obj.开盘 - obj.ma20均价).toFixed(2) + '</div>';
                str += '<div>' + "ma20 与 最高: " + (obj.最高 - obj.ma20均价).toFixed(2) + '</div>';
                str += '<div>' + "ma20 与 最低: " + (obj.最低 - obj.ma20均价).toFixed(2) + '</div>';
                for (let k in obj) {
                    str += '<div>' + k + ": " + obj[k] + '</div>';
                }
                face.rightSide.innerHTML = str;
            }
            face.canvas.onmouseleave = () => {
                core.draw(sliceData);
                face.priceDiv.style.display = 'none';
                face.dateDiv.style.display = 'none';
                face.rightSide.innerHTML = '';
            }
        } catch (error) {
            
        }
    }
}
main();