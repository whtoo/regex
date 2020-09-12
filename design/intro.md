# 从零开始实现正则表达式引擎0x00

* 系列长度： 7个章节
* Tags：`Automata`,`Regex`
* 实现语言：`Javascript`,`C++`,`Python3`

## 理论准备

### 自动机🤔️

#### NFA And DFA

#### 从正则表达式开始

#### Regex to NFA

#### NFA to DFA

#### 最小化DFA

## 实现技术预热

### 如何表示State

### 如何表示Transition

### 如何唯一确定对象标示

### closure---闭包算法

#### 消除ℇ转换

#### 深度优先搜索

#### 广度优先搜索

#### 不动点算法

## 渐进式

### 为什么采取渐进式？

1. 渐进式有利于简化假设，从而降低实现难度
2. 从一个简易原型开始，一步步抽丝剥茧式的叠加更能体现探索的实质过程和乐趣。
3. 个人喜欢渐进式的学习方式和实现路径，有利于自己展开思路和读者一起体验这个过程。

## 起点

> 天下大事必做于细

### 字符串匹配

##

## 写作计划

```mermaid
gantt
    title 写作计划
    dateFormat YYYY-MM-DD
    section 自动机
    自动机基础 :a1,2020-09-07,7d
    字符串匹配 :done,2020-09-07,10h
    NFA and DFA :a3, 2020-09-08,1d
    Regex to DFA :done, 2020-09-07,5d
    Regex to NFA :done, 2020-09-07,1d
    Subset Construction :done,2020-09-07,2d
    Mininize DFA :active,2020-09-11,2d
    section 自动机理论总结
    字符串匹配与Regex :a8, 2020-09-12,4h
    Regex to NFA :a9,4h
    NFA to DFA :a10,2020-09-12,8h
    State的表示 :a11,2h
    对象唯一性   :a12,4h
    集合等价性   :a13,2h
    闭包算法     :a14,1h
    消除ℇ转换    :a15,1h
  
```
