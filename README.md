# hexo-upyun-storage

A new way to upload your pictures to upyun

# Install

```shell
  npm install https://github.com/YChienHung/hexo-upyun-storage  --save
```

# Config

```yaml
deploy:
  - type: upyun_storage
    posts: true
    path:
      - images
    file:
    delete: true


upyunstorage:
  server: 'AAA'
  user: 'BBB'
  password: 'CCC'
  path: storage_urls.txt # 文本文档的地址， 新链接会保存在此文本文档里
```

# History