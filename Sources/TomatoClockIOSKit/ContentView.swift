import SwiftUI
import TomatoClockCore
import UserNotifications

#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

@MainActor
final class TomatoClockViewModel: ObservableObject, TimerControllerDelegate {
    @Published private(set) var remainingSeconds = TimerController.focusSeconds
    @Published private(set) var mode: TimerController.Mode = .idle
    @Published private(set) var snapshot: ProgressSnapshot
    @Published var weeklyTarget: Int
    @Published var statsMode: StatsMode
    @Published var pendingBreakSeconds: Int?

    private let store = StateStore()
    private let timerController = TimerController()
    private var completedInCurrentStreak = 0

    init() {
        snapshot = store.snapshot()
        weeklyTarget = store.state.weeklyTarget
        statsMode = store.state.statsMode
        remainingSeconds = timerController.remainingSeconds
        mode = timerController.mode
        timerController.delegate = self
        requestNotificationPermission()
        store.startSync { [weak self] in
            self?.refreshState()
        }
    }

    func startFocus() {
        guard mode == .idle else { return }
        timerController.startFocus()
    }

    func pauseFocus() {
        timerController.pause()
    }

    func resumeFocus() {
        timerController.resume()
    }

    func abandonFocus() {
        if let startDate = timerController.abandon() {
            store.addSession(
                startDate: startDate,
                endDate: Date(),
                plannedSeconds: TimerController.focusSeconds,
                completed: false
            )
        }
        refreshState()
    }

    func finishEarly() {
        if let startDate = timerController.finishEarly() {
            store.addSession(
                startDate: startDate,
                endDate: Date(),
                plannedSeconds: TimerController.focusSeconds,
                completed: false
            )
        }
        refreshState()
    }

    func startBreak(seconds: Int) {
        pendingBreakSeconds = nil
        timerController.startBreak(seconds: seconds)
    }

    func dismissBreakPrompt() {
        pendingBreakSeconds = nil
    }

    func stopBreak() {
        timerController.stopBreak()
    }

    func setWeeklyTarget(_ target: Int) {
        store.setWeeklyTarget(target)
        refreshState()
    }

    func setStatsMode(_ mode: StatsMode) {
        store.setStatsMode(mode)
        refreshState()
    }

    func timerControllerDidUpdate(_ timerController: TimerController) {
        remainingSeconds = timerController.remainingSeconds
        mode = timerController.mode
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
        refreshState()
        sendNotification(title: "番茄完成", body: "已计入本周进度。")
        pendingBreakSeconds = completedInCurrentStreak.isMultiple(of: 4)
            ? TimerController.longBreakSeconds
            : TimerController.shortBreakSeconds
    }

    func title(for mode: TimerController.Mode) -> String {
        switch mode {
        case .idle:
            "准备专注"
        case .focusing:
            "专注中"
        case .paused:
            "已暂停"
        case .resting:
            "休息中"
        }
    }

    func format(_ seconds: Int) -> String {
        String(format: "%02d:%02d", seconds / 60, seconds % 60)
    }

    private func refreshState() {
        snapshot = store.snapshot()
        weeklyTarget = store.state.weeklyTarget
        statsMode = store.state.statsMode
    }

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    private func sendNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }
}

public struct ContentView: View {
    @StateObject private var viewModel = TomatoClockViewModel()

    public init() {}

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    timerPanel
                    progressPanel
                    settingsPanel
                    weeklyReportPanel
                }
                .padding(20)
                .frame(maxWidth: .infinity)
            }
            .background(.appGroupedBackground)
            .navigationTitle("TomatoClock")
        }
        .alert("建议休息", isPresented: breakPromptBinding) {
            if let seconds = viewModel.pendingBreakSeconds {
                Button("开始 \(viewModel.format(seconds))") {
                    viewModel.startBreak(seconds: seconds)
                }
            }
            Button("稍后", role: .cancel) {
                viewModel.dismissBreakPrompt()
            }
        } message: {
            Text("完整完成 25 分钟，已计入本周进度。")
        }
    }

    private var breakPromptBinding: Binding<Bool> {
        Binding(
            get: { viewModel.pendingBreakSeconds != nil },
            set: { isPresented in
                if !isPresented {
                    viewModel.dismissBreakPrompt()
                }
            }
        )
    }

    private var timerPanel: some View {
        VStack(spacing: 18) {
            Text(viewModel.title(for: viewModel.mode))
                .font(.headline)
                .foregroundStyle(.secondary)

            Text(viewModel.format(viewModel.remainingSeconds))
                .font(.system(size: 68, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .minimumScaleFactor(0.7)

            controls
        }
        .frame(maxWidth: .infinity)
        .padding(22)
        .background(.appSecondaryGroupedBackground)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    @ViewBuilder
    private var controls: some View {
        switch viewModel.mode {
        case .idle:
            Button {
                viewModel.startFocus()
            } label: {
                Label("开始 25 分钟", systemImage: "play.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

        case .focusing:
            HStack {
                Button {
                    viewModel.pauseFocus()
                } label: {
                    Label("暂停", systemImage: "pause.fill")
                        .frame(maxWidth: .infinity)
                }
                Button(role: .destructive) {
                    viewModel.abandonFocus()
                } label: {
                    Label("放弃", systemImage: "xmark")
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.bordered)
            .controlSize(.large)

        case .paused:
            VStack(spacing: 12) {
                Button {
                    viewModel.resumeFocus()
                } label: {
                    Label("继续", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                HStack {
                    Button {
                        viewModel.finishEarly()
                    } label: {
                        Label("提前结束", systemImage: "forward.end.fill")
                            .frame(maxWidth: .infinity)
                    }
                    Button(role: .destructive) {
                        viewModel.abandonFocus()
                    } label: {
                        Label("放弃", systemImage: "xmark")
                            .frame(maxWidth: .infinity)
                    }
                }
                .buttonStyle(.bordered)
            }
            .controlSize(.large)

        case .resting:
            Button {
                viewModel.stopBreak()
            } label: {
                Label("结束休息", systemImage: "stop.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
    }

    private var progressPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .firstTextBaseline) {
                Text("本周进度")
                    .font(.headline)
                Spacer()
                Text("\(viewModel.snapshot.percent)%")
                    .font(.title3.weight(.semibold))
                    .monospacedDigit()
            }

            ProgressView(value: Double(viewModel.snapshot.completed), total: Double(max(viewModel.snapshot.target, 1)))
                .tint(.red)

            HStack {
                stat("已完成", "\(viewModel.snapshot.completed)")
                stat("今日", "\(viewModel.snapshot.todayCompleted)")
                stat("目标", "\(viewModel.snapshot.target)")
            }
        }
        .padding(18)
        .background(.appSecondaryGroupedBackground)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var settingsPanel: some View {
        VStack(spacing: 16) {
            Stepper(value: targetBinding, in: 1...999) {
                HStack {
                    Text("周目标")
                    Spacer()
                    Text("\(viewModel.weeklyTarget)")
                        .foregroundStyle(.secondary)
                        .monospacedDigit()
                }
            }

            Picker("统计模式", selection: statsModeBinding) {
                ForEach(StatsMode.allCases, id: \.self) { mode in
                    Text(mode.label).tag(mode)
                }
            }
            .pickerStyle(.segmented)
        }
        .padding(18)
        .background(.appSecondaryGroupedBackground)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var weeklyReportPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("7 天记录")
                    .font(.headline)
                Spacer()
                Text("上周 \(viewModel.snapshot.lastWeekCompleted)")
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 10) {
                ForEach(viewModel.snapshot.dailyCounts, id: \.0) { date, count in
                    HStack(spacing: 12) {
                        Text(weekday(date))
                            .frame(width: 32, alignment: .leading)
                            .foregroundStyle(.secondary)
                        GeometryReader { proxy in
                            RoundedRectangle(cornerRadius: 4, style: .continuous)
                                .fill(.red.opacity(0.85))
                                .frame(width: barWidth(count: count, available: proxy.size.width))
                        }
                        .frame(height: 10)
                        Text("\(count)")
                            .frame(width: 28, alignment: .trailing)
                            .monospacedDigit()
                    }
                    .font(.subheadline)
                }
            }
        }
        .padding(18)
        .background(.appSecondaryGroupedBackground)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var targetBinding: Binding<Int> {
        Binding(
            get: { viewModel.weeklyTarget },
            set: { viewModel.setWeeklyTarget($0) }
        )
    }

    private var statsModeBinding: Binding<StatsMode> {
        Binding(
            get: { viewModel.statsMode },
            set: { viewModel.setStatsMode($0) }
        )
    }

    private func stat(_ title: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.title3.weight(.semibold))
                .monospacedDigit()
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func weekday(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "zh_Hans_CN")
        formatter.dateFormat = "E"
        return formatter.string(from: date)
    }

    private func barWidth(count: Int, available: CGFloat) -> CGFloat {
        let maxCount = max(viewModel.snapshot.dailyCounts.map(\.1).max() ?? 1, 1)
        guard count > 0 else { return 2 }
        return max(8, available * CGFloat(count) / CGFloat(maxCount))
    }
}

#Preview {
    ContentView()
}

private extension ShapeStyle where Self == Color {
    static var appGroupedBackground: Color {
        #if canImport(UIKit)
        Color(uiColor: .systemGroupedBackground)
        #else
        Color(nsColor: .windowBackgroundColor)
        #endif
    }

    static var appSecondaryGroupedBackground: Color {
        #if canImport(UIKit)
        Color(uiColor: .secondarySystemGroupedBackground)
        #else
        Color(nsColor: .controlBackgroundColor)
        #endif
    }
}
