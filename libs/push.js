var pathFn = require('path');
var fs = require('fs');
var upyun = require("upyun")
var sign = upyun.sign

module.exports = async function (args) {
    var config = this.config;
    var log = this.log;
    var server = config.upyunstorage.server;
    var user = config.upyunstorage.user;
    var password = config.upyunstorage.password;
    var storage_path = config.upyunstorage.path;

    var isdelete = args.delete

    const service = new upyun.Service(server, user, password)

    function getHeaderSign(ignore, method, path) {
        const headers = sign.getHeaderSign(service, method, path)
        return Promise.resolve(headers)
    }

    const client = new upyun.Client(service, getHeaderSign);

    var publicDir = this.public_dir;
    var storageUrlsFile = pathFn.join(publicDir, storage_path);
    var paths = fs.readFileSync(storageUrlsFile, 'utf8').split("\n")

    for (let i = 0; i < paths.length; i++) {
        let path = paths[i]
        let url_path = "/" + path.replace(publicDir, "").replace("\\", "/")
        if (fs.existsSync(path)) {
            console.log('新建目录：', url_path)
            await client.makeDir(url_path)
            console.log('创建成功：', url_path)

            promise_arr = []
            let files = fs.readdirSync(path)
            for (let j = 0; j < files.length; j++) {
                let item = files[j]
                statsObj = fs.statSync(path + "\\" + item)
                if (statsObj.isFile()) {
                    let localPath = path + "\\" + item
                    let remotePath = url_path + "/" + item

                    console.log('上传文件：', localPath);
                    const content = fs.createReadStream(localPath)
                    let result = await client.putFile(remotePath, content)
                    if (((result instanceof Boolean) && !result)) {
                        console.log('上传失败：', remotePath);
                    } else {
                        console.log('上传成功：', remotePath);
                    }

                    if (isdelete) {
                        fs.unlinkSync(localPath)
                        console.log('删除文件：', localPath);
                    }

                } else {
                    console.log('文件夹名：', item);
                }
            }

            if (isdelete) {
                fs.rmdirSync(path)
                console.log('删除目录：', path);
            }
        }
    }
};
