---
title: RabbitMQ消息持久化
tags:
  - 消息中间件
  - RabbitMQ
description: 手动ACK应答可以处理任务不丢失的情况，但是如何保障当 RabbitMQ 服务停掉以后消息生产者发送过来的消息不丢失？
abbrlink: b760ec60
date: 2021-06-20 15:13:35
---

手动ACK应答可以处理任务不丢失的情况，但是如何保障当 RabbitMQ 服务停掉以后消息生产者发送过来的消息不丢失？

默认情况下 RabbitMQ 退出或由于某种原因崩溃时，它忽视队列和消息，除非告知它不要这样做。确保消息不会丢失需要做两件事：**需要将队列和消息都标记为持久化**。

本章节实现简单的队列和消息的持久化功能，更加强有力的持久化策略，在后面发布确认章节再详述。

## 队列持久化

生产者和消费者的信道都需要将下面的 queueDeclare() 方法的 durable 属性设置值为 true。

在com.rabbitmq.client.Channel类中，有以下方法：

```java
   /**
     * Declare a queue
     * @param queue the name of the queue
     * @param durable 是否持久化到磁盘 true if we are declaring a durable queue (the queue will survive a server restart)
     * @param exclusive true if we are declaring an exclusive queue (restricted to this connection)
     * @param autoDelete true if we are declaring an autodelete queue (server will delete it when no longer in use)
     * @param arguments other properties (construction arguments) for the queue
     * @return a declaration-confirm method to indicate the queue was successfully declared
     */
Queue.DeclareOk queueDeclare(String queue, boolean durable, boolean exclusive, boolean autoDelete,
                             Map<String, Object> arguments) throws IOException;
```

## 消息持久化

生产者发送消息的信道设置上参数 MessageProperties.PERSISTENT_TEXT_PLAIN，表示消息持久化到磁盘上。

```java
channel.basicPublish("", QUEUE_NAME, MessageProperties.PERSISTENT_TEXT_PLAIN, (msg).getBytes(StandardCharsets.UTF_8));
```

