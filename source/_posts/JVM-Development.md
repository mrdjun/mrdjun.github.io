---
title: JVM发展历程
tags:
  - JVM
description: Java发展过程中的重大事件，JVM发展历程。
abbrlink: a270ae4b
date: 2021-08-25 23:40:57
---

## Java发展的重大事件

- 1990年，在sun公司中，由Patrick naughton、mikesheridan以及james Gosling领导的小组Green Team，开发出新的程序语言，命名为OAK，后期更名为Java
- 1995年，sun正式发布Java和hotJAVA产品，Java首次公开亮相。
- 1996年1月23日sun Microsystems发布了JDK1.0.
- 1998年，JDK1.2版本发布。同时，sun发布了JSP/Servlet、EJB规范，以及将Java分成了J2EE、J2SE和J2ME。这表明Java开始向企业、桌面应用和移动设备应用3大领域挺进。
- 2000年，JDK1.3发布，Java HotSpot Virtual Machine正式发布，成为Java默认的虚拟机。
- 2002年，JDK 1.4发布，古老的classic虚拟机退出历史舞台。
- 2003年底，Java平台的scala正式发布，同年Groovy也加入了Java阵营。
- 2004年，JDK1.5发布，同时JDK1.5改名为JavaSE5.0.
- 2006年，JDK 6发布，同年Java开源并建立了openJDK，顺理成章，Hotspot虚拟机成为了OpenJDK中默认的虚拟机。
- 2007年，Java平台迎来了新伙伴Clojure。
- 2008年，Oracle收购了BEA，得到了JRockit虚拟机。
- 2009年，Twitter宣布将后台大部分程序从ruby迁移到Scala，这是Java平台的有一次大规模应用。
- 2010年，Oracle收购了sun，获得Java商标和最具价值的hotspot虚拟机。此时Oracle拥有市场占用率最高的两款虚拟机hotspot和JRockit，并且计划未来进行整合：HotRockit。
- 2011年，JDK7发布，在JDK１.7ｕ4中，正式启用了新的垃圾回收器G1.
- 2017年，JDK9发布，将G1设置为默认GC，替代CMS。
- 2017同年，IBM的J9开源，形成了现在的open J9社区。
- 2018年，Android的Java侵权案判决，Google公司赔偿Oracle总计88亿美元。
- 2018同年，Oracle宣布JavaEE成为历史名词，JDBC、JMS、Servlet赠与Eclipse基金会。
- 2018同年，JDK11发布，LTS版本的JDK，发布革命性的ZGC，调整JDK授权许可。
- 2019年，JDK12发布，加入RedHat领导开发的shenandoah GC。
- 在JDK11之前，OracleJDK还会存在一些openJDK中没有的、闭源的功能。但在JDK11中，openJDK和OracleJDK代码实质上已经达到完全一致的程度。

## JVM的发展历程

### Sun Classic VM

- 1996年随Java1.0版本发布，JDK1.4时被完全淘汰。
- 它只提供解释器。
- 如果使用JIT编译器，就需要进行外挂。但一旦使用了JIT编译器，JIT会接管虚拟机的执行系统。解释器就不再工作，解释器和编译器不能配合工作。
- 现在hotspot内置了此虚拟机

### Exact VM

- 为了解决上一个虚拟机问题，JDK1.2时，Sun提供了此虚拟机。
- Exact Management：准确式内存管理
  - 虚拟机可以知道内存中某个位置的数据是什么类型。
- 具备现代高性能虚拟机的雏形
  - 热点探测
  - 编译器与解释器混合工作模式
- 只在Solaris平台短暂使用，其它平台上还是Classic VM
  - 英雄气短，终被Hotspot虚拟机替换

### Hotspot VM

- JDK1.3时，Hotspot VM成为默认虚拟机
- 目前Hotspot占有绝对的市场地位。
- Hotspot指的就是热点代码探测技术。
  - 通过计数器找到最具有编译价值的代码，触发即时编译或栈上替换
  - 通过编译器与解释器协同工作，在最优化的程序响应时间与最佳执行性能中取得平衡。

### BEA 的 JRockit

- 专注于服务器端应用
  - 它可以不太关注程序的启动速度，因此JRockit 内部不包含解释器实现，全部代码都靠即时编译器编译后执行。
- 大量的行业基准测试显示，JRockit JVM是世界上最快的JVM
  - 显著的性能提高（一些超过了70%）和硬件成本的减少（达50%)
- 优势全面的Java运行时解决方案组合
  - JRockit 面对延迟敏感型应用的解决方案JRockit Real Time提供以毫秒或微妙级的JVM响应时间，适合财务、军事指挥、电信网络的需要。
  - Mission Control服务套件：以极低的开销来监控、管理和分析生产环境中的应用程序的工具
- 2008年，BEA被Oracle收购
- Oracle大致在JDK8在Hotspot上移植了JRockit的优秀特征。

### IBM 的J9

- 全称：IBM Technology for Java Virtual Machine,简称IT4J，内部代号：J9
- 市场定位与Hotspot接近，服务器端、桌面应用、嵌入式等多用途JVM
- 广泛用于IBM的各种Java产品。
- 目前，有影响力的三大商用虚拟机之一，也是号称是世界上最快的Java虚拟机。
- 2017年左右，IBM发布了开源J9 VM，命名为OpenJ9，交给Eclipse基金会管理，也称为 Eclipse OpenJ9

