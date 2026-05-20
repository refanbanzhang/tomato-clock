import Foundation

public enum StatsMode: String, Codable, CaseIterable, Sendable {
    case calendarWeek
    case rollingSevenDays

    public var label: String {
        switch self {
        case .calendarWeek:
            "每周一重置"
        case .rollingSevenDays:
            "滚动 7 天"
        }
    }
}

public struct PomodoroSession: Codable, Identifiable, Sendable {
    public let id: UUID
    public let startDate: Date
    public let endDate: Date
    public let plannedSeconds: Int
    public let completed: Bool
}

public struct TargetChange: Codable, Identifiable, Sendable {
    public let id: UUID
    public let date: Date
    public let oldValue: Int
    public let newValue: Int
}

public struct AppState: Codable, Sendable {
    public var weeklyTarget: Int
    public var statsMode: StatsMode
    public var sessions: [PomodoroSession]
    public var targetChanges: [TargetChange]

    public static let initial = AppState(
        weeklyTarget: 40,
        statsMode: .calendarWeek,
        sessions: [],
        targetChanges: []
    )
}

public struct ProgressSnapshot: Sendable {
    public let completed: Int
    public let target: Int
    public let todayCompleted: Int
    public let remainingDays: Int
    public let lastWeekCompleted: Int
    public let dailyCounts: [(Date, Int)]

    public var percent: Int {
        guard target > 0 else { return 0 }
        return min(100, Int((Double(completed) / Double(target) * 100).rounded()))
    }
}
