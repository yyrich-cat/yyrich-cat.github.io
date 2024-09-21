const loadScript = getScriptLoader();
const log = new Proxy({}, { get: (_, k) => console.log.bind(console, k) });

function getScriptLoader() {
    function _load(src) {
        return new Promise((resolve) => {
            var script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.body.appendChild(script);
            document.body.removeChild(script);
        })
    }
    var p = Promise.resolve();
    /** @param {string} src */
    return function (src) {
        return p = p.then(() => _load(src));
    }
}





function createEditor(container, locate_monaco) {
    const _createEditor = (t) => {
        const editor = monaco.editor.create(t, {
            value: 'function hello() {\n\talert("Hello world! ...");\n}\nhello();',
            language: 'javascript',
            autoIndent: "advanced",
            theme: 'vs-dark'
        });
        _convertTabsToSpaces(editor);
        return editor;
    };
    if (window.monaco) {
        createEditor = _createEditor;
        return createEditor(container);
    }
    let resolver = () => {};
    const result = new Promise(res => resolver = res);
    createEditor = () => result;
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    const baseUrl = locate_monaco || 'https://yyrich-cat.github.io/lib/monaco-editor-0.52.0';

    if (!$$("link[data-name='vs/editor/editor.main']").length) {
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("data-name", "vs/editor/editor.main");
        link.setAttribute("href", baseUrl + "/min/vs/editor/editor.main.css");
        document.head.appendChild(link);
    }
    if (window.require) {
        console.warn("require is already defined! Unexpected behavior may occur.");
        _initMonaco();
    } else {
        loadScript(baseUrl + '/min/vs/loader.js').then(_initMonaco);
    }

    function _initMonaco() {
        window.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
                console.log(`get worker url: moduleId: ${moduleId}, label: ${label}`);
                return baseUrl + '/min/vs/base/worker/workerMain.js';
            }
        }
        
        require.config({ paths: { 'vs': baseUrl + '/min/vs' } });
        require(['vs/nls.messages.zh-cn'], () => {});
        require(['vs/editor/editor.main'], function () {
            var editor = _createEditor(container);
            resolver(editor);
            createEditor = _createEditor;
        });
    }
    function _convertTabsToSpaces(editor) {
        const model = editor.getModel();
        const tabSize = model.getOptions().tabSize;
        
        const lines = model.getValue().split('\n');
        const modifiedLines = lines.map(function (line) {
            return line.replace(/\t/g, ' '.repeat(tabSize));
        });
        editor.setValue(modifiedLines.join('\n'));
    }
    return result;
}