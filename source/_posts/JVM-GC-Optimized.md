---
title: GC调优
tags:
  - JVM
description: 在JDK8中，CMS/G1 gc针对针对常见机器规格的一些常用参数配置模板。
abbrlink: 3eea71e9
date: 2022-04-01 16:10:31
---

## G1 GC 调优指南

https://docs.oracle.com/javase/9/gctuning/garbage-first-garbage-collector.htm

### 参数模板

```bash
-Xmx**g -Xms**g -XX:MetaspaceSize=512m -XX:+MaxMetaspaceSize=512m -XX:G1MaxNewSizePercent=50 -XX:G1NewSizePercent=20 -XX:HeapDumpPath=/home/admin/logs -XX:+DisableExplicitGC
```

### 基本设置

-  请根据具体情况指定参数模板中的Xmx和Xms，这两个数值一般写成一样的
   其数值可以根据下面的方法推算： 
-  在应用正常执行时使用jmap手动触发一次full GC, `jmap -histo:live ` 
   -  然后观察GC日志里面Full GC之后整个heap的剩余空间，这个可以估算为活跃数据的总大小LDS (Live Data Set) 
   -  然后整个heap的大小可以用经验公式 Xmx = LDS * f 来计算，其中f因子按照经验一般是取3~4。 
-  新生代大小-Xmn**g
   除非经过特别调校，否则不推荐手动指定G1新生代大小，可能会对G1内部参数的自动调整产生导致不正确的影响，最坏情况可能导致频繁的Full GC。 

>G1的young区大小有三个策略：1，固定大小；2，固定上限；3，固定上下限， 这个策略会在JVM启动时根据VM参数进行选择，默认是使用#3，在5%～60%的Heap大小范围内调整。
>对于自动调整策略，在根据历史数据预测GC指标时，G1假设各项指标是按照线性关系变化的， 对于行为剧烈变化的应用，G1的自动调整策略是有可能被打乱的，如果发现young区经常进入特别小上限导致频繁GC，可以尝试：
>1，调大-XX:MaxGCPauseMillis （默认200）
>2，设置-XX:+UnlockExperimentalVMOptions -XX:G1NewSizePercent=30，来把young区下限调整到30或其他数值（注意：此时必须删掉-Xmn, -XX:NewRatio等参数才可以生效）。

- 对于内存占用敏感的应用，可以设置-XX:G1MaxNewSizePercent=
  如果是从CMS切换过来的，可以尝试设置value=[CMS -Xmn]/[-Xmx] * 100% 

- 暂停时间-XX:MaxG1PauseMillis=<毫秒>
  这个数值默认是200ms，如果业务性能指标没有出现问题，并且对于暂停没有特别要求，不推荐手动指定这个参数。虽然这是个软性限制，G1并不会严格遵守这个时间限制，但这个参数会影响G1内部参数的自动调整，如果指定了一个较小的暂停时间，G1回收器可能会为了尽量满足这个限制而去使用一些比较激进的参数。 

- 磁盘敏感型应用建议使用GC log rotation，参数为 

```bash
-Xloggc:/home/admin/logs/gc.log  -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=4 -XX:GCLogFileSize=8m
```

JDK8 G1的默认GC输出比CMS多不少内容，会更快的消耗磁盘空间，gc log rotation会指定GC log的输出在几个GC日志文件之间循环流转。

- 不要为了用G1而用G1
  线上环境的很多GC策略都是经过压测调校的， 如果目前工作的很好，主要是暂停时间（GC 日志里面的"real"耗时）上没有问题，不推荐专门切换到G1算法，特别是比较小的堆（20G以下的）。

### 复杂场景

-  -XX:G1ReservePercent=10
   这个参数指定了G1要保留多少空闲空间来防止Promotion failure，G1的YGC失败会导致失败的年轻代region全部变成老年代region，是一个代价非常大的操作。gclog中应该尽量避免出现promotion failure，如果频繁出现可以考虑调大-XX:G1ReservePercent这个参数(默认10%)。 

-  -XX:+G1LogLevel=fine/finer/finest
   可以打印不同详细程度的GC信息 

-  -XX:+G1OptThruput
   在8.6.11以上（包括）的版本中可以使用该选项开启G1的throughput模式，针对特定场景可以降低CPU使用率的同时维持较低暂停时间。 

> 请注意，这个选项需要测试，如果观察到GC暂停时间明显上涨，则说明应用不适合这个模式；一般不推荐超过20G的堆(一次ygc之后剩余大小)使用这个选项。

## JDK 8 应用基础 jvm 参数参考

### 参数参考(按机型)

#### 4C8G

- CMS

```bash
-server -Xms4g -Xmx4g -Xmn2g                                                 \
-XX:+UseConcMarkSweepGC -XX:+CMSScavengeBeforeRemark                         \
-XX:CMSMaxAbortablePrecleanTime=5000 -XX:+CMSClassUnloadingEnabled           \
-XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly     \
-XX:+ExplicitGCInvokesConcurrent -XX:ParallelGCThreads=4                     \
-Xloggc:/home/admin/logs/gc.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps   \
-Dsun.rmi.dgc.server.gcInterval=2592000000                                   \
-Dsun.rmi.dgc.client.gcInterval=2592000000                                   \
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m                             \
-XX:ReservedCodeCacheSize=256m                                               \
-XX:MaxDirectMemorySize=512m                                                 \
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/logs            \
-XX:ErrorFile=/home/admin/logs/hs_err_pid%p.log                              \
```

- G1

```bash
-server -Xms4g -Xmx4g -XX:MaxNewSize=2g                                      \
-XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=40 -XX:G1HeapRegionSize=8m   \
-XX:+ExplicitGCInvokesConcurrent -XX:ParallelGCThreads=4                     \
-Xloggc:/home/admin/logs/gc.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps   \
-Dsun.rmi.dgc.server.gcInterval=2592000000                                   \
-Dsun.rmi.dgc.client.gcInterval=2592000000                                   \
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=256m                             \
-XX:ReservedCodeCacheSize=256m                                               \
-XX:MaxDirectMemorySize=512m                                                 \
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/logs            \
-XX:ErrorFile=/home/admin/logs/hs_err_pid%p.log                              \
```

#### 8C16G

- CMS

```bash
-server -Xms10g -Xmx10g -Xmn5g                                               \
-XX:+UseConcMarkSweepGC  -XX:+CMSScavengeBeforeRemark                        \
-XX:CMSMaxAbortablePrecleanTime=5000 -XX:+CMSClassUnloadingEnabled           \
-XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCMSInitiatingOccupancyOnly     \
-XX:+ExplicitGCInvokesConcurrent -XX:ParallelGCThreads=8                     \
-Xloggc:/home/admin/logs/gc.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps   \
-Dsun.rmi.dgc.server.gcInterval=2592000000                                   \
-Dsun.rmi.dgc.client.gcInterval=2592000000                                   \
-XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m                             \
-XX:ReservedCodeCacheSize=512m                                               \
-XX:MaxDirectMemorySize=512m                                                 \
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/logs            \
-XX:ErrorFile=/home/admin/logs/hs_err_pid%p.log                              \
```

- G1

```bash
-server -Xms10g -Xmx10g -XX:MaxNewSize=5g                                    \
-XX:+UseG1GC -XX:InitiatingHeapOccupancyPercent=40 -XX:G1HeapRegionSize=16m  \
-XX:+ExplicitGCInvokesConcurrent -XX:ParallelGCThreads=8                     \
-Xloggc:/home/admin/logs/gc.log -XX:+PrintGCDetails -XX:+PrintGCDateStamps   \
-Dsun.rmi.dgc.server.gcInterval=2592000000                                   \
-Dsun.rmi.dgc.client.gcInterval=2592000000                                   \
-XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m                             \
-XX:ReservedCodeCacheSize=512m                                               \
-XX:MaxDirectMemorySize=512m                                                 \
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/logs            \
-XX:ErrorFile=/home/admin/logs/hs_err_pid%p.log                              \
```

### 其他建议

MaxDirectMemorySize、MetaspaceSize、MaxMetaspace根据实际情况调整

关闭偏向锁

- -XX:-UseBiasedLocking

加速启动 (8.4.7)

- -Dcom.alibaba.introspector.findCustomizerClass.skipStrategy=SKIP_ALL (参考AJDK 8Release Note)

启动时开启Attach机制, 避免FGC导致jcmd等命令无法响应

- -XX:+StartAttachListener

Metaspace Dump (8.5.9_fp1)

- -XX:+MetaspaceDumpOnOutOfMemoryError -XX:MetaspaceDumpPath=/home/admin/logs

异步 GC 日志 (8.5.9)

- -XX:+UseAsyncGCLog
