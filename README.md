# 从零开始的正则匹配引擎

> 千里之行始于足下 --- 《德道经·第六十四章》

## 前言

这是一个基于个人兴趣产生的"Build your own X"系列的一部分，其余部分会陆续放到github上。

### 动机

萌生编写这一系列教程的目的，在最初，仅仅是为了帮助自己理解并掌握自动机在字符串模式匹配方面
的知识和技术应用。到目前为止，我还是凭借兴趣在做这些。

## 目录

1. src
   所有的实现源码的根目录，每一种语言的实现都会在这个目录下罗列。
2. design
   我给这套教程写的文字稿件，它应当配合源码来使用，用的得当则事半功倍。

## 进度

- [x] NFA与字符串匹配
- [x] ℇ闭包与`cleenclosure`
- [x] 子集构造法
- [x] DFA最小化
