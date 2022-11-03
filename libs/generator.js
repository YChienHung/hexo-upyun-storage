var pathFn = require('path');
var fs = require('fs');
module.exports = function (locals) {
    var log = this.log;
    var config = this.config;
    var isdelete = false
    var isposts = false
    var publicDir = this.public_dir;
    var storage_path = config.upyunstorage.path;

    config.deploy.forEach(element => {
        if (element["type"] === "upyun_storage") {
            isposts = element["posts"]
        }
    });

    var push_urls = ""

    if (isposts) {
        var post_abbrlinks = [].concat(locals.posts.toArray())
            .map(function (post) {
                return publicDir + "posts\\" + post.abbrlink
            })
            .join("\n")

        push_urls += "\n" + post_abbrlinks
    }

    push_urls = push_urls.replace(/(\n[\s\t]*\r*\n)/g, '\n').replace(/^[\n\r\n\t]*|[\n\r\n\t]*$/g, '')

    return {
        path: storage_path,
        data: push_urls
    };
};