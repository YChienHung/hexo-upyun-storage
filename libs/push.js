var pathFn = require('path');
var fs = require('fs');
var upyun = require("upyun")
var sign = upyun.sign

module.exports = function (args) {
    var config = this.config;
    var log = this.log;
    var server = config.upyunstorage.server;
    var user = config.upyunstorage.user;
    var password = config.upyunstorage.password;
    var storage_path = config.upyunstorage.path;

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

            console.log('新建目录：', url_path);
            client.makeDir(url_path);
            console.log('创建成功：', url_path);

            fs.readdirSync(path, async (err, files) => {
                await files.forEach(function (item) {
                    fs.stat(path + '/' + item, async (err, data) => {
                        if (data.isFile()) {
                            let localPath = path + "\\" + item
                            let remotePath = url_path + "/" + item

                            console.log('上传文件：', localPath);
                            const content = await fs.createReadStream(localPath)
                            let result = await client.putFile(remotePath, content)

                            if (((result instanceof Boolean) && !result)) {
                                console.log('上传失败：', remotePath);
                            } else {
                                console.log('上传成功：', remotePath);
                            }
                            await fs.unlink(localPath, (err) => {
                                if (err) {
                                    throw err;
                                }
                                console.log('删除文件：', localPath);
                            })

                        } else {
                            console.log('文件夹名：', item);
                        }
                    })
                })

                fs.rmdirSync(path, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log('删除目录：', path);
                })
            })
        }
    }
};
