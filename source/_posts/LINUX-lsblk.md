---
title: Linux lsblk命令
tags:
  - Linux
description: >-
  lsblk（list block
  devices）会列出所有可用的硬盘、U盘、光驱等块设备的信息，以及分区和挂载点等。常用于查看磁盘的挂载情况、磁盘分区、磁盘的文件系统类型(ext4、xfs、ntfs等)、排查存储设备问题。
abbrlink: da8acf6b
date: 2025-03-26 10:06:22
---

## 介绍

lsblk（list block devices）会列出所有可用的硬盘、U盘、光驱等**块设备**的信息，以及分区和挂载点等。常用于查看磁盘的挂载情况、磁盘分区、磁盘的文件类型(ext4、xfs、ntfs等)、排查存储设备问题。

## 基本语法

lsblk [OPTIONS]

- OPTIONS：选项参数

| 选项参数          | 介绍                                                         |
| ----------------- | ------------------------------------------------------------ |
| `-a`(all)         | 显示所有块设备(包括没有挂载的设备)。在单独使用lsblk命令时，会忽略没有分区的设备，通过`-a`参数可以确保列出所有设备。 |
| `-f`(filesystem)  | 显示文件系统信息（设备使用情况、挂载点、文件系统类型等）。   |
| `-m`(permissions) | 显示设备的权限信息。例如，设备的读写权限。                   |
| `-o`(output)      | 自定义输出的列。例如，`lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT` 只会显示设备名称、大小、文件系统类型和挂载点。 |
| `-d`(device)      | 只显示原始设备，不显示分区信息。例如，只想看硬盘本身，不想看分区。 |

## 基本功能

### `lsblk -a`

```bash
root@ubuntu:~# lsblk -a
NAME                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda                         8:0    0 232.9G 0 disk
├─sda1                      8:1    0 512M   0 part /boot/efi
├─sda2                      8:2    0 128M   0 part /boot
└─sda3                      8:3    0 232.3G 0 part /
sdv                        65:80   0 14.6T  0 disk /root/disks/25
sdw                        65:96   0 14.6T  0 disk /root/disks/28
sdx                        65:112  0 14.6T  0 disk /root/disks/26
sdy                        65:128  0 14.6T  0 disk /root/disks/27
```

**参数含义**

sda的树状结构：`sda1`、`sda2`、`sda3` 是 `sda` 硬盘的分区。

| 参数        | 含义                                                         |
| ----------- | ------------------------------------------------------------ |
| NAME        | 设备名称                                                     |
| MAJ:MIN     | 设备的主设备号和次设备号，Linux系统中设备的唯一标识，用户侧不关心。 |
| RM          | 表示设备是否是可移动设备。`1` 表示是可移动设备（比如 U 盘），`0` 表示不是可移动设备（比如内置硬盘）。 |
| SIZE        | 设备的存储大小，例如14.6T代表硬盘的大小。                    |
| RO          | 表示设备是否是只读的。`0` 表示可以读写，`1` 表示只读。       |
| TYPE        | 设备的类型，`disk` 表示这是一个硬盘（或者类似硬盘的设备），`part` 表示这是一个分区。 |
| MOUNTPOINTS | 设备的挂载点。如果一个设备被挂载到了某个目录，这里就会显示挂载的路径。比如 `/` 表示根目录，设备`sdv`被挂载到了`/root/disks/25`目录下。如果设备没有挂载，这里会显示为空。 |

`lsblk -f`

```bash
root@ubuntu:~# lsblk -f
NAME   FSTYPE   FSVER   LABEL UUID                                   FSAVAIL FSUSE% MOUNTPOINTS
sdv    ext4     1.0           e9833d5b-20fd-44de-a8bd-76e8e4582901      9.6T    34% /root/disks/25
sdw    ext4     1.0           eba1d424-0e27-440d-92a0-4f53a36357e6      5.1T    65% /root/disks/28
sdx    ext4     1.0           bc6a6972-9749-4daa-b014-912545f9d4e5      1.6T    89% /root/disks/26
sdy    ext4     1.0           f91546ca-2547-4fa2-951b-fe06a5151409      6.5T    56% /root/disks/27
```

**参数含义**

| 参数                                | 含义                                          |
| :---------------------------------- | :-------------------------------------------- |
| `NAME`                              | 设备名称，比如硬盘（`sda`）、分区（`sda1`）等 |
| `FSTYPE`(FileSystem Type)           | 文件系统类型，比如 `ext4`、`xfs`、`ntfs` 等   |
| `FSVER`(FileSystem Version)         | 文件系统的版本号                              |
| `LABEL`                             | 设备的标签，用户可以给设备自定义名称          |
| `UUID`                              | 设备的唯一标识符，每个设备都有一个唯一的 UUID |
| `FSAVAIL`                           | 文件系统中可用的空间大小                      |
| `FSUSE%`(FileSystem Use Percentage) | 文件系统的使用率，以百分比表示                |
| `MOUNTPOINTS`                       | 设备的挂载点，显示设备挂载到的目录路径        |

> 文件系统类型。了解文件系统类型可以帮助你判断设备的用途，以及是否需要特定的工具来操作它。常见的文件系统类型有：
>
> - `ext4`：Linux 系统常用的文件系统。
> - `xfs`：另一种高性能的文件系统，也常用于 Linux。
> - `ntfs`：Windows 系统常用的文件系统。
> - `vfat`：常用于 U 盘等移动存储设备。

`lsblk -m`

`sdv`、`sdw`、`sdx`、`sdy` 都是硬盘设备的名称，如果有分区，可能会看到类似 `sdv1`、`sdv2` 等。

```bash
root@ubuntu:~# lsblk -m
NAME                       SIZE OWNER GROUP MODE
sdv                       14.6T root  disk  brw-rw----
sdw                       14.6T root  disk  brw-rw----
sdx                       14.6T root  disk  brw-rw----
sdy                       14.6T root  disk  brw-rw----
```

**参数含义**.

`brw-rw----`解释：

- `b`：表示这是一个块设备（block device）。
- `rw-`：表示所有者（`root`）对该设备有读写权限。
- `rw-`：表示所属组（`disk`）对该设备有读写权限。
- `----`：表示其他用户对该设备没有权限。

| 列名    | 含义                                                         |
| :------ | :----------------------------------------------------------- |
| `NAME`  | 设备名称，比如硬盘（`sda`）、分区（`sda1`）等。              |
| `SIZE`  | 设备的大小，单位通常是字节（B）、千字节（K）、兆字节（M）、吉字节（G）或太字节（T）。 |
| `OWNER` | 设备的所有者用户名。                                         |
| `GROUP` | 设备所属的用户组名。                                         |
| `MODE`  | 设备的访问权限模式。                                         |

`lsblk -d`

```bash
root@ubuntu:~# lsblk -d
NAME  MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda     8:0    1 57.6G  0 disk 
sdv    65:80   0 14.6T  0 disk /root/disks/25
sdw    65:96   0 14.6T  0 disk /root/disks/28
sdx    65:112  0 14.6T  0 disk /root/disks/26
sdy    65:128  0 14.6T  0 disk /root/disks/27
```

