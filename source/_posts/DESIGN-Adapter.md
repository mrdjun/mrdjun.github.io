---
title: 适配器模式
tags:
  - 设计模式
description: 适配器模式是作为两个不兼容的接口之间的桥梁，它结合了两个独立接口的功能。
abbrlink: f5c535ea
date: 2021-04-09 20:20:55
---

## 案例一

插座的电压是 220V，手机充电器会把 220V 转换成 5V电压给手机充电，此时这个充电器就是一个适配器。

AC220：插座输出 220V 电压 

```java
public class AC220 {
    public int outputAC220V() {
        System.out.println("[插座电源] 输出交流电220V");
        return 220;
    }
}
```

DC5（接口）：手机充电器输出5V电压

```java
public interface DC5 {
    int output5V();
}
```

PowerAdapter 电源适配器

```java
public class PowerAdapter implements DC5 {
    private AC220 ac220;

    public PowerAdapter(AC220 ac220) {
        this.ac220 = ac220;
    }

    @Override
    public int output5V() {
        int adapterInput = ac220.outputAC220V();
        int adapterOutput = adapterInput / 44;
        System.out.println("[手机充电器]使用电源适配器转换为" + adapterOutput + "V电压");
        return adapterOutput;
    }
}
```

Test 测试类

```java
public class PowerAdapterTest {
    public static void main(String[] args) {
        new PowerAdapter(new AC220()).output5V();
    }
}
```

## 案例二

外国人听不懂中文，我们只会讲中文，那么需要一个翻译，把中文翻译成英文

Chinese 中国人

```java
public class Chinese {
    public String speak() {
        System.out.println("[中国人]你好");
        return "你好";
    }
}
```

Translator（接口）：翻译中文

```java
public interface Translator {
    String translate();
}
```

TranslateAdapter：翻译适配

```java
public class TranslateAdapter implements Translator {
    private Chinese chinese;

    public TranslateAdapter(Chinese chinese) {
        this.chinese = chinese;
    }

    @Override
    public String translate() {
        System.out.println("[翻译适配器]将" + chinese.speak() + "翻译成英文：Hello");
        return "Hello";
    }
}
```

Test 测试类

```java
public class AdapterTest {
    public static void main(String[] args) {
        new TranslateAdapter(new Chinese()).translate();
    }
}
```

## 优缺点

优点

（1）提高类的透明性和复用性，现有的类会被服用但不需要改变；

（2）目标类和适配器类解耦，可以提高程序的扩展性；

（3）大多数场景符合开闭原则；

缺点

（1）在适配器代码编写时，需要全面考虑，可能会增加系统的复杂度；

（2）增加了代码的阅读难度，降低了代码的可读性，过多使用适配器会使系统的代码凌乱；