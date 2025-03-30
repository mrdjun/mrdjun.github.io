---
title: Linux rsync命令
tags:
  - Linux
description: >-
  rsync是一个文件同步工具，比scp传输更快，功能更强大。常用于大量文件的同步、备份和迁移场景。支持控制带宽，断点续传，保留文件属性（例如，权限、时间等）。
abbrlink: 7955b510
date: 2025-03-27 23:42:26
---

## 介绍

`rsync`是一个文件同步工具，比`scp`传输更快，功能更强大。常用于大量文件的同步、备份和迁移场景。支持控制带宽，断点续传，保留文件属性（例如，权限、时间等）。

- `rsync` 采用差异传输算法，仅传输源文件与目标文件之间的不同部分，大幅减少数据传输量，特别适合同步大文件或文件夹；所以也适合增量数据备份。
- 支持通过SSH进行本地和远程文件传输；
- 允许限制文件传输时的带宽使用，`rsync`会在数据传输过程中进行压缩和解压；

## 基本语法

`rsync [OPTIONS] SOURCE DESTINATION`

- OPTIONS：选项参数
- SOURCE：指定要传输的源文件或目录，可以是本地或远程路径。
- 指定文件或目录复制的目标路径，可以是本地或远程路径。

| 选项参数        | 介绍                                                         |
| --------------- | ------------------------------------------------------------ |
| `-a`(archive)   | 归档模式，等同于 `-rlptgo`，表示递归同步文件和目录，并保留原始文件的权限、用户、组、时间戳等属性 |
| `-r`(recursive) | 递归同步目录                                                 |
| `-v`(verbose)   | 详细模式，显示同步过程中的详细信息                           |
| `-n`(dry-run)   | 模拟运行，不实际执行同步操作，用于测试同步命令的效果         |
| `-u`(update)    | 仅更新目标位置中比源位置旧的文件                             |
| `-z`(zip)       | 在传输过程中压缩文件数据，节省带宽                           |
| `-P`（大写）    | 等同于`--partial + --progress`，启用部分传输和显示进度。     |
| `--partial`     | 断点续传，这对于大文件或网络不稳定的情况非常有用。           |
| `--progress`    | 显示传输进度，包括已传输的数据量、传输速度、预计剩余时间等   |
| `--delete`      | 删除目标位置中多余的文件，使目标位置与源位置保持一致         |
| `--exclude`     | 排除指定的文件或目录，不进行同步                             |
| `--include`     | 包含指定的文件或目录，进行同步                               |
| `--bwlimit`     | 限制 I/O 带宽，单位为 KBytes/s                               |
| `--timeout`     | 设置 I/O 超时时间（以秒为单位）                              |

## 常用功能

对于文件备份来说，-avP参数够用了。

`rsync -avP /root/disks/15 /root/disks/25`

### 本地文件同步

将 `/source/path/` 下的文件和目录递归同步到 `/destination/path/`，并保留文件属性。

`rsync -av /source/path/ /destination/path/`

### 远程文件同步

将本地的 `/local/path/` 同步到远程主机 `remote_host` 上的 `/remote/path/`，并压缩数据以节省带宽。

`rsync -avz /local/path/ user@remote_host:/remote/path/`

### 增量备份

同步 `/source/path/` 到 `/backup/path/`，并删除 `/backup/path/` 中多余的文件，保持一致。

`rsync -av --delete /source/path/ /backup/path/`

### 部分传输与进度显示

同步 `/source/path/` 到远程主机 `remote_host` 上的 `/remote/path/`，支持部分传输和显示进度。

`rsync -avP /source/path/ user@remote_host:/remote/path/`

### 限制带宽

同步文件时限制带宽为 `1M/s`。

`rsync -av --bwlimit=1024 /source/path/ /destination/path/`

