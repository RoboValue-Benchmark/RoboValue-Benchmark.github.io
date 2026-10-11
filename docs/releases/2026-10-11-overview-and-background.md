# 2026-10-11 17:18 Overview 图与任务图片背景墙

版本标记：`v2026.10.11-1718-xjy-overview-and-background`

版本登记时间：2026-10-11 17:18，时区 Asia/Shanghai。

本版主要更新 Home 的 Overview 图和论文信息区的任务图片背景墙，并合入此前暂缓推送的两项 Home 作者信息修改。

## Overview 图

- 使用提供的 `overview-10_11.pdf`，转换为 `public/assets/overview-10-11.svg`，完整尺寸为 2400×2295。
- Home 引用新版 SVG，保留现有圆角、图片宽度和放大、缩放、拖动查看功能。

## 任务图片背景墙

背景墙改用论文每个任务对应的 Standard、Cross-Embodiment、Cross-Environment 场景图，复用 `public/assets/tasks/` 中的 105 张 WebP：仿真 15 个任务×3 种条件，真机 20 个任务×3 种条件。来源分别为论文的 `RoboValue_Sim_Overleaf/figures/` 和 `RoboValue_Real_Overleaf4/figures/` 任务图。清单和裁切参数登记在 `src/data/hero-scenes.json`。

图片仅在背景墙的显示窗口中裁切，完整原图及下方任务图库继续使用原有资源。

| 数据域 | 原图尺寸 | 上裁 | 下裁 | 显示范围 |
| --- | --- | ---: | ---: | --- |
| Simulation | 640×480 | 10px | 70px | 640×400，8:5 |
| Real World | 1200×900 | 75px | 75px | 1200×750，8:5 |

真机的裁切去掉上下灰边；两类图片均保留完整宽度。八种行按以下顺序循环，每组真机在前、仿真在后：

| 顺序 | 数据域 | 条件 | 任务图数 |
| --- | --- | --- | ---: |
| 1 | Real World | Standard A | 13 |
| 2 | Simulation | Standard A | 10 |
| 3 | Real World | Cross-Embodiment | 20 |
| 4 | Simulation | Cross-Embodiment | 15 |
| 5 | Real World | Cross-Environment | 20 |
| 6 | Simulation | Cross-Environment | 15 |
| 7 | Real World | Standard B | 13 |
| 8 | Simulation | Standard B | 10 |

Standard A/B 中仿真共享 5 个任务，两组共覆盖 15 个任务；真机共享 6 个任务，两组共覆盖 20 个任务。各行使用固定的错开起点，延续原有滚动速度、暂停和减少动态效果支持。

临时裁剪对比页面已归档到仓库外，正式发布仅包含确定后的背景墙资源与代码。

## 作者信息

- Home 的 `Shu'ang Yu` 使用英文直撇号 `'`（U+0027），与指定 OpenReview 名字中的符号一致。
- Home 的 Chuankang Li 链接为 `https://github.com/lck1201`。

## 同步与回退登记

推送前发现 GitHub main 新增了 `liushb9` 的文档提交 [`a71ba16`](https://github.com/RoboValue-Benchmark/RoboValue-Benchmark.github.io/commit/a71ba1609cd15985bfb75bf641344490f4dfd567)，提交时间为 2026-10-11 16:25:54（Asia/Shanghai）。该提交更新文档内容、导航、指标说明和任务子任务文本。本地先以 fast-forward 方式接入该提交。

准备推送期间，远端又新增 `loongwz` 的 [`642e5ea`](https://github.com/RoboValue-Benchmark/RoboValue-Benchmark.github.io/commit/642e5ea06224a1ea4a3f76646ec8fdf15e0c2d63)，提交时间为 2026-10-11 17:20:09（Asia/Shanghai），补充 Chang Ge 的 `https://gechang27.github.io/` 和 Chuankang Li 的 `https://github.com/lck1201`。后者与本轮已指定的链接完全一致。首次原子推送因远端先前进而被拒绝，未发布本地提交或 tag；随后将尚未发布的本地提交 rebase 到 `642e5ea`，保留两项作者链接及本次 Home 修改。正式版本以 `642e5ea` 为父提交。

接入文档提交前后已核对：本次修改的五个 Home 代码及图片文件字节一致；远端任务目录只改变子任务说明，首页使用的任务标题、任务链接和图片路径保持一致。接入作者链接提交后，四个 Overview / 背景墙资源和代码文件仍字节一致；Home 相比推送前版本仅多出 Chang Ge 的主页链接。

背景实验前的检查点为 `v2026.10.11-1601-xjy-pre-background-wall`，指向 `de1374d`。保留该检查点供需要时回退；本轮采用当前的新背景方案。

## 验证

- 105 个任务图片路径均存在，行顺序、任务覆盖及 Standard A/B 共享数量正确。
- 桌面亮色、桌面夜间和手机浏览器核对背景实际裁切范围、8:5 比例和图片加载；下方任务图库保持原有 4:3。
- 新 Overview 图在上述页面尺寸和主题中加载完整，保留 12px 圆角，放大与缩放正常。
- 接入远端文档提交后检查 Home 与文档主要入口，完成生产构建及 Git 差异格式检查。
