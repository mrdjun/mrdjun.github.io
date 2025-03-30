---
title: Elasticsearch 常用Api
tags:
  - Elasticsearch
description: DSL查询语法、数据聚合、ES集合
abbrlink: 642dba5b
date: 2025-03-12 17:28:38
---

## mapping映射属性

[官方文档链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)

`mapping`用于约束es中索引库中的文档，定义文档中的字段如何存储和索引的过程。

### 字段数据类型

type：字段数据类型。每一个类型都可以作为数组使用。

#### 字符串

| type    | 描述                                                         |
| ------- | ------------------------------------------------------------ |
| text    | 可分词的文本                                                 |
| keyword | 精确值，不可分词，例如：品牌、链接、国家、ip地址等，存储和查询时效率较高 |

#### 数值

| type          | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| long          | 带符号的 64 位整数，最小值为 `-2⁶³`，最大值为 `2⁶³-1`。      |
| integer       | 带符号的 32 位整数，最小值为 `-2³¹`，最大值为 `2³¹-1`。      |
| short         | 带符号的 16 位整数，最小值为 `-32,768`，最大值为 `32,767`。  |
| byte          | 带符号的 8 位整数，最小值为 `-128`，最大值为 `127`。         |
| double        | 双精度 64 位 IEEE 754 浮点数，限制为有限值。                 |
| float         | 单精度 32 位 IEEE 754 浮点数，限制为有限值。                 |
| half_float    | 半精度 16 位 IEEE 754 浮点数，限制为有限值。                 |
| scaled_float  | 一个浮点数，由一个固定的 `double` 比例因子缩放的 `long` 支持。通过比例因子将浮点数转换为整数存储，节省磁盘空间，适合精度要求不高的场景。 |
| unsigned_long | 无符号 64 位整数，最小值为 0，最大值为 2⁶⁴-1。               |

#### 布尔

boolean：true / false

#### 日期

不支持 `yyyy-MM-dd HH:mm:ss` 等日期格式。

| type      | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| date      | yyyy-MM-dd 或 yyyyMMdd                                       |
| date_time | yyyyMMddHHmmss 或 yyyy-MM-ddTHH:mm:ss 或 yyyy-MM-ddTHH:mm:ss.SSS 或 yyyy-MM-ddTHH:mm:ss.SSSZ |

#### 对象

Object 是type的默认值。假设定义name字段为对象类型，不需要显式定义type的属性值。

### 是否创建索引

表示字段是否需要用于搜索。index：是否创建索引，默认为true。

### 分词器

analyzer：使用哪个分词器。

### properties

子字段的定义。

## 索引库操作

ES中通过restful请求操作索引库、文档。请求内容用DSL（Domain Specific Language）语句来表示。

- 创建索引库

```http
PUT  /<index>
{
    "mappings": {
        "properties":{
            "字段名1": {
                "type": "text",       // 可分词的
                "analyzer":"ik_smart" // 指定ik_smart分词器
            },
            "字段名2": {
                "type": "keyword",    // 精确值，不可分词的
                "index": "false"
            }
        }
    }
}
```

- 查询索引库

```http
GET /<index>
```

- 删除索引库

```http
DELETE /<index>
```

- 修改索引库

索引库和mapping一但创建无法修改，支持添加新的字段，语法如下：

```http
PUT /<index>/_mapping
{
 "properties": {
 	"新字段名": { ... }
 }
}
```

## 文档操作

### 新增

如果不指定文档ID，ES会随机生成一个。

```http
POST /<index>/_doc/文档ID
{
	"字段1": "值",
	"字段2": {
		"子字段1":"值",
		"子字段2": 0
	}
}
```

### 查询

```http
GET /<index>/_doc/文档ID
```

### 删除

```http
DELETE /<index>/_doc/文档ID
```

### 修改

全量修改，先删除旧文档，再添加新文档。

```http
PUT /<index>/_doc/文档ID
{
   "字段1": "v1",
   "字段2": "v2",
}
```

局部修改，修改指定字段。

```http
PUT /<index>/_doc/文档ID
{
  "doc": {
   "字段1": "v2"
  }
}
```

## DSL查询文档

[官方文档链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)。ES基于JSON的DSL（Domain Specific Language）来定义查询语法。

请求路径：**GET /\<index\>/_search**

```http
GET /<index>/_search
{
  "query": {
     "查询类型": {
        "查询条件": "条件值"
     }
  }
}
```

### 查询全部

#### match_all

match_all没有任何条件，检索全部数据。

```json
{
    "query": {
        "match_all": {}
    }
}
```

#### match_none

match_none是一个特殊的查询类型，确保查询不会匹配任何文档，一般用于组合查询中明确排除某些条件。

```json
{
    "query": {
        "match_none": {}
    }
}
```

该查询不会返回任何文档，`hits` 数量为 0。

### 精确匹配

#### term查询

用于精确匹配字段的单个值，不会对输入内容进行分词。

```json
{
  "query": {
    "term": {
      "<field>": {
        "value": "<value>",
        "boost": <boost_value>,  // 可选，用于调整匹配文档的评分
      }
    }
  }
}
```

boost参数：用于调整匹配文档的相关性评分，默认值为1，值越高表示匹配的文档相关性越高。

如果想为匹配的文档赋予更高的权重，可以使用 `boost` 参数。例如，我们希望匹配 `status` 为 `active` 的文档有更高的评分：

```json
{
  "query": {
    "term": {
      "status": {
        "value": "active",
        "boost": 2.0
      }
    }
  }
}
```

示例匹配age=22的数据：

```json
{
  "query": {
    "term": { "age":  {"value": 22} } // 无其它配置也可简写为：{"age":22} 
  }
}
```

#### terms查询

用于精确匹配多个值，可以指定一个字段需要匹配的多个值。

```json
{
  "query": {
    "terms": {
      "<field>": [ "<value1>", "<value2>", ... ],
      "boost": <boost_value>,  // 可选，用于调整匹配文档的评分
      "minimum_should_match": "<number_or_percentage>"  // 可选，用于指定最少匹配的项数
    }
  }
}
```

示例：匹配age in (18,22,25)的数据，至少匹配其一。

```json
{
  "query": {
    "terms": { "age": [18, 22, 25] }
  }
}
```

示例：至少匹配其二，可以设置`minimum_should_match=2`

```json
{
  "query": {
    "terms": { 
        "age": [18, 22, 25],
        "minimum_should_match": 2
    }
  }
}
```

未完待续...
