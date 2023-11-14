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