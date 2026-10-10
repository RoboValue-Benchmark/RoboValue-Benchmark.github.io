# 2026-10-11 07:36 网站整体改版

版本标记：`v2026.10.11-0736-xjy-website-refresh`

标记时间：2026-10-11 07:36，时区 Asia/Shanghai。

本版汇总论文信息区灵动岛、背景墙、Home、Leaderboard、Eval、Community、格式调整和夜间模式的整批改动。本次补充提交更新版本说明与标记，页面代码及当前本机 Document 保持不变。

此前的 `v2026.10.11-xjy-benchmark-eval-dark-mode` 标记，以及非灵动岛版 `v2026.10.11-xjy-pre-island-home`、柔和紫蓝灵动岛版 `v2026.10.11-xjy-soft-island-home`，均保留在历史中。

## 页面与内容

- **论文信息区与背景墙**：采用半透明紫蓝渐变灵动岛面板，调整面板颜色、透明度与按钮之间的区分。更新仿真、真机交错的执行帧背景，两个 Standard 行组使用不同任务集合。资源按钮去掉额外的 GitHub / arXiv 小字，Report 改用文档图标，并调整图标与文字间距和对齐。
- **Home 内容编排**：依据论文调整 Overview，并按 Dataset → Benchmark → Leaderboard 组织内容。Benchmark 依据论文第 4.3 节和 Table 1，介绍 Task-State Understanding、Temporal Progress Monitoring、Failure and Recovery Reasoning、Value Consistency 及对应测试。同步首页榜单和社区区域，调整 Citation 标题及页脚。
- **Leaderboard**：Overall Ranking 独立成表，Standard、Cross-Embodiment 和 Cross-Environment 结果放在下方。上下区域的档位选择互不联动；增加 Full-Shot 空档位；SIA 合并到 Understanding 的详细结果中，不计入 Overall。保留 Best / Second Best 与 TOPReward 脚注；排序和 CSV 导出继续可用。
- **Community**：去掉文档侧栏，公开展示 WeChat 和 Discord 入口；同步 Home 的社区区域与箭头样式。
- **Eval**：保留 Team Name、Organization、Model Name、Email 四项必填信息，不设置 Evaluation Type。Phone、WeChat、Discord 至少填写一项，允许同时填写多项，切换时保留输入；默认显示 WeChat，电话框提示国家区号。必填星号为红色，前后端均校验输入。微信群与 Discord 在提交前公开展示，保存成功后显示 Application Submitted，并提供 Get Started 链接。
- **格式调整**：相关页面的小蓝字标题两侧采用短横线，统一链接大小写、箭头及样式，调整字号、标题居中、导航和视频框阴影，以及资源按钮图标与文字对齐。
- **夜间模式**：Home 的 News、Citation、视频占位框及榜单使用深色样式，保留榜单边框和圆角。Overview 保留原图颜色和白底，并裁切为圆角。Home 与 Leaderboard 的模型图标增加仅在深色模式显示的白色衬底，保持原资源、颜色和尺寸。
- **Document**：以当前本机 8877 使用的文档为准，该版本已与 GitHub 同步。本次补充提交不修改文档内容、目录或页面代码。

## 背景墙

背景帧清单位于 `src/data/hero-scenes.json`，图片位于 `public/assets/hero-wall/`，共 398 张 WebP。八种行按以下顺序循环：

| 顺序 | 数据域 | 条件 | 任务数 | 帧数 |
| --- | --- | --- | ---: | ---: |
| 1 | Simulation | Standard A | 8 | 32 |
| 2 | Real World | Standard A | 10 | 34 |
| 3 | Simulation | Cross-Embodiment | 15 | 59 |
| 4 | Real World | Cross-Embodiment | 20 | 74 |
| 5 | Simulation | Cross-Environment | 15 | 59 |
| 6 | Real World | Cross-Environment | 20 | 74 |
| 7 | Simulation | Standard B | 7 | 27 |
| 8 | Real World | Standard B | 10 | 39 |

每个数据域的 Standard A、B 使用不同任务集合。同一轨迹通常选取 3–4 帧，行内按执行阶段分组并错开任务起点，而非将同一视频的所有帧紧邻排列。较高屏幕会循环增加行并轮换起点；每行使用完整帧池，超宽屏按需扩展，动画复制内容以连续滚动。

## 申请接收与部署边界

`server/evaluation-applications.mjs` 提供本机接收服务，默认监听 `127.0.0.1:8878`。本地 Vite 通过 `/api/evaluation-applications` 代理请求；每份申请保存为仓库外 `../robovalue-eval-submissions/submissions/` 中的独立 JSON。申请目录、日志和真实联系方式不随本次提交发布。

运行方式、环境变量和测试命令见仓库 [README](../../README.md)。本台服务器的私有目录中另有操作说明。

**GitHub Pages 仅部署静态前端，公开网站的申请接收接口尚未配置。** 当前成功保存流程在本机可用；正式接收外部申请还需配置 HTTPS 接口或网关及允许的来源。当前页面不会在接口保存失败时显示提交成功，也不会自动联系申请人。

Report、Dataset、Overview Video、News、Citation 仍保留当前占位状态；Full-Shot 暂无成绩。微信群二维码需按实际有效期更新。

## 已有验证记录

以下检查在本轮页面开发与同步过程中已完成；这次补充提交只修改版本说明，未重新运行整套页面测试。

- 网站生产构建及 Git 差异格式检查。
- 本机申请服务 12 项测试，使用隔离临时目录，覆盖必填校验、多种联系方式、保存权限、失败处理与并发保存。
- 浏览器检查 Home 亮暗切换、内容框、榜单圆角与边框、Overview 裁切、三个档位，以及 1440 / 820 / 390 / 320px 页面宽度。
- 浏览器检查 Leaderboard Zero-Shot / One-Shot 和模型图标加载，保持桌面 28px、手机 25px 图标尺寸。
- 检查背景帧引用完整，两个数据域的 Standard A、B 任务集合均无重叠。
