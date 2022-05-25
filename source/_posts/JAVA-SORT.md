---
title: 常用的排序方法
tags:
  - Java
description: 几种常用的排序方法：冒泡、选择、插入、希尔排序。
abbrlink: b07f48bf
date: 2022-05-14 22:04:09
---

## 冒泡排序

```java
public class Bubble {
    public static void main(String[] args) {
        int[] arr = new int[]{2, 5, 3, 1, 8, 7, 4};
        sort(arr);
        System.out.println(Arrays.toString(arr));
    }

    public static void sort(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            for (int j = 1; j < arr.length - i; j++) {
                if (arr[j - 1] > arr[j]) {
                    int temp = arr[j - 1];
                    arr[j - 1] = arr[j];
                    arr[j] = temp;
                }
            }
        }
    }
}
```

## 选择排序

```java
public class Selection {
    public static void main(String[] args) {
        int[] arr = new int[]{2, 5, 3, 1, 8, 7, 4};
        sort(arr);
        System.out.println(Arrays.toString(arr));
    }

    public static void sort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[minIndex] > arr[j]) {
                    minIndex = j;
                }
            }
            int temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }
}
```

## 插入排序

```java
public class Insertion {
    public static void main(String[] args) {
        int[] arr = new int[]{2, 5, 3, 1, 8, 7, 4};
        sort(arr);
        System.out.println(Arrays.toString(arr));
    }

    public static void sort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            for (int j = i; j > 0; j--) {
                if (arr[j - 1] > arr[j]) {
                    int temp = arr[j];
                    arr[j] = arr[j - 1];
                    arr[j - 1] = temp;
                } else {
                    break;
                }
            }
        }

    }
}
```

## 希尔排序

```java
public class Shell {
    public static void sort(int[] arr) {
        // 增长量h
        int h = 1;
        while (h <= arr.length / 2) {
            h = h * 2 + 1;
        }
        while (h >= 1) {
            for (int i = h; i < arr.length; i++) {
                for (int j = i; j >= h; j -= h) {
                    if (arr[j - h] > arr[j]) {
                        int temp = arr[j];
                        arr[j] = arr[j - h];
                        arr[j - h] = temp;
                    } else {
                        break;
                    }
                }
            }
            // 减小增长量
            h = h / 2;
        }
    }
}
```

