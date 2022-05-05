---
title: 委派模式
tags:
  - 设计模式
description: >-
  是一种面向对象的设计模式，允许对象组合实现与继承相同的代码重用。它的基本作用就是负责任务的调用和分配任务，是一种特殊的静态代理，可以理解为全权代理，但是代理模式注重过程，而委派模式注重结果。
abbrlink: 3ffc1ee8
date: 2021-04-09 23:20:55
---

## 定义

是一种面向对象的设计模式，允许对象组合实现与继承相同的代码重用。它的基本作用就是负责任务的调用和分配任务，是一种特殊的静态代理，可以理解为全权代理，但是代理模式注重过程，而委派模式注重结果。委派模式属于行为型模式，不属于GOF23种设计模式中。

## 经典案例

老板想要做一个XX项目，安排给项目经理，项目经理事先是了解整个项目组的每个人的职责的，于是项目经理拿到项目之后，分模块分配给项目组的成员。

老板 Boss

```java
public class Boss {
    public void command(String command, Leader leader) {
        System.out.println("[老板]要开发个[" + command + "]的项目");
        leader.doing(command);
    }
}
```

公司员工共同行为 打工 IEmployee

```java
public interface IEmployee {
    void doing(String command);
}
```

项目经理 Leader

```java
public class Leader implements IEmployee {
    // leader 需要预先知道每个员工的特产，特征，分发任务
    private Map<String, IEmployee> target = new HashMap<>();

    public Leader() {
        target.put("加密", new EmployeeA());
        target.put("CRUD", new EmployeeB());
    }

    // 项目经理自己不干活
    @Override
    public void doing(String command) {
        System.out.println("[项目经理] 收到[" + command + "] 分配任务给员工");
        target.get(command).doing(command);
    }
}
```

员工A

```java
public class EmployeeA implements IEmployee {
    @Override
    public void doing(String command) {
        System.out.println("[员工A] 我现在开始干[" + command + "]工作");
    }
}
```

员工B

```java
public class EmployeeB implements IEmployee {
    @Override
    public void doing(String command) {
        System.out.println("[员工B] 我现在开始干[" + command + "]工作");
    }
}
```

老板安排任务 测试类

```java
public class DelegateSimpleTest {
    public static void main(String[] args) {
        Boss boss = new Boss();
        boss.command("加密", new Leader());
    }
}
```

