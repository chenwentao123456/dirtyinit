DirtyInit + 自动开启 ADB 5555（二合一版）
========================================

修改内容
--------
在原版 DirtyInit v1.00 (com.dirty.init) 基础上：
1. ENABLE ADB 5555 按钮 = 一键完成两件事（自动分两阶段，约 15~20 秒）：
   - 先注入 ADB 5555 payload：setprop service.adb.tcp.port 5555 + ctl.restart adbd
   - 再注入 relay payload：恢复原版 init shell / CLI relay 能力
   两阶段使用不同的 payload 文件，第二次部署用"直接返回"版本，避免破坏第一次部署。
2. EXECUTE EXPLOIT 按钮 = 原版 relay 功能（只注入 relay payload），行为同原版。
3. 无界面触发（脚本 / 锁屏自动执行）：
   adb shell am start -n com.dirty.init/.DirtyInitActivity --ez autorun true
   （同样执行二合一两阶段）

已验证
------
- 干净重启后执行该流程：同一次开机内
  * service.adb.tcp.port = 5555，[::]:5555 LISTEN
  * 电脑 db connect <手机IP>:5555 成功
  * /data/local/tmp/dirtyinit id 返回 uid=0(root) context=u:r:init:s0（relay 可用）
  * 设备无重启 / 无 kernel panic

注意事项
--------
1. 需要手机已解锁（安全锁屏状态下 Activity 会被延迟启动，am start 返回 -92）。
2. 每次开机后 5555 属性不保留，需要重新点一次 ENABLE ADB 5555（或 am start 方式）。
3. 页缓存只能干净部署：如果本次开机已经执行过 EXECUTE（relay），不要再点 ENABLE ADB 5555；
   反之亦然。想换/重跑请先重启，否则可能读到被改过的 libbase 字节导致内核 panic。
4. 修改版为 debug 签名，安装前需卸载原版 com.dirty.init（会丢原 App 数据，sdcard 文件不受影响）。
5. 测试设备：HONOR V30 PRO (OXF-AN10)，HarmonyOS 4.2.0 / Android 12 / kernel 5.10.43。
6. 仅供自有设备研究测试，请勿用于非授权设备。

关于 KernelSU
-------------
本机内核 CONFIG_MODULE_SIG_FORCE=y + 华为签名私钥 + MODVERSIONS=y，且 BL 锁定/verity，
无法加载未签名或第三方编译的 ko，因此无法通过 ko 方式启用 KernelSU；详情见对话说明。
