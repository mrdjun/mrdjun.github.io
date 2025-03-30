---
title: 安装Elasticsearch Kibana Head
tags:
  - Elasticsearch
description: >-
  使用docker安装Elastisearch和Kibana，Elasticsearch-Head是简易版的可视化操作界面，Kibana是分析和可视化平台，本篇还讲述了如何配置跨域连接以及安装IK分词器。
abbrlink: cda7441
date: 2025-03-12 12:00:45
---

## 安装ES+Kibana+Head

使用docker安装，挂载配置文件到本机。[安装ES官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)。

### 安装ES

创建elastic网络

```bash
docker network create elastic
```

启动容器，介于个人原因，这里使用的老版本es，最好使用最新版。我机器上docker容器的的映射文件都是放在`/mydata`里面的，按需修改。

```bash
docker run -p 9200:9200 -p 9300:9300 \
--name es \
--restart=always --net elastic \
-v /mydata/elasticsearch/data:/usr/share/elasticsearch/data \
-v /mydata/elasticsearch/config:/usr/share/elasticsearch/config \
-v /mydata/elasticsearch/plugins:/usr/share/elasticsearch/plugins \
-v /mydata/elasticsearch/logs:/usr/share/elasticsearch/logs \
-it -m 1GB -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
-e "discovery.type=single-node" \
--privileged \
-d elasticsearch:7.4.2 
```

### ES跨域配置

按需配置，一般是不需要跨域的，我这里是测试环境，倒图个方便。没有`elasticsearch.yml`文件的，建议启动一下es容器，先拷贝出来。下面是es中的几个文件，按需所取。

```bash
docker cp elasticsearch:/usr/share/elasticsearch/config /mydata/elasticsearch
docker cp elasticsearch:/usr/share/elasticsearch/logs /mydata/elasticsearch
docker cp elasticsearch:/usr/share/elasticsearch/data /mydata/elasticsearch
docker cp elasticsearch:/usr/share/elasticsearch/plugins /mydata/elasticsearch
```

修改配置

```bash
vi /mydata/elasticsearch/config/elasticsearch.yml
```

增加以下内容后，重启容器

```yaml
http.cors.enabled: true
http.cors.allow-origin: "*"
```

### 安装Kibana

版本需要和es版本对应。

```bash
docker run -p 5601:5601 --name kibana --restart=always \
--privileged=true -v /mydata/kibana:/usr/share/kibana \
-d kibana:7.4.2
```

修改一下连接es的地址

```bash
vi /mydata/kibana/kibana.yml
```

hosts中填写elasticsearch节点地址

```yaml
server.name: kibana
server.host: "0.0.0.0"
elasticsearch.hosts: [ "http://192.168.248.88:9200" ]
xpack.monitoring.ui.container.elasticsearch.enabled: true
```

### 安装elasticsearch-head

我选用源码的方式安装，[项目地址](https://github.com/mobz/elasticsearch-head)。

先安装编译环境nodejs，npm源最好配置个国内的，例如淘宝源，还可以安装个cnpm。`npm install -g cnpm --registry=https://registry.npm.taobao.org`

```bash
yum install -y gcc gcc-c++
yum install -y nodejs
node -v  
npm -v
```

跟着`README`操作：

```bash
git clone https://github.com/mobz/elasticsearch-head.git
cd elasticsearch-head
npm install
npm run start
```

打开链接：http://localhost:9100/  即安装完成。

如果需要跨域连接ES，下面将修改默认连接es的地址。

修改es节点地址：

```bash
vi /mydata/elasticsearch-head/Gruntfile.js
```

增加`hostname:'*'`配置：

```js
connect: {
    server: {
        options: {
            port: 9100,
            base: '.',
            // 增加个HostName
            hostname: '*',
            keepalive: true
        }
    }
}
```

修改默认连接地址：

```bash
vi vi /mydata/elasticsearch-head/_site/app.js
```

搜索一下关键字:`localhost`，将原来的 ：`this.base_uri = this.config.base_uri || this.prefs.get("app-base_uri") || "http://localhost:9200";`修改为ES的节点地址。

```js
this.base_uri = this.config.base_uri || this.prefs.get("app-base_uri") || "http://192.168.248.88:9200";
```

## 安装Ik分词器

使用Github开源的中文分词器，[链接在此](https://github.com/infinilabs/analysis-ik)。下载到本机上传至服务器的 `/mydata/elasticsearch/plugins`中解压出来。

```bash
ls /mydata/elasticsearch/plugins

> ik-7.4.2 
```

重启es容器后，通过命令查看启动日志。

```bash
docker logs es | grep alysis-ik

> {"type": "server", "timestamp": "2025-03-12T08:55:16,790Z", "level": "INFO", "component": "o.e.p.PluginsService", "cluster.name": "docker-cluster", "node.name": "071151ebe748", "message": "loaded plugin [analysis-ik]" }
```

测试IK分词器，打开Kibana的devtools页面：`http://192.168.248.88:5601/app/kibana#/dev_tools/console`

```json
POST /_analyze
{
  "text":"中华人民共和国",
  "analyzer": "ik_smart"
}
```

运行结果：

```json
{
  "tokens" : [
    {
      "token" : "中华人民共和国",
      "start_offset" : 0,
      "end_offset" : 7,
      "type" : "CN_WORD",
      "position" : 0
    }
  ]
}
```

