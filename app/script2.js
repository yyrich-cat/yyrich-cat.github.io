function init(str) {
    const dom = new DOMParser().parseFromString(str, 'text/html');
    document.head.innerHTML = dom.head.innerHTML;
    document.body.innerHTML = dom.body.innerHTML;
}
function getHtml() {
    const html = `<!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Undefined</title>
        <style>
            :root {
                --flex-width: calc(var(--flex-item-width) * 8);
                --flex-item-width: 6em;
                --flex-height: 3em;
            }
            #list .item {
                display: flex;
                align-items: center;
                width: var(--flex-width);
                height: var(--flex-height);
                border-bottom: 1px solid  rgb(222, 222, 222);
            }
            #list .item>div {
                width: var(--flex-item-width);
            }
            #list .item>div:nth-child(n+2) {
                text-align: right;
            }
            #list {
                overflow: auto;
            }
            #list .item>div:nth-child(1) {
                position: sticky;
                left: 0;
                background-color: white;
            }
            #add {
                height: var(--flex-height);
                display: flex;
                justify-content: center;
                align-items: center;
            }
        </style>
    </head>
   <body>    
        <div id="root"></div>
        
    </body>
    </html>`;
    return html;
}

init(getHtml());

const fetch_data = {
    minute(code) {
        var url =  `https://finance.pae.baidu.com/selfselect/
        getstockquotation?all=1&code=${code}&isIndex=false&is
        Bk=false&isBlock=false&isFutures=false&isStock=true&n
        ewFormat=1&is_kc=0&group=quotation_minute_ab&finClien
        tType=pc`;
        url = url.replaceAll('\n','').replaceAll(' ','');
        return fetch(url).then(x=>x.text()).then(txt=>{
            const result = JSON.parse(txt);
            return result.Result;
        });
    }
}

class App {
    constructor() {

    }
    render() {
        const root = document.getElementById('root');
        const html = `
        <div id="title"><h1>我的自选股</h1></div>
        <div>
            <div id="list">
                <div class="item" style="height: 2em;">
                    <div class="info">代码/名称</div>
                    <div class="price">最新</div>
                    <div class="change-rate">涨幅</div>
                    <div class="change">涨跌</div>
                    <div class="pre-close">昨收</div>
                    <div class="open">今开</div>
                    <div class="high">最高</div>
                    <div class="low">最低</div>
                </div>
            </div>
            <div id="add">添加股票</div>
        </div>
        <div id="footer">底部栏</div>`;
        root.innerHTML = html;
    }
    init() {
        this.render();
        const list = document.getElementById('list');
        function add_item(name = '--', code = '--') {
            const div = (className, innerText = '') => {
                const div = document.createElement('div');
                div.className = className;
                div.innerText = innerText;
                return div;
            };
            const _add = (className) => {
                const d = div(className, '--');
                item.appendChild(d);
                return d;
            };
            const item = div('item');
            const info = div('info');
            const title = div('title', name);
            const content = div('content', code);
            
            info.appendChild(title);
            info.appendChild(content);
            item.appendChild(info);

            const target = {
                name: title,
                code: content,
                price: _add('price'),
                changeRate: _add('change-rate'),
                change: _add('change'),
                preClose: _add('pre-close'),
                open: _add('open'),
                high: _add('high'),
                low: _add('low'),
            }

            list.appendChild(item);
            
            const handle = {
                get: function(target, key, receiver) {
                    return target[key].innerText;
                },
                set: function(target, key, value, receiver) {
                    target[key].innerHTML = value;
                    return true;
                }
            }
            return new Proxy(target, handle);
        }
        var p = add_item("湘财股份", "600095");
        this.handle(p);
        p = add_item("邮储银行", "601658");
        this.handle(p);
        p = add_item("中国平安", "601318");
        this.handle(p);
        p = add_item("中国中铁", "601390");
        this.handle(p);
        p = add_item("南网储能", "600995");
        this.handle(p);
    }
    handle(item) {
        function isClosed(data) {
            return data.update.stockStatus == "已收盘";
        }
        function style_up(str) {
            return "<span style='color:#f33'>" + str + "</span>";
        }
        function style_down(str) {
            return "<span style='color:#00b05a'>" + str + "</span>";
        }
        fetch_data.minute(item.code).then((data) => {
            const { cur, pankouinfos } = data;
            const ratio = parseFloat(cur.ratio);
            const changeRate = ratio.toFixed(2)+"%";
            const change = parseFloat(cur.increase).toFixed(2);
            let span = (ratio > 0 ? style_up : ratio < 0 ? style_down : (x) => "" + x)
            
            console.log(data);
            item.price = span(cur.price);
            item.changeRate = span(changeRate);
            item.change = span(change);

            const { preClose, open, high, low } = pankouinfos.origin_pankou;
            const _preClose = parseFloat(preClose);
            const _open = parseFloat(open);
            const _high = parseFloat(high);
            const _low = parseFloat(low);
            
            item.preClose = preClose;
            item.open = (_open > _preClose ? style_up(open) : _open < _preClose ? style_down(open) : open);
            item.high = (_high > _preClose ? style_up(high) : _high < _preClose ? style_down(high) : high);
            item.low = (_low > _preClose ? style_up(low) : _low < _preClose ? style_down(low) : low);
        });
    }
}

const app = new App();
app.init();

