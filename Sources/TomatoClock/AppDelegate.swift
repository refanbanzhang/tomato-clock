import AppKit
import UserNotifications

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, TimerControllerDelegate, UNUserNotificationCenterDelegate {
    private let store = StateStore()
    private let timerController = TimerController()
    private let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    private lazy var menu = NSMenu()
    private lazy var hotKeyController = HotKeyController {
        NotificationCenter.default.post(name: .tomatoClockStartShortcut, object: nil)
    }
    private var completedInCurrentStreak = 0
    private var notificationsEnabled = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        timerController.delegate = self
        NotificationCenter.default.addObserver(
            forName: .tomatoClockStartShortcut,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            MainActor.assumeIsolated {
                self?.startFocus()
            }
        }
        hotKeyController.registerDefaultShortcut()
        configureNotifications()

        configureStatusItem()
        rebuildMenu()
        updateStatusTitle()
    }

    func timerControllerDidUpdate(_ timerController: TimerController) {
        updateStatusTitle()
        rebuildMenu()
    }

    func timerControllerDidCompleteFocus(_ timerController: TimerController) {
        if let startDate = timerController.focusStartDate {
            store.addSession(
                startDate: startDate,
                endDate: Date(),
                plannedSeconds: TimerController.focusSeconds,
                completed: true
            )
        }

        completedInCurrentStreak += 1
        updateStatusTitle()
        showNotification(title: "番茄完成", body: "已计入本周进度。")
        promptForBreak()
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound]
    }

    private func configureStatusItem() {
        statusItem.button?.target = self
        statusItem.button?.action = #selector(openMenu)
        statusItem.menu = menu
    }

    @objc private func openMenu() {
        rebuildMenu()
        statusItem.button?.performClick(nil)
    }

    private func rebuildMenu() {
        menu.removeAllItems()

        let snapshot = store.snapshot()
        let title = NSMenuItem(title: "🍅 本周 \(progressBar(percent: snapshot.percent, width: 10)) · 今日 \(snapshot.todayCompleted)", action: nil, keyEquivalent: "")
        title.isEnabled = false
        menu.addItem(title)

        let summary = NSMenuItem(title: "剩余 \(max(0, snapshot.target - snapshot.completed)) 个 · \(modeDescription())", action: nil, keyEquivalent: "")
        summary.isEnabled = false
        menu.addItem(summary)

        menu.addItem(NSMenuItem.separator())

        switch timerController.mode {
        case .idle:
            menu.addItem(item("开始 25 分钟", #selector(startFocus), key: "p"))
        case .focusing:
            menu.addItem(disabled("剩余 \(format(timerController.remainingSeconds))"))
            menu.addItem(item("暂停", #selector(pauseFocus)))
            menu.addItem(item("提前结束（不计入）", #selector(finishEarly)))
            menu.addItem(item("放弃（不计入）", #selector(abandonFocus)))
        case .paused:
            menu.addItem(disabled("已暂停 · 剩余 \(format(timerController.remainingSeconds))"))
            menu.addItem(item("继续", #selector(resumeFocus)))
            menu.addItem(item("提前结束（不计入）", #selector(finishEarly)))
            menu.addItem(item("放弃（不计入）", #selector(abandonFocus)))
        case .resting:
            menu.addItem(disabled("休息中 · 剩余 \(format(timerController.remainingSeconds))"))
            menu.addItem(item("结束休息", #selector(stopBreak)))
        }

        menu.addItem(NSMenuItem.separator())
        menu.addItem(item("设置周目标...", #selector(setWeeklyTarget)))
        menu.addItem(statsModeMenu())
        menu.addItem(item("查看周报", #selector(showWeeklyReport)))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(item("退出", #selector(quit)))
    }

    private func statsModeMenu() -> NSMenuItem {
        let item = NSMenuItem(title: "统计模式", action: nil, keyEquivalent: "")
        let submenu = NSMenu()
        for mode in StatsMode.allCases {
            let child = NSMenuItem(title: mode.label, action: #selector(changeStatsMode(_:)), keyEquivalent: "")
            child.target = self
            child.representedObject = mode.rawValue
            child.state = store.state.statsMode == mode ? .on : .off
            submenu.addItem(child)
        }
        item.submenu = submenu
        return item
    }

    private func updateStatusTitle() {
        guard let button = statusItem.button else { return }

        switch timerController.mode {
        case .focusing, .paused, .resting:
            button.title = "🍅 \(format(timerController.remainingSeconds))"
        case .idle:
            let snapshot = store.snapshot()
            button.title = "🍅 \(progressBar(percent: snapshot.percent, width: 6))"
        }
    }

    private func modeDescription() -> String {
        switch timerController.mode {
        case .idle:
            store.state.statsMode.label
        case .focusing:
            "专注中"
        case .paused:
            "已暂停"
        case .resting:
            "休息中"
        }
    }

    private func promptForBreak() {
        let longBreak = completedInCurrentStreak % 4 == 0
        let seconds = longBreak ? TimerController.longBreakSeconds : TimerController.shortBreakSeconds
        let alert = NSAlert()
        alert.messageText = longBreak ? "建议休息 15 分钟" : "建议休息 5 分钟"
        alert.informativeText = "是否现在开始休息？"
        alert.addButton(withTitle: "开始休息")
        alert.addButton(withTitle: "稍后")

        if alert.runModal() == .alertFirstButtonReturn {
            timerController.startBreak(seconds: seconds)
        }
    }

    private func showNotification(title: String, body: String) {
        guard notificationsEnabled else {
            NSSound.beep()
            return
        }

        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }

    private func configureNotifications() {
        guard Bundle.main.bundleURL.pathExtension == "app" else {
            notificationsEnabled = false
            return
        }

        notificationsEnabled = true
        UNUserNotificationCenter.current().delegate = self
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    private func item(_ title: String, _ action: Selector, key: String = "") -> NSMenuItem {
        let menuItem = NSMenuItem(title: title, action: action, keyEquivalent: key)
        menuItem.target = self
        if key == "p" {
            menuItem.keyEquivalentModifierMask = [.command, .option]
        }
        return menuItem
    }

    private func disabled(_ title: String) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: nil, keyEquivalent: "")
        item.isEnabled = false
        return item
    }

    private func format(_ seconds: Int) -> String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }

    private func progressBar(percent: Int, width: Int) -> String {
        let clampedPercent = max(0, min(100, percent))
        let filled = Int((Double(clampedPercent) / 100.0 * Double(width)).rounded())
        return String(repeating: "▰", count: filled) + String(repeating: "▱", count: width - filled)
    }

    @objc private func startFocus() {
        guard timerController.mode == .idle else { return }
        timerController.startFocus()
    }

    @objc private func pauseFocus() {
        timerController.pause()
    }

    @objc private func resumeFocus() {
        timerController.resume()
    }

    @objc private func abandonFocus() {
        if let startDate = timerController.abandon() {
            store.addSession(startDate: startDate, endDate: Date(), plannedSeconds: TimerController.focusSeconds, completed: false)
        }
    }

    @objc private func finishEarly() {
        if let startDate = timerController.finishEarly() {
            store.addSession(startDate: startDate, endDate: Date(), plannedSeconds: TimerController.focusSeconds, completed: false)
        }
    }

    @objc private func stopBreak() {
        timerController.stopBreak()
    }

    @objc private func setWeeklyTarget() {
        let alert = NSAlert()
        alert.messageText = "设置本周目标"
        alert.informativeText = "完整完成 25 分钟才会计入进度。"
        alert.addButton(withTitle: "保存")
        alert.addButton(withTitle: "取消")

        let input = NSTextField(frame: NSRect(x: 0, y: 0, width: 220, height: 24))
        input.stringValue = "\(store.state.weeklyTarget)"
        input.placeholderString = "例如 40"
        alert.accessoryView = input

        if alert.runModal() == .alertFirstButtonReturn,
           let value = Int(input.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)) {
            store.setWeeklyTarget(value)
            updateStatusTitle()
            rebuildMenu()
        }
    }

    @objc private func changeStatsMode(_ sender: NSMenuItem) {
        guard let rawValue = sender.representedObject as? String,
              let mode = StatsMode(rawValue: rawValue) else {
            return
        }
        store.setStatsMode(mode)
        updateStatusTitle()
        rebuildMenu()
    }

    @objc private func showWeeklyReport() {
        let snapshot = store.snapshot()
        let chart = snapshot.dailyCounts.map { day, count in
            "\(weekday(day)): \(String(repeating: "▮", count: min(count, 12))) \(count)"
        }.joined(separator: "\n")

        let alert = NSAlert()
        alert.messageText = "本周进度 \(progressBar(percent: snapshot.percent, width: 12))"
        alert.informativeText = """
        完成率：\(snapshot.percent)%
        今日完成：\(snapshot.todayCompleted)
        上周同期：\(snapshot.lastWeekCompleted)
        剩余天数：\(snapshot.remainingDays)

        \(chart)
        """
        alert.addButton(withTitle: "好")
        alert.runModal()
    }

    private func weekday(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "E"
        return formatter.string(from: date)
    }

    @objc private func quit() {
        NSApp.terminate(nil)
    }
}

private extension Notification.Name {
    static let tomatoClockStartShortcut = Notification.Name("tomatoClockStartShortcut")
}
