---
title: Py3 字符串
tags:
  - Python
description: >-
  在Python3中，字符串str是不可变的数据类型，提供了许多内置方法来处理字符串。这些方法可以帮助你进行字符串的格式化、查找、替换、分割、大小写转换等操作。
abbrlink: 5b400b08
date: 2025-03-16 15:12:55
---

## 字符串查找和定位

### `str.find(sub[, start[, end]])`

语法：

- `sub`：要查找的子字符串。
- `start`（可选）：开始查找的起始索引，默认为 0。
- `end`（可选）：结束查找的结束索引，默认为字符串的长度。

返回值：

- 如果找到子字符串，返回子字符串在字符串中首次出现的索引值。
- 如果没有找到子字符串，返回 `-1`。

#### 示例 1：基本用法

在这个例子中，`world` 是子字符串，它在 `text` 中首次出现的位置是索引 `7`。

```python
text = "Hello, world!"
position = text.find("world")
print(position)  # 输出7
position = text.find("Python")
print(position)  # 输出-1
```

#### 示例 2：指定起始索引

从索引 5 开始查找 `Hello`，它在索引`12`处被找到。

```python
text = "Hello,world!Hello again!"
position = text.find("Hello", 5)  # 从索引 5 开始查找'Hello'
print(position)  # 输出：12
```

#### 示例 3：指定查询范围

在字符串中指定起始索引`10`，结束索引`20`的范围中，查询`Hello`。

```py
text = "Hello,world!Hello,again!"
position = text.find("Hello", 10, 20)  # 从索引 10 开始，到索引 20 结束
print(position)  # 输出：12
```

#### 示例 4：查找多个子字符串

先找到第一个 `Hello`，然后从第一个 `Hello` 的下一个位置开始查找第二个 `Hello`。

```python
text = "Hello,world!Hello,again!"
position1 = text.find("Hello")
position2 = text.find("Hello", position1 + 1)
print(position1)  # 输出：0
print(position2)  # 输出：12
```

> 1. `str.find()` 是大小写敏感的，即 `"Hello"` 和 `"hello"` 是不同的。
> 2. 如果子字符串为空字符串（`""`），`str.find()` 会返回起始索引位置。
> 3. `str.find()` 和 `str.index()` 方法类似，但 `str.index()` 在找不到子字符串时会抛出 `ValueError` 异常，而 `str.find()` 返回 `-1`。

### `str.index(sub[, start[, end]])`

与 `find` 类似，但如果没有找到子字符串，会抛出 `ValueError` 异常。

```python
text = "Hello, world!"
position = text.index("world")
print(position)  # 输出：7
# 如果子字符串不存在，会抛出异常
try:
    position = text.index("Python") # ValueError: substring not found
except ValueError as e:
    print(f'index error:{str(e)}') # index error:substring not found
```

### `str.count(sub[, start[, end]])`

返回子字符串 `sub` 在字符串中出现的次数。从字符串索引`start`开始统计到`end`索引结束。

```python
text = "Hello, world! Hello again!"
count = text.count("Hello")
print(count)  # 输出：2
```

### `str.startswith(prefix[, start[, end]])`

检查字符串是否以指定的前缀开头。

```python
text = "Hello, world!"
print(text.startswith("Hello"))  # 输出：True
```

### `str.endswith(suffix[, start[, end]])`

检查字符串是否以指定的后缀结尾。

## 字符串大小写转换

### `str.upper()`

将字符串中的所有字符转换为大写。

```python
text = "Hello, world!"
upper_text = text.upper()
print(upper_text)  # 输出：HELLO, WORLD!
```

### `str.lower()`

将字符串中的所有字符转换为小写。

### `str.capitalize()`

将字符串的第一个字符转换为大写，其余字符转换为小写。

```python
text = "hello, world!"
capitalized_text = text.capitalize()
print(capitalized_text)  # 输出：Hello, world!
```

### `str.title()`

将字符串中每个单词的首字母转换为大写。

```python
text = "hello, world!"
title_text = text.title()
print(title_text)  # 输出：Hello, World!
```

## 字符串分割和连接

### `str.split(sep=None, maxsplit=-1)`

根据分隔符 `sep` 将字符串分割成多个子字符串，并返回一个列表。如果 `sep` 未指定，则默认按空白字符（空格、换行 `\n`、制表符 `\t` 等）分割。

#### 示例1：默认分割

```python
text = "Hello, world! Hello, again!"
words = text.split()
print(words)  # 输出：['Hello,', 'world!', 'Hello,', 'again!']
```

#### 示例2：指定分割符

```python
words = text.split(',')
print(words) # ['Hello', ' world! Hello', ' again!']
```

#### 示例3：指定最大分割次数

```python
words = text.split(',', maxsplit=1)
print(words) # ['Hello', ' world! Hello, again!']
```

### `str.join(iterable)`

将可迭代对象（如列表、元组）中的元素连接成一个字符串，元素之间用调用该方法的字符串作为分隔符。

```python
words = ["Hello", "world", "Welcome", "to", "Python"]
text = " ".join(words)
print(text)  # 输出：Hello world Welcome to Python
```

### `str.splitlines([keepends])`

 splitlines() 按照行('\r', '\r\n', \n')分隔，返回一个包含各行作为元素的列表，如果参数 keepends 为 False，不包含换行符，如果为 True，则保留换行符。

```python
'ab c\n\nde fg\rkl\r\n'.splitlines() # ['ab c', '', 'de fg', 'kl']
```

## 字符串截取

### str[start:end]

截取索引`start`至索引`end`

```python
text = "Hello,world"
print(text[0:5])  # Hello
print(text[:5])   # Hello
print(text[6:])   # world
```

## 字符串替换

### `str.replace(old, new[, count])`

将字符串中的子字符串 `old` 替换为 `new`。`count` 参数可选，指定替换的次数。

```python
text = "Hello, world! Hello again!"
new_text = text.replace("Hello", "Hi")
print(new_text)  # 输出：Hi, world! Hi again!
new_text = text.replace("Hello", "Hi", 1)
print(new_text)  # 输出：Hi, world! Hello again!
```

## 字符串格式化

### `str.format(*args, **kwargs)`

使用占位符 `{}` 将变量插入到字符串中。

```python
name = "djun"
age = 28
greeting = "Hello, my name is {} and I am {} years old.".format(name, age)
print(greeting)  # 输出：Hello, my name is djun and I am 28 years old.
```

### `f-string`（Python 3.6+）

使用 `f` 前缀和花括号 `{}` 来嵌入表达式。

```python
name = "djun"
age = 28
greeting = f"Hello, my name is {name} and I am {age} years old."
print(greeting)  # 输出：Hello, my name is djun and I am 28 years old.
```

## 字符串的其他操作

### `str.strip([chars])`

移除字符串两端的空白字符（包括空格、换行符等）。`chars` 参数可选，指定要移除的字符集合。

```python
text = "   Hello, world!   "
stripped_text = text.strip()
print(stripped_text)  # 输出：Hello, world!
```

### `str.isalpha()`

检查字符串是否只包含字母。

```python
text = "Hello"
print(text.isalpha())  # 输出：True
text = "Hello1234"
print(text.isalpha())  # 输出：False
```

### `str.isdigit()`

检查字符串是否只包含数字。

```python
text = "12345"
print(text.isdigit())  # 输出：True
text = "Hello1234"
print(text.isdigit())  # 输出：False
```

### `str.isalnum()`

检查字符串是否只包含字母或数字。

```python
text = "Hello123"
print(text.isalnum())  # 输出：True
text = ",,,h1"
print(text.isalnum())  # 输出：False
```

### `str.rstrip([chars])`

删除字符串末尾的指定字符，默认为空白符，包括空格、换行符、回车符、制表符。

### `str.swapcase()`

大写字母转换为小写字母，小写字母会转换为大写字母。

### `str.zfill(width)`

返回指定长度的字符串，原字符串右对齐，前面填充0。

```python
str = "this is string example from runoob....wow!!!"
print ("str.zfill : ",str.zfill(40)) # this is string example from runoob....wow!!!
print ("str.zfill : ",str.zfill(50)) # 000000this is string example from runoob....wow!!!
```

