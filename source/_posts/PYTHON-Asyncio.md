---
title: Python Asyncio
tags:
  - Python
description: 协程是一种轻量级的线程，由用户控制调度，可以在单线程内实现并发。与线程相比，协程的切换开销更小，更适合处理 I/O 密集型任务。`asyncio` 提供了事件循环、任务、Future 等机制，方便开发者编写异步代码。
abbrlink: 28e3b42f
date: 2025-03-08 15:13:40
---

> Python版本：3.9
>
> 协程（Coroutine）是一种轻量级的线程，由用户控制调度，可以在单线程内实现并发。与线程相比，协程的切换开销更小，更适合处理 I/O 密集型任务。`asyncio` 提供了事件循环、任务、Future 等机制，方便开发者编写异步代码。

从实际案例学习入手，引用一个[官方的示例](https://docs.python.org/3/library/asyncio.html)，更多[asyncio示例直通车](https://github.com/python/asyncio/tree/master/examples)。

## 事件循环

事件循环（Event Loop）是 `asyncio` 的核心，负责调度和执行协程。Python 3.9 推荐使用 `asyncio.run()` 来运行协程，它会自动管理事件循环。

```python
import asyncio

async def main():
    print('Hello ...')
    # 模拟IO操作
    await asyncio.sleep(2)
    print('... World!')

# 使用 asyncio.run() 运行协程
asyncio.run(main()) 
```

## 协程函数

使用 `async def` 定义的函数是协程函数。协程函数内部可以使用 `await` 关键字来等待其他协程或异步操作完成。

```python
async def fetch_data():
    await asyncio.sleep(2)
    return "Data fetched"

async def main():
    data = await fetch_data()
    print(data)

asyncio.run(main())
```

## 协程任务(Task)

任务(Task)是对协程的进一步封装，通过 `asyncio.create_task`创建任务，可以用于并发执行多个协程。

```python
import asyncio

async def fetch_data():
    await asyncio.sleep(2)
    return "Data fetched"

async def task1():
    print('Task 1 started')
    res = await fetch_data()
    print(f'Task 1 finished {res}')

async def task2():
    print('Task 2 started')
    res = await fetch_data()
    print(f'Task 2 finished {res}')

async def main():
    t1 = asyncio.create_task(task1(), name='1')
    t2 = asyncio.create_task(task2(), name='2')

    await t1
    await t2

asyncio.run(main())
```

运行结果：

```
立即打印出：
    Task 1 started
    Task 2 started
两秒后打印出：
	Task 1 finished Data fetched
	Task 2 finished Data fetched
```

## 等待任务执行完成

`asyncio.wait()` 可以等待多个任务全部完成，这些任务可能还在运行中，或者因为某些原因（如被取消）而未完成。wait方法的返回值是一个元组：(done,pending)，done和pending是两个Set集合：

- `done`：所有已经完成的任务。
- `pending`：所有尚未完成的任务。

下方示例包含了可能遇见的使用场景：

- 处理已完成的任务，获取结果处理异常；
- 处理未完成的任务，取消任务；

```python
import asyncio

async def task(name, delay):
    print(f"Task {name} started")
    await asyncio.sleep(delay)
    if name == 'C':
        raise RuntimeError(f'Task {name} failed')
    print(f"Task {name} completed")
    return 'Data fetched'

async def main():
    task1 = asyncio.create_task(task("A", 2), name='A') # 正常结束，获取结果
    task2 = asyncio.create_task(task("B", 5), name='B') # 超时，取消
    task3 = asyncio.create_task(task("C", 1), name='C') # 报错

    # 使用 asyncio.wait 等待两个任务完成，超时时间为 3 秒，让B超时
    done, pending = await asyncio.wait([task1, task2, task3], timeout=3)

    # 打印完成的任务
    for t in done:
        try:
            print(f"Task {t.get_name()} done,result is {t.result()}")
        except Exception as e:
            print(f"Task {t.get_name()} raised an exception: {e}")

    # 处理未完成的任务
    for t in pending:
        print(f"Task {t.get_name()} is still pending")
        # 选择取消未完成的任务
        t.cancel()
        print(f"Task {t.get_name()} has been cancelled")

asyncio.run(main())
```

运行结果：

```
Task A started
Task B started
Task C started
Task A completed
Task C raised an exception: Task C failed
Task A done,result is Data fetched
Task B is still pending
Task B has been cancelled
```

## 多协程并发执行

`asyncio.gather()` 可以并发执行多个协程，并等待它们全部完成。

```python
import asyncio
import random

async def fetch_data(name): # 根据入参区分任务
    sec = random.randint(1, 10) # 生成1-10s随机等待时间
    print(f'{name} wait sec {sec}')
    await asyncio.sleep(sec)
    return f"fetched {name}"

async def main():
    results = await asyncio.gather(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    print(results)

asyncio.run(main())
```

运行结果：

```
立即打印出：
    1 wait sec 3
    2 wait sec 5
    3 wait sec 1
等待稍许打印出：
    ['fetched 1', 'fetched 2', 'fetched 3']
```

从结果上看，多个任务的执行结果是按任务顺序存放的。

## 执行任务超时控制

`asyncio.wait_for()` 可以为协程设置超时时间。

```python
import asyncio

async def fetch_data():
    await asyncio.sleep(2)
    return "Data fetched"

async def main():
    try:
        # 正常情况 timeout>2
        # 超时情况 timeout<=2
        result = await asyncio.wait_for(fetch_data(), 1)  
        print(result)
    except asyncio.TimeoutError:
        print("Timeout!")
    except asyncio.CancelledError:
        print("Cancelled!")

asyncio.run(main())
```

## 队列

`asyncio.Queue` 可以用于协程之间的通信。

```python
import asyncio

async def producer(queue):
    for i in range(5):
        await queue.put(i)
        print(f'produced: {i}')
        await asyncio.sleep(1)

async def consumer(queue):
    while True:
        item = await queue.get()   # 持续消费
        print(f'consumed: {item}')
        await asyncio.sleep(2)  # 模拟消费延迟
        queue.task_done() # 通知队列已完成，避免join()一直阻塞

async def main():
    queue = asyncio.Queue()
    produce_task = asyncio.create_task(producer(queue))
    consume_task = asyncio.create_task(consumer(queue))

    await produce_task    # 等待生产任务完成
    await queue.join()    # 等待队列清空
    consume_task.cancel() # 取消死循环的消费任务，退出程序

asyncio.run(main())
```

> 为什么需要 `queue.task_done()`？
>
> 1. 任务完成的通知机制：
>    - 当你从队列中获取一个任务（使用 `queue.get()`）并处理完该任务后，需要调用 `queue.task_done()` 来告诉队列：“这个任务已经处理完毕”。
>    - 如果没有调用 `queue.task_done()`，队列会认为任务仍在处理中，`queue.join()` 会一直阻塞，等待所有任务完成。
> 2. 与 `queue.join()` 配合使用：
>    - `queue.join()` 会阻塞，直到队列中的所有任务都被处理完毕（即每个 `queue.get()` 都对应了一个 `queue.task_done()`）。
>    - 这种机制非常适合生产者-消费者模式，确保所有任务都被消费者处理完毕后再结束程序。

## 信号量

`asyncio.Semaphore` 可以用于限制并发数量。

```python
async def worker(semaphore, id):
    async with semaphore:
        print(f"Worker {id} started")
        await asyncio.sleep(1)
        print(f"Worker {id} finished")

async def main():
    semaphore = asyncio.Semaphore(2)  # 限制并发数为 2
    tasks = [worker(semaphore, i) for i in range(5)]
    await asyncio.gather(*tasks)

asyncio.run(main())
```

## to_thread

`asyncio.to_thread` 是 Python 3.9 引入的一个新函数，用于将同步阻塞函数放到单独的线程中运行，避免阻塞事件循环。

```python
import asyncio
import time

def blocking_io():
    print("Blocking IO started")
    time.sleep(2)  # 模拟阻塞操作
    print("Blocking IO finished")

async def main():
    print("Main started")
    await asyncio.to_thread(blocking_io)  # 在单独的线程中运行
    print("Main finished")

asyncio.run(main())
```

