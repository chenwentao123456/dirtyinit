# DirtyInit

> 面向 HUAWEI Kirin 990 / HarmonyOS 4.2 的页缓存（page cache）提权与硬件调优工具。
> 当前版本 **v2.00**：全新三页控制台（实时遥测 / 内置终端 / 本地 API 桥）。

站点：https://chenwentao123456.github.io/dirtyinit/  
镜像：http://121.41.93.16/dirtyinit/  
Releases：https://github.com/chenwentao123456/dirtyinit/releases/latest  
作者：OxfordP（[@chenwentao123456](https://github.com/chenwentao123456)）

本仓库同时托管 DirtyInit 的**产品官网**（下载页 + 说明），源码就是一个纯静态站点：
`index.html` / `styles.css` / `app.js`，无构建步骤，直接把仓库根目录作为 GitHub Pages 源即可。

## 它做什么

DirtyInit 不走刷机、不解锁 BL、不刷 boot —— 它通过 `IpSecManager` 相关接口在目标
`libbase.so` 上完成一次可控的页缓存改写，把本该只读的代码页偷换成一次性的跳转，
从而在 `init` 上下文中获得一次代码执行的机会。

执行成功后，APK 会把一个 `dirtyinit` ELF 投放到 `/data/local/tmp/`，再借由 relay
payload 打开一条 `init` 域的 shell 通道；你在 Termux 里拿到的 `uid=0` 会话，安全上下文是
`u:r:init:s0` —— 比普通 root 更"靠前"的一层。

因为整个过程只在内存与页缓存里发生，**不写 /system、不修改分区、不解锁 BL、不刷 boot**，
设备重启后即完全还原。

## v2.00 有什么新的

- **FlClash 风格的三页控制台**：底部液体玻璃导航栏，左右切页，替换 v1.00 的单页面板。
- **Dashboard**：PAYLOAD 流水线（idle → deploying → active / error + 百分比）+ 六项实时遥测
  （CPU 频率与 P0 区间、内存与 zram、存储、网络速率与累计、电池温度、最热 thermal zone）。
- **Quick Actions**：Activate payload / Enable ADB 5555 / Disable·Enable thermal / Lock CPU to max，
  每个按钮对应一个 payload bin（`payload_chan` / `payload_adb` / `payload_thon` / `payload_thoff` / `payload_cpu_tpl`）。
- **Terminal**：内置终端，可切 `init shell` / `adb shell`，命令走 init shell 通道；未部署时显示 `OFFLINE`。
- **Settings**：Keep screen awake / Auto deploy payload / 液体玻璃 / Legacy exploit screen；
  终端字体与回滚；ADB 自动开启与端口；API BRIDGE。
- **本地 API 桥**：只监听 `127.0.0.1`，Bearer Token 校验，
  `GET /ping`、`GET /status`、`POST /exec`、`POST /deploy` —— 方便脚本 / Agent 驱动。
- 包内 `versionName` 2.00 / `versionCode` 200，签名与 v1.00 相同，可直接覆盖安装。

## 下载

| 文件 | 说明 | 大小 | SHA-256 |
|---|---|---|---|
| [dirtyinit_v2.0.apk](downloads/dirtyinit_v2.0.apk) | **推荐**：v2.00 三页控制台（遥测 / 终端 / API 桥） | 431,455 B | `bdff7b14b3a34d9e51595b4d7c54c04a8328c46e4615a975cc32e705d6f6cc79` |
| [dirtyinit_tools3.apk](downloads/dirtyinit_tools3.apk) | 经典版：tools3 单页面板（提权 + ADB 5555 + CPU/温控） | 255,116 B | `4d7d2c22dac38aecaeb864374be9fbfa1e420c3365043ccc927403e0dd087808` |
| [dirtyinit_adb5555_combined.apk](downloads/dirtyinit_adb5555_combined.apk) | 二合一版（ADB 5555 + relay payload） | 250,674 B | `eeb24586a7cb0443f6d33c6436c2c5c7e6b25d4254b8000eb8906e919f326f83` |
| [dirtyinit.apk](downloads/dirtyinit.apk) | 原版（EXECUTE EXPLOIT + EXTRACT CLI） | 279,468 B | `2a7515a60f4e63004469f4d2d6ff93b900b660c547eaeeb0369e88d5bb7d0607` |
| [dirtyinit-hw.sh](downloads/dirtyinit-hw.sh) | Kirin 990 调优脚本（14 个 action） | 14,758 B | `750bde6bba8858f1ad48353ed0bd6982136eb1ba041258bdd61ebccf32cf020e` |
| [dirtyinit_v2_usage.txt](downloads/dirtyinit_v2_usage.txt) | v2.00 使用说明（界面 / Quick Actions / API 示例） | 4,045 B | 见站点 |
| [dirtyinit_adb5555_combined_README.txt](downloads/dirtyinit_adb5555_combined_README.txt) | 二合一版原始说明 | 2,125 B | `1d47436847a78557428ac746456c1b80e9044726ec0d1a0dee7c27c48b7ff00c` |

## Releases

所有可下载文件同时以 GitHub Releases 形式发布：

- [**v2.00**](https://github.com/chenwentao123456/dirtyinit/releases/tag/v2.00) — 新：`dirtyinit_v2.0.apk`、`dirtyinit_v2_usage.txt`、`dirtyinit-hw.sh`
- [v1.00](https://github.com/chenwentao123456/dirtyinit/releases/tag/v1.00) — tools3 / 二合一 / 原版 APK、hw.sh、说明

## 快速开始（v2.00）

1. 设备已解锁（debug 签名，安装前先卸载同名旧版）。
2. `adb install -r dirtyinit_v2.0.apk`
3. 打开 App → Dashboard 点 **Activate payload**，等 PAYLOAD 变成绿色 `ACTIVE`。
4. 到 **Terminal** 执行 `id`，应看到 `uid=0(root) context=u:r:init:s0`。
5. 需要电脑侧 ADB 时点 **Enable ADB 5555**，再 `adb connect <手机IP>:5555`。

无界面触发：

```bash
adb shell am start -n com.dirty.init/.MainActivity
# 兼容旧入口：com.dirty.init/.DirtyInitActivity --ez autorun true
```

本地 API 桥（Settings → API BRIDGE 打开并复制 Token）：

```bash
curl -s -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:8080/status
curl -s -X POST -H "Authorization: Bearer <TOKEN>" -d '{"cmd":"id"}' http://127.0.0.1:8080/exec
```

## 已验证环境

| 项目 | 值 |
|---|---|
| 机型 | HONOR V30 PRO (OXF-AN10) |
| 系统 | HarmonyOS 4.2.0 / Android 12 |
| 内核 | 5.10.43 |
| SoC | Kirin 990 5G（2×A76@2.86G + 2×A76@2.36G + 4×A55@1.954G） |

## 调优脚本

`dirtyinit-hw.sh` 需要 init shell 权限运行，14 个 action：

```
status / selinux / thermal_status / thermal_stop / thermal_restore
mem_status / mem_opt / mem_restore / touch_status / touch_tune / touch_restore
cpu_status / cpu_max / cpu_turbo / cpu_gov / cpu_restore / beast / restore
```

所有运行时修改都可用 `restore` 一键还原。脚本本身不含任何提权 / 漏洞利用代码。

## 注意事项

- **同一次开机只允许干净部署一种 payload**，混用可能读到被改过的 `libbase.so` 字节，导致 kernel panic；要换模式请先重启。
- 重启后 5555 不会保留，需要重新开启。
- KernelSU 在本机不可行：内核 `CONFIG_MODULE_SIG_FORCE=y` + 华为签名私钥 + `MODVERSIONS=y`，BL 锁定且 verity 开启。
- debug 签名与官方签名冲突，安装前需卸载原版。
- 本地 API 桥默认关闭，开启后仅回环 + Token；不用时关掉。

## 作者

| 项目 | 值 |
|---|---|
| 作者 | OxfordP |
| GitHub | [@chenwentao123456](https://github.com/chenwentao123456) |
| 项目 | DirtyInit v2.00 |
| 平台 | Kirin 990 / HarmonyOS 4.2 |
| 许可 | 仅供研究测试 |

站点维护、工程仓库、APK 打包都在这里；机型兼容问题欢迎开 issue。

## 免责声明

本项目仅用于**自有设备**的安全研究与系统调优。请勿用于任何未授权设备；因使用造成的设备损坏、数据丢失或法律风险由使用者自行承担。

## 部署

### GitHub Pages

仓库根目录即站点，`.nojekyll` 已包含。Settings → Pages → Source 选 `Deploy from a branch`，Branch 选 `main` + `/ (root)`。

### nginx（自有服务器）

```nginx
location = /dirtyinit { return 301 /dirtyinit/; }
location /dirtyinit/ {
    root /var/www;
    index index.html;
    charset utf-8;
    try_files $uri $uri/ =404;
}
```
