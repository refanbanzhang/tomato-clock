import Foundation

enum StatsMode: String, Codable, CaseIterable, Sendable {
    case calendarWeek
    case rollingSevenDays

    var label: String {
        switch self {
        case .calendarWeek:
            "每周一重置"
        case .rollingSevenDays:
            "滚动 7 天"
        }
    }
}

struct PomodoroSession: Codable, Identifiable, Sendable {
    let id: UUID
    let startDate: Date
    let endDate: Date
    let plannedSeconds: Int
    let completed: Bool
}

struct TargetChange: Codable, Identifiable, Sendable {
    let id: UUID
    let date: Date
    let oldValue: Int
    let newValue: Int
}

struct AppState: Codable, Sendable {
    var weeklyTarget: Int
    var statsMode: StatsMode
    var sessions: [PomodoroSession]
    var targetChanges: [TargetChange]

    static let initial = AppState(
        weeklyTarget: 40,
        statsMode: .calendarWeek,
        sessions: [],
        targetChanges: []
    )
}

struct ProgressSnapshot: Sendable {
    let completed: Int
    let target: Int
    let todayCompleted: Int
    let remainingDays: Int
    let lastWeekCompleted: Int
    let dailyCounts: [(Date, Int)]

    var percent: Int {
        guard target > 0 else { return 0 }
        return min(100, Int((Double(completed) / Double(target) * 100).rounded()))
    }
}
