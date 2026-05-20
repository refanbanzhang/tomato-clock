import Foundation

@MainActor
public protocol TimerControllerDelegate: AnyObject {
    func timerControllerDidUpdate(_ timerController: TimerController)
    func timerControllerDidCompleteFocus(_ timerController: TimerController)
}

@MainActor
public final class TimerController {
    public enum Mode: Equatable {
        case idle
        case focusing
        case paused
        case resting(seconds: Int)
    }

    public static let focusSeconds = 25 * 60
    public static let shortBreakSeconds = 5 * 60
    public static let longBreakSeconds = 15 * 60

    public weak var delegate: TimerControllerDelegate?

    public private(set) var mode: Mode = .idle
    public private(set) var remainingSeconds = TimerController.focusSeconds
    public private(set) var focusStartDate: Date?
    private var timer: Timer?

    public init() {}

    public var isRunning: Bool {
        mode == .focusing || isResting
    }

    public var isResting: Bool {
        if case .resting = mode { return true }
        return false
    }

    public func startFocus() {
        timer?.invalidate()
        focusStartDate = Date()
        remainingSeconds = Self.focusSeconds
        mode = .focusing
        startTicker()
        delegate?.timerControllerDidUpdate(self)
    }

    public func pause() {
        guard mode == .focusing else { return }
        timer?.invalidate()
        timer = nil
        mode = .paused
        delegate?.timerControllerDidUpdate(self)
    }

    public func resume() {
        guard mode == .paused else { return }
        mode = .focusing
        startTicker()
        delegate?.timerControllerDidUpdate(self)
    }

    public func abandon() -> Date? {
        let startDate = focusStartDate
        reset()
        return startDate
    }

    public func finishEarly() -> Date? {
        let startDate = focusStartDate
        reset()
        return startDate
    }

    public func startBreak(seconds: Int) {
        timer?.invalidate()
        focusStartDate = nil
        remainingSeconds = seconds
        mode = .resting(seconds: seconds)
        startTicker()
        delegate?.timerControllerDidUpdate(self)
    }

    public func stopBreak() {
        reset()
    }

    public func reset() {
        timer?.invalidate()
        timer = nil
        focusStartDate = nil
        remainingSeconds = Self.focusSeconds
        mode = .idle
        delegate?.timerControllerDidUpdate(self)
    }

    private func startTicker() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
        RunLoop.main.add(timer!, forMode: .common)
    }

    private func tick() {
        remainingSeconds = max(0, remainingSeconds - 1)
        if remainingSeconds == 0 {
            timer?.invalidate()
            timer = nil

            switch mode {
            case .focusing:
                mode = .idle
                delegate?.timerControllerDidCompleteFocus(self)
            case .resting:
                mode = .idle
            case .idle, .paused:
                break
            }
        }

        delegate?.timerControllerDidUpdate(self)
    }
}
