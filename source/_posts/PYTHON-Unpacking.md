---
title: Python 解包
tags:
  - Python
description: 解包操作可以应用于列表、元组、字典、集合等可迭代对象。
abbrlink: d2a40328
date: 2025-03-08 23:55:16
---

在 Python 中，`*` 和 `**` 是用于解包（unpacking）操作符，它们分别用于解包可迭代对象（如列表、元组）和字典。这两个操作符在函数调用时非常有用，可以将一个可迭代对象或字典的内容“展开”并传递给函数。

## 1. `*` 的作用：解包可迭代对象

`*` 用于解包可迭代对象（如列表、元组等），将其元素作为单独的参数传递给函数。

### 示例 1：解包列表

```python
def add(a, b, c):
    return a + b + c

numbers = [1, 2, 3]
result = add(*numbers)  # 等价于 add(1, 2, 3)
print(result)  # 输出：6
```

在上面的例子中：

- `numbers` 是一个列表 `[1, 2, 3]`。
- 使用 `*numbers` 将列表解包为三个单独的参数 `1`, `2`, `3`，然后传递给 `add` 函数。

### 示例 2：解包元组

```python
def greet(name, age):
    print(f"Hello {name}, you are {age} years old.")

person = ("Alice", 25)
greet(*person)  # 等价于 greet("Alice", 25)
```

## 2. `**` 的作用：解包字典

`**` 用于解包字典，将其键值对作为关键字参数传递给函数。

### 示例 1：解包字典

```python
def greet(name, age):
    print(f"Hello {name}, you are {age} years old.")

person = {"name": "Alice", "age": 25}
greet(**person)  # 等价于 greet(name="Alice", age=25)
```

在上面的例子中：

- `person` 是一个字典 `{"name": "Alice", "age": 25}`。
- 使用 `**person` 将字典解包为关键字参数 `name="Alice"` 和 `age=25`，然后传递给 `greet` 函数。

### 示例 2：解包字典

```python
def print_info(name, age, city):
    print(f"{name} is {age} years old and lives in {city}.")

info = {"name": "Bob", "age": 30, "city": "New York"}
print_info(**info)  # 等价于 print_info(name="Bob", age=30, city="New York")
```

## 3. 在 `asyncio.gather()` 中使用 `*tasks`

回到你的问题，在 `asyncio.gather()` 中使用 `*tasks` 是为了将 `tasks` 列表中的每个任务解包为单独的参数传递给 `asyncio.gather()`。

### 示例代码

```python
import asyncio

async def task1():
    print("Task 1 started")
    await asyncio.sleep(1)
    print("Task 1 finished")

async def task2():
    print("Task 2 started")
    await asyncio.sleep(2)
    print("Task 2 finished")

async def main():
    tasks = [task1(), task2()]  # 任务列表
    await asyncio.gather(*tasks)  # 解包 tasks 列表

asyncio.run(main())
```

解释：

- `tasks` 是一个包含两个协程任务的列表：`[task1(), task2()]`。
- `asyncio.gather(*tasks)` 等价于 `asyncio.gather(task1(), task2())`。
- `*tasks` 将列表中的每个任务解包为单独的参数，传递给 `asyncio.gather()`。

## 4. `*` 和 `**` 的其他用途

在函数定义中：

- `*args`：用于接收任意数量的位置参数，打包为一个元组。
- `**kwargs`：用于接收任意数量的关键字参数，打包为一个字典。

示例：

```python
def example_function(*args, **kwargs):
    print("Positional arguments:", args)
    print("Keyword arguments:", kwargs)

example_function(1, 2, 3, name="Alice", age=25)
```

输出：

```
Positional arguments: (1, 2, 3)
Keyword arguments: {'name': 'Alice', 'age': 25}
```

## 5. 总结

- `*` 用于解包可迭代对象（如列表、元组），将其元素作为单独的参数传递给函数。
- `**` 用于解包字典，将其键值对作为关键字参数传递给函数。
- 在 `asyncio.gather(*tasks)` 中，`*tasks` 将任务列表解包为单独的参数，方便并发执行多个任务。
