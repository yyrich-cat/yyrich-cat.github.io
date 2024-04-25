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
    },
    analysis(code) {
        var url =  `https://finance.pae.baidu.com/vapi/v1/ana
        lysis?code=${code}&market=ab&finClientType=pc`;
        url = url.replaceAll('\n','').replaceAll(' ','');
        return fetch(url).then(x=>x.text()).then(txt=>{
            const result = JSON.parse(txt);
            return result.Result;
        });
    }
}

class Modal {
    constructor() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <p>Hello World!</p>
            </div>
        `;
        document.body.appendChild(this.modal);
        this.modal.querySelector('.close').addEventListener(
            'click', () => {
                this.hide();
            }
        );
        const style = document.createElement('style');
        style.innerHTML = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }
            .modal-content {
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
            }
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                &:hover,
                &:focus {
                    color: black;
                    text-decoration: none;
                    cursor: pointer;
                }
            }
        `;
        document.head.appendChild(style);
    }
    setContent(content) {
        this.modal.querySelector('.modal-content p').innerHTML = content;
    }
    show() {
        this.modal.style.display = 'block';
    }
    hide() {
        this.modal.style.display = 'none';
    }
    showModal(content) {
        this.setContent(content);
        this.show();
    }
}
function getFragment() {
    const html = `
    <div>
        <div class="input_code">股票代码: <input id="stock_code" type="text" placeholder="请输入股票代码"></div>
        <div class="input_name">股票名称: <input id="stock_name" type="text" placeholder="请输入股票名称"><span id="stock_name_result"></span></div>
        <div id="stock_add">确定</div>
    </div>`;
    const style = document.createElement('style');
    style.innerHTML = `
        #stock_add {
            height: var(--flex-height);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            &:hover {
                background-color: rgb(222, 222, 222);
            }
            &:active {
                background-color: rgb(222, 222, 222);
            }
            &:focus {
                outline: none;
            }
        }
    `;
    document.head.appendChild(style);
    return html;
}

class App {
    constructor() {
        this.modal = new Modal();
        this.modal.setContent(getFragment());
        const stock_code_input = this.modal.modal.querySelector('#stock_code');
        const stock_name_input = this.modal.modal.querySelector('#stock_name');
        const stock_name_span = this.modal.modal.querySelector('#stock_name_result');
        stock_code_input.oninput = () => {
            const code = stock_code_input.value;
            if (code.length == 6) {
                const found = SH_stocks.find(x => x.code == code);
                if (found) {
                    stock_name_input.value = found.name;
                } else {
                    fetch_data.analysis(code).then(x => {
                        let n = x ? x.technologyScore.increase.items[0].name : "UNDEFINED";
                        stock_name_input.value = n;
                    });
                }
            }
        };
        stock_name_input.oninput = () => {
            const name = stock_name_input.value;
            if (name.length > 0) {
                const found = SH_stocks.find(x => x.name.includes(name));
                if (found) {
                    stock_code_input.value = found.code;
                    stock_name_span.innerHTML = found.name;
                } else {
                    stock_code_input.value = '';
                    stock_name_span.innerHTML = '沪未找到';
                }
            } else {
                stock_code_input.value = '';
                stock_name_span.innerHTML = '';
            }
        };
        stock_name_input.onblur = () =>{
            stock_name_span.innerHTML = '';
            stock_code_input.oninput();
        };
        this.modal.modal.querySelector('#stock_add').addEventListener(
            'click', () => {
                console.log('点击了确定');
                const code = stock_code_input.value;
                const name = stock_name_input.value;
                if (code && name) {
                    this.addStock(code, name);
                    this.init();
                    this.modal.hide();
                }
            }
        );
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
            <div id="add" onclick="app.modal.show()">添加股票</div>
        </div>
        <div id="footer">底部栏</div>`;
        root.innerHTML = html;
    }
    init() {
        this.render();
        const list = document.getElementById('list');
        function bindLongPress(element, callback) {
            let timer = null;
            element.addEventListener('touchstart', function (e) {
                timer = setTimeout(() => {
                    callback.call(this, e);
                }, 500);
            });
            element.addEventListener('touchend', e => {
                clearTimeout(timer);
            });
        }
        list.oncontextmenu = function (e) {
            const element = e.target.parentElement;
            if (element.className == 'info') {
                e.preventDefault();
                if (confirm('是否删除？')) {
                    const code = element.innerText.split('\n')[1];
                    app.removeStock(code);
                    app.init();
                }
            }
        }
        bindLongPress(list, list.oncontextmenu);
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
        function handle(item) {
            function isClosed(data) {
                return data.update.stockStatus == "已收盘";
            }
            function style_up(str) {
                return "<span style='color:#f33'>" + str + "</span>";
            }
            function style_down(str) {
                return "<span style='color:#00b05a'>" + str + "</span>";
            }
            function refresh(data) {
                const { cur, pankouinfos } = data;
                const ratio = parseFloat(cur.ratio);
                const changeRate = ratio.toFixed(2)+"%";
                const change = parseFloat(cur.increase).toFixed(2);
                let span = (ratio > 0 ? style_up : ratio < 0 ? style_down : (x) => "" + x)
                
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
            }
            fetch_data.minute(item.code).then((data) => refresh(data));
        }
        const stocks = this.readStocks();
        for(let i = 0; i < stocks.length; i++) {
            const item = add_item(stocks[i].name, stocks[i].code);
            handle(item);
        }
    }
    readStocks() {
        const stocks = localStorage.getItem('stocks');
        if (stocks) {
            return JSON.parse(stocks);
        }
        return [];
    }
    addStock(code, name) {
        const stocks = this.readStocks();
        if (stocks.find(x => x.code == code)) {
            alert('已存在');
            return;
        }
        stocks.push({ code, name });
        localStorage.setItem('stocks', JSON.stringify(stocks));
    }
    removeStock(code) {
        const stocks = this.readStocks();
        const index = stocks.findIndex(x => x.code == code);
        if (index == -1) {
            alert('不存在');
            return;
        }
        stocks.splice(index, 1);
        localStorage.setItem('stocks', JSON.stringify(stocks));
    }
}

const app = new App();
app.init();

