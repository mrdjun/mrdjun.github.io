---
title: ArrayList
date: 2021-05-31 15:05:00
tags:
- JUC并发包
comments: false
description: 关于如何去学习容器类的源码？先从这个容器类的属性去看这个容器是怎么存储的，再看入口的构造函数，最后是怎么增删改查元素的。
---

> Tips：分享一个心得

关于如何去学习容器类的源码？先从这个容器类的属性去看这个容器是怎么存储的，再看入口的构造函数，最后是怎么增删改查元素的。

-----

## 存储结构

ArrayList底层存储使用的是Object[] elementData。

## 添加元素

添加元素之前判断是否需要扩容（实际上每一次新增元素都需要至少增加一个容量），然后赋值给数组中的元素。

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

最小容量默认为10，小于10的按10来设置。

```java
private void ensureCapacityInternal(int minCapacity) {
    if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        // private static final int DEFAULT_CAPACITY = 10;
        minCapacity = Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    ensureExplicitCapacity(minCapacity);
}
```

接着往下点，可以看到真正扩容的方法是grow方法。

```java
private void grow(int minCapacity) {
    // overflow-conscious code
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

点进Arrays工具类的copyof方法：

```java
public static <T> T[] copyOf(T[] original, int newLength) {
    return (T[]) copyOf(original, newLength, original.getClass());
}

public static <T,U> T[] copyOf(U[] original, int newLength, Class<? extends T[]> newType) {
    @SuppressWarnings("unchecked")
    T[] copy = ((Object)newType == (Object)Object[].class)
        ? (T[]) new Object[newLength]
        : (T[]) Array.newInstance(newType.getComponentType(), newLength);
    System.arraycopy(original, 0, copy, 0,
                     Math.min(original.length, newLength));
    return copy;
}

// 一直往下到这个方法，可以看到调用的是用其它语言实现的数组赋值
public static native void arraycopy(Object src,  int  srcPos,
                                    Object dest, int destPos,
                                    int length);
```

增删查就是对一个数组的一些基本操作。

