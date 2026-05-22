import Foundation

@MainActor
public final class StateStore {
    private let fileURL: URL
    private let supportURL: URL
    private let syncService: SupabaseSyncService?
    public private(set) var state: AppState
    private var localUpdatedAt: Date
    private var hasExistingLocalState: Bool
    private var uploadTask: Task<Void, Never>?
    private var refreshTask: Task<Void, Never>?
    private var isApplyingRemoteState = false
    private var onRemoteUpdate: (@MainActor () -> Void)?

    public init() {
        supportURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("TomatoClock", isDirectory: true)
        try? FileManager.default.createDirectory(at: supportURL, withIntermediateDirectories: true)
        fileURL = supportURL.appendingPathComponent("state.json")
        syncService = Self.loadSupabaseSyncService(supportURL: supportURL)

        if let data = try? Data(contentsOf: fileURL),
           let decoded = try? JSONDecoder().decode(AppState.self, from: data) {
            state = decoded
            localUpdatedAt = Self.fileModificationDate(fileURL) ?? .distantPast
            hasExistingLocalState = true
        } else {
            state = .initial
            localUpdatedAt = .distantPast
            hasExistingLocalState = false
            save(preservingUpdatedAt: localUpdatedAt, sync: false)
        }
    }

    deinit {
        uploadTask?.cancel()
        refreshTask?.cancel()
    }

    public func startSync(onRemoteUpdate: @MainActor @escaping () -> Void) {
        guard syncService != nil else { return }
        self.onRemoteUpdate = onRemoteUpdate
        refreshFromRemote(uploadIfMissing: true)
    }

    public func refreshFromRemote() {
        refreshFromRemote(uploadIfMissing: false)
    }

    public func setWeeklyTarget(_ target: Int) {
        let normalizedTarget = max(1, min(target, 999))
        guard normalizedTarget != state.weeklyTarget else { return }
        state.targetChanges.append(TargetChange(
            id: UUID(),
            date: Date(),
            oldValue: state.weeklyTarget,
            newValue: normalizedTarget
        ))
        state.weeklyTarget = normalizedTarget
        save()
    }

    public func setStatsMode(_ mode: StatsMode) {
        state.statsMode = mode
        save()
    }

    public func addSession(startDate: Date, endDate: Date, plannedSeconds: Int, completed: Bool) {
        state.sessions.append(PomodoroSession(
            id: UUID(),
            startDate: startDate,
            endDate: endDate,
            plannedSeconds: plannedSeconds,
            completed: completed
        ))
        save()
    }

    public func snapshot(now: Date = Date()) -> ProgressSnapshot {
        var calendar = Calendar.current
        calendar.firstWeekday = 2

        let currentRange = range(for: state.statsMode, now: now, calendar: calendar)
        let todayStart = calendar.startOfDay(for: now)
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: todayStart) ?? now

        let completedSessions = state.sessions.filter(\.completed)
        let completed = completedSessions.filter { currentRange.contains($0.startDate) }.count
        let todayCompleted = completedSessions.filter { $0.startDate >= todayStart && $0.startDate < tomorrow }.count

        let lastWeekStart = calendar.date(byAdding: .day, value: -7, to: currentRange.lowerBound) ?? currentRange.lowerBound
        let lastWeekEnd = currentRange.lowerBound
        let lastWeekCompleted = completedSessions.filter { $0.startDate >= lastWeekStart && $0.startDate < lastWeekEnd }.count

        let days = dailySeries(now: now, calendar: calendar, completedSessions: completedSessions)
        let remainingDays = remainingDaysInCurrentPeriod(now: now, calendar: calendar)

        return ProgressSnapshot(
            completed: completed,
            target: state.weeklyTarget,
            todayCompleted: todayCompleted,
            remainingDays: remainingDays,
            lastWeekCompleted: lastWeekCompleted,
            dailyCounts: days
        )
    }

    private func save(preservingUpdatedAt preservedUpdatedAt: Date? = nil, sync: Bool = true) {
        if let preservedUpdatedAt {
            localUpdatedAt = preservedUpdatedAt
        } else {
            localUpdatedAt = Date()
        }
        hasExistingLocalState = true

        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        guard let data = try? encoder.encode(state) else { return }
        try? data.write(to: fileURL, options: .atomic)

        guard sync, !isApplyingRemoteState else { return }
        scheduleUpload()
    }

    private func refreshFromRemote(uploadIfMissing: Bool) {
        guard let syncService, refreshTask == nil else { return }

        refreshTask = Task { [weak self] in
            defer {
                Task { @MainActor [weak self] in
                    self?.refreshTask = nil
                }
            }

            do {
                guard let remote = try await syncService.fetchState() else {
                    if uploadIfMissing {
                        await self?.uploadCurrentState()
                    }
                    return
                }

                await MainActor.run {
                    self?.applyRemoteStateIfNeeded(remote)
                }
            } catch {
                NSLog("TomatoClock Supabase sync failed: \(error.localizedDescription)")
            }
        }
    }

    private func scheduleUpload() {
        guard syncService != nil else { return }
        uploadTask?.cancel()
        let state = state
        let updatedAt = localUpdatedAt

        uploadTask = Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(500))
            guard !Task.isCancelled else { return }

            do {
                try await self?.syncService?.upload(state: state, updatedAt: updatedAt)
            } catch {
                NSLog("TomatoClock Supabase upload failed: \(error.localizedDescription)")
            }
        }
    }

    private func uploadCurrentState() async {
        guard let syncService else { return }
        if localUpdatedAt == .distantPast {
            localUpdatedAt = Date()
            save(preservingUpdatedAt: localUpdatedAt, sync: false)
        }
        do {
            try await syncService.upload(state: state, updatedAt: localUpdatedAt)
        } catch {
            NSLog("TomatoClock Supabase upload failed: \(error.localizedDescription)")
        }
    }

    private func applyRemoteStateIfNeeded(_ remote: RemoteAppState) {
        guard !hasExistingLocalState || remote.updatedAt > localUpdatedAt else { return }
        isApplyingRemoteState = true
        state = remote.state
        localUpdatedAt = remote.updatedAt
        hasExistingLocalState = true
        save(preservingUpdatedAt: remote.updatedAt, sync: false)
        isApplyingRemoteState = false
        onRemoteUpdate?()
    }

    private static func loadSupabaseSyncService(supportURL: URL) -> SupabaseSyncService? {
        if let urlString = ProcessInfo.processInfo.environment["TOMATO_CLOCK_SUPABASE_URL"],
           let url = URL(string: urlString),
           let anonKey = ProcessInfo.processInfo.environment["TOMATO_CLOCK_SUPABASE_ANON_KEY"] {
            let syncID = ProcessInfo.processInfo.environment["TOMATO_CLOCK_SYNC_ID"] ?? "default"
            return SupabaseSyncService(config: SupabaseConfig(url: url, anonKey: anonKey, syncID: syncID))
        }

        let configURL = supportURL.appendingPathComponent("supabase.json")
        if let data = try? Data(contentsOf: configURL),
           let config = try? JSONDecoder().decode(SupabaseConfig.self, from: data) {
            return SupabaseSyncService(config: config)
        }

        return SupabaseSyncService(config: .bundled)
    }

    private static func fileModificationDate(_ url: URL) -> Date? {
        guard let attributes = try? FileManager.default.attributesOfItem(atPath: url.path) else {
            return nil
        }
        return attributes[.modificationDate] as? Date
    }

    private func range(for mode: StatsMode, now: Date, calendar: Calendar) -> Range<Date> {
        switch mode {
        case .calendarWeek:
            let start = calendar.dateInterval(of: .weekOfYear, for: now)?.start ?? calendar.startOfDay(for: now)
            let end = calendar.date(byAdding: .day, value: 7, to: start) ?? now
            return start..<end
        case .rollingSevenDays:
            let today = calendar.startOfDay(for: now)
            let start = calendar.date(byAdding: .day, value: -6, to: today) ?? today
            let end = calendar.date(byAdding: .day, value: 1, to: today) ?? now
            return start..<end
        }
    }

    private func dailySeries(now: Date, calendar: Calendar, completedSessions: [PomodoroSession]) -> [(Date, Int)] {
        let today = calendar.startOfDay(for: now)
        return (0..<7).compactMap { offset in
            guard let day = calendar.date(byAdding: .day, value: offset - 6, to: today),
                  let nextDay = calendar.date(byAdding: .day, value: 1, to: day) else {
                return nil
            }
            let count = completedSessions.filter { $0.startDate >= day && $0.startDate < nextDay }.count
            return (day, count)
        }
    }

    private func remainingDaysInCurrentPeriod(now: Date, calendar: Calendar) -> Int {
        switch state.statsMode {
        case .calendarWeek:
            let weekday = calendar.component(.weekday, from: now)
            let mondayBasedWeekday = ((weekday + 5) % 7) + 1
            return max(0, 7 - mondayBasedWeekday)
        case .rollingSevenDays:
            return 0
        }
    }
}
