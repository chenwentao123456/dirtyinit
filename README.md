# DirtyInit

> 面向 HUAWEI Kirin 990 / HarmonyOS 4.2 的页缓存（page cache）提权与硬件调优工具。

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

## 下载

| 文件 | 说明 | 大小 | SHA-256 |
|---|---|---|---|
| [dirtyinit_tools3.apk](downloads/dirtyinit_tools3.apk) | 推荐：tools3 版（提权 + ADB 5555 + CPU/温控面板） | 255,116 B | `4d7d2c22dac38aecaeb864374be9fbfa1e420c3365043ccc927403e0dd087808` |
| [dirtyinit_adb5555_combined.apk](downloads/dirtyinit_adb5555_combined.apk) | 二合一版（ADB 5555 + relay payload） | 250,674 B | `eeb24586a7cb0443f6d33c6436c2c5c7e6b25d4254b8000eb8906e919f326f83` |
| [dirtyinit.apk](downloads/dirtyinit.apk) | 原版（EXECUTE EXPLOIT + EXTRACT CLI） | 279,468 B | `2a7515a60f4e63004469f4d2d6ff93b900b660c547eaeeb0369e88d5bb7d0607` |
| [dirtyinit-hw.sh](downloads/dirtyinit-hw.sh) | Kirin 990 调优脚本（14 个 action） | 14,758 B | `750bde6bba8858f1ad48353ed0bd6982136eb1ba041258bdd61ebccf32cf020e` |
| [dirtyinit_adb5555_combined_README.txt](downloads/dirtyinit_adb5555_combined_README.txt) | 二合一版原始说明 | 2,125 B | `1d47436847a78557428ac746456c1b80e9044726ec0d1a0dee7c27c48b7ff00c` |
| [使用说明.txt](downloads/使用说明.txt) | 站点整理版使用说明 | 3,989 B | `f1a1a4c29b400de53de76ed9d5fe7e18559347e225e6fa6750c22de8b8fa3141` |

## Releases

所有可下载文件同时以 GitHub Releases 形式发布：[**v1.00**](https://github.com/chenwentao123456/dirtyinit/releases/tag/v1.00)

Releases 资产名：`dirtyinit_tools3.apk`、`dirtyinit_adb5555_combined.apk`、`dirtyinit.apk`、
`dirtyinit-hw.sh`、`dirtyinit_adb5555_combined_README.txt`、`dirtyinit_usage.txt`（使用说明整理版）。

## 快速开始

1. 设备已解锁（debug 签名，安装前先卸载同名旧版）。
2. `adb install -r dirtyinit_tools3.apk`
3. 打开 App，点 **ONE-TOUCH EXPLOIT**（或 **ENABLE ADB 5555** 二合一）。
4. 通过 `adb connect <手机IP>:5555` / Termux 进入，执行 `su -c id` 或用 relay 拿到的 init shell。

无界面触发：

```bash
adb shell am start -n com.dirty.init/.DirtyInitActivity --ez autorun true
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

## 作者

| 项目 | 值 |
|---|---|
| 作者 | OxfordP |
| GitHub | [@chenwentao123456](https://github.com/chenwentao123456) |
| 项目 | DirtyInit v1.00 |
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
