---
title: Python进程 线程 协程
tags:
  - Python
description: 在Python中的并发编程模型中，应当如何理解进程、线程以及协程三者之间的关系？各自的应用场景有何不同？CPU会如何调度？
abbrlink: f8dac049
date: 2025-03-17 00:12:50
---

## GIL(Global Interpreter Lock)

GIL是Python解释器中一个全局性的互斥锁。在任意时刻，GIL只允许一个线程执行Python字节码。

> 注意：也就是说，即使你的程序有多个线程，同时运行在多核CPU上，GIL也会确保只有一个线程在执行Python代码。

在Python的早期设计中，引入GIL主要是为了**简化解释器的实现**和**内存管理**。通过GIL，Python解释器无需为数据结构访问加锁，大大简化了内存管理的复杂度。

许多 Python 库是用 C 语言编写的扩展模块。这些扩展模块在设计时假设了 GIL 的存在，从而简化了线程安全的实现。如果没有 GIL，C 扩展模块需要自己处理线程同步，这会增加开发的复杂性和出错的风险。

## 线程

由于GIL的存在，无法实现真正意义上的多线程（多核CPU）。找了一个示例来说明：

```python
import time

def gcd(pair):
    a, b = pair
    low = min(a, b)
    for i in range(low, 0, -1):
        if a % i == 0 and b % i == 0:
            return i

    assert False, "Not reachable"

NUMBERS = [
    (1963309, 2265973), (5948475, 2734765),
    (1876435, 4765849), (7654637, 3458496),
    (1823712, 1924928), (2387454, 5873948),
    (1239876, 2987473), (3487248, 2098437),
    (1963309, 2265973), (5948475, 2734765),
    (1876435, 4765849), (7654637, 3458496),
    (1823712, 1924928), (2387454, 5873948),
    (1239876, 2987473), (3487248, 2098437),
    (3498747, 4563758), (1298737, 2129874)
]

if __name__ == '__main__':
    start = time.time()
    list(map(gcd, NUMBERS))
    end = time.time()
    delta = end - start
    print(f'单线程顺序执行时间: {delta:.3f} 秒')
```

单线程顺序执行时间：`2.313` 秒。

尝试使用多线程进行优化：

```python
from concurrent.futures import ThreadPoolExecutor

start = time.time()
pool = ThreadPoolExecutor(max_workers=4)
results = list(pool.map(gcd, NUMBERS))
end = time.time()
delta = end - start
print(f'多线程执行时间: {delta:.3f} 秒')
```

多线程执行时间：`2.285 `秒。使用多线程并未有效减少执行耗时。

在**CPU密集型任务**中，多线程并行效果不佳。尽管GIL限制了多线程在CPU密集场景下的表现，但Python在单线程模式下仍然表现出色，对于许多应用来说，单线程已足够满足需求。

在Python中，多线程更适用于**I/O密集型任务**，如文件读写、网络请求等，在线程等待I/O时，会释放GIL，其它线程可以继续执行任务。

如果尝试使用多进程来进行优化，会有效果吗？

## 进程

尝试使用多进程进行优化，将多线池 `ThreadPoolExecutor ` 换成 `ProcessPoolExecutor`：

```python
from concurrent.futures import ProcessPoolExecutor

start = time.time()
pool = ProcessPoolExecutor(max_workers=4)
results = list(pool.map(gcd, NUMBERS))
end = time.time()
delta = end - start
print(f'多进程执行时间: {delta:.3f} 秒')
```

多进程执行时间：`0.978 `秒。效果很明显，执行时间提升了近2.5倍。

在**CPU密集型任务**中，可以创建多个进程执行，每个进程有**独立的**解释器和GIL实例，并且可以独立运行在不同的CPU核心上，从而实现并行计算。

在Python中，多进程更适用于**CPU密集型任务**并且**数据关联性低**的场景。数据关联性高会导致进程间频繁通信，导致性能降低。

那么使用协程会有效果吗？

## 协程

尝试使用多协程进行优化：

```python
async def gcd(pair):
    a, b = pair
    low = min(a, b)
    for i in range(low, 0, -1):
        if a % i == 0 and b % i == 0:
            return i

    assert False, "Not reachable"

async def main():
    tasks = [gcd(pair) for pair in NUMBERS]
    return await asyncio.gather(*tasks)
if __name__ == '__main__':
    start = time.time()
    results = asyncio.run(main())
    end = time.time()
    delta = end - start
    print(f'协程并发执行时间：{delta:.3f} 秒')
```

协程并发执行时间：`2.389 `秒。效率并未提升。

协程主要适用于 **I/O 密集型任务**，I/O等待时无需持有GIL，例如：

- 网络请求（如使用 `aiohttp` 替代 `requests`）。
- 文件读写操作。
- 数据库查询等。

在这些场景中，协程可以通过异步操作充分利用 I/O 等待时间，从而提高效率。

## 多线程和协程之间的区别

- 线程的切换是由操作系统决定的，当一个线程执行 I/O 操作时，操作系统会将该线程挂起，切换到其他线程执行。

- 协程的切换是由程序员通过代码控制的，当一个协程执行 I/O 操作时，会主动让出控制权，让其他协程运行。

| 特性           | 多线程                                 | 协程                                            |
| :------------- | :------------------------------------- | :---------------------------------------------- |
| **实现原理**   | 由操作系统调度，线程切换由操作系统控制 | 由用户态调度，通过事件循环和 `async/await` 实现 |
| **资源消耗**   | 每个线程需要独立的栈空间，资源消耗较大 | 协程共享一个线程的栈空间，资源消耗极小          |
| **执行效率**   | 受 GIL 限制，单线程执行                | 单线程执行，但切换开销小，适合高并发            |
| **数据共享**   | 线程间共享数据，需要锁机制防止竞争条件 | 数据共享容易，但需注意竞争条件                  |
| **适用场景**   | I/O 密集型任务，如文件读写、网络请求   | 高并发 I/O 密集型任务，如网络爬虫、Web 服务器   |
| **编程复杂度** | 需要考虑线程同步、锁竞争等问题         | 编程模型简洁，通过 `async/await` 实现           |
