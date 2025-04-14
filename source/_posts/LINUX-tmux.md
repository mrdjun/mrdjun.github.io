---
title: Linux tmux命令
date: 2025-04-14 16:03:57
tags: 
  - Linux
description: tmux(Terminal Multiplexer)是一个功能比screen更强大的终端复用器。tmux 的配置和使用更加直观，支持更丰富的快捷键和窗口管理功能，支持更灵活的窗口拆分（水平和垂直）、会话同步、复制模式等。允许用户在一个终端窗口中管理多个终端会话。它的核心功能是将终端会话与窗口解绑，即使关闭终端窗口，会话仍然可以继续运行，用户可以在需要时重新连接到会话。
---

## 介绍

`tmux` 是一个终端复用器（Terminal Multiplexer），允许用户在一个终端窗口中管理多个终端会话。它的核心功能是将终端会话与窗口解绑，即使关闭终端窗口，会话仍然可以继续运行，用户可以在需要时重新连接到会话。

`tmux` 和 `screen` 都是终端复用器，功能相似，但 `tmux` 更易用且功能更强大，以下是两者的对比：

- **易用性**：`tmux` 的配置和使用更加直观，支持更丰富的快捷键和窗口管理功能。
- **功能**：`tmux` 支持更灵活的窗口拆分（水平和垂直）、会话同步、复制模式等。
- **兼容性**：`screen` 更早出现，可能在某些老旧系统上更兼容，但 `tmux` 已经成为现代开发环境中的主流选择。

## 安装方式

```bash
# Ubuntu or Debian
sudo apt-get install tmux
# Centos
yum install tmux
```

## 基本概念

session，会话（任务）
windows，窗口
pane，窗格

简单来说：一个会话可以有n个窗口，一个窗口可以分为n个窗格。

## 基本功能

列出所有命令：`tmux list-commands`。

列出所有快捷键：`tmux list-keys`。

1. **会话管理**
   - **创建会话**：`tmux new -s <session_name>` 创建一个名为 `session_name` 的会话。
   - **列出会话**：`tmux ls` 列出所有活跃的会话。`tmux info`列出所有`tmux`的会话信息。
   - **连接会话**：`tmux attach -t <session_name>` 连接到指定会话。
   - **切换会话**：`tmux switch -t <session-name>` 切换到指定会话。
   - **分离会话**：在会话中按 `Ctrl+b d` ，也可以通过命令`tmux detach`分离当前会话。
   - **杀死会话**：`tmux kill-session -t <session_name>` 杀死指定会话。
2. **窗口管理**
   - **创建窗口**：在会话中按 `Ctrl+b c` ，也可以通过命令`tmux new-window -n <window-name>`创建新窗口。
   - **切换窗口**：`Ctrl+b n` 切换到下一个窗口，`Ctrl+b p` 切换到上一个窗口。
   - **重命名窗口**：`Ctrl+b ,` 也可以通过命令 tmux rename-window -t <old_name> <new_name>，重命名当前窗口。
   - **关闭窗口**：`Ctrl+b &` 关闭当前窗口。
   - **从列表中选择窗口**：`ctrl+b w`
3. **窗格管理**
   - **创建窗格**：`Ctrl+b %` 垂直分割窗格，`Ctrl+b "` 水平分割窗格。
   - **切换窗格**：`Ctrl+b o` 循环切换窗格。
   - **同步窗格**：在多个窗格中同步输入，适合同时运行相同命令。
4. **复制模式**
   - **进入复制模式**：`Ctrl+b [`，可以使用方向键浏览和复制内容。
   - **退出复制模式**：按 `q` 退出。
5. **配置与自定义**
   - `tmux` 支持通过配置文件（通常是 `~/.tmux.conf`）进行高度自定义。
   - **重新加载配置**：`tmux source-file ~/.tmux.conf`
