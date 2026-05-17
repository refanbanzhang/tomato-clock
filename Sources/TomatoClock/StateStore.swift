import Foundation

final class StateStore {
    private let fileURL: URL
    private(set) var state: AppState

    init() {
        let supportURL = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("TomatoClock", isDirectory: true)
        try? FileManager.default.createDirectory(at: supportURL, withIntermediateDirectories: true)
        fileURL = supportURL.appendingPathComponent("state.json")

        if let data = try? Data(contentsOf: fileURL),
           let decoded = try? JSONDecoder().decode(AppState.self, from: data) {
            state = decoded
        } else {
            state = .initial
            save()
        }
    }

    func setWeeklyTarget(_ target: Int) {
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

    func setStatsMode(_ mode: StatsMode) {
        state.statsMode = mode
        save()
    }

    func addSession(startDate: Date, endDate: Date, plannedSeconds: Int, completed: Bool) {
        state.sessions.append(PomodoroSession(
            id: UUID(),
            startDate: startDate,
            endDate: endDate,
            plannedSeconds: plannedSeconds,
            completed: completed
        ))
        save()
    }

    func snapshot(now: Date = Date()) -> ProgressSnapshot {
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

    private func save() {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        guard let data = try? encoder.encode(state) else { return }
        try? data.write(to: fileURL, options: .atomic)
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
