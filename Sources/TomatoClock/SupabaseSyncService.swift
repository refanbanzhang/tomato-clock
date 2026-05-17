import Foundation

struct SupabaseConfig: Codable, Sendable {
    let url: URL
    let anonKey: String
    let syncID: String

    enum CodingKeys: String, CodingKey {
        case url
        case anonKey
        case syncID = "syncId"
    }
}

struct RemoteAppState: Sendable {
    let state: AppState
    let updatedAt: Date
}

final class SupabaseSyncService: @unchecked Sendable {
    private struct RemoteRow: Decodable {
        let state: AppState
        let updatedAt: Date

        enum CodingKeys: String, CodingKey {
            case state
            case updatedAt = "updated_at"
        }

        init(from decoder: Decoder) throws {
            let container = try decoder.container(keyedBy: CodingKeys.self)
            state = try container.decode(AppState.self, forKey: .state)

            let value = try container.decode(String.self, forKey: .updatedAt)
            guard let date = Self.decodeDate(value) else {
                throw DecodingError.dataCorruptedError(
                    forKey: .updatedAt,
                    in: container,
                    debugDescription: "Invalid Supabase timestamp."
                )
            }
            updatedAt = date
        }

        private static func decodeDate(_ value: String) -> Date? {
            let formatterWithFractionalSeconds = ISO8601DateFormatter()
            formatterWithFractionalSeconds.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatterWithFractionalSeconds.date(from: value) {
                return date
            }

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime]
            return formatter.date(from: value)
        }
    }

    let config: SupabaseConfig
    private let session: URLSession

    init(config: SupabaseConfig, session: URLSession = .shared) {
        self.config = config
        self.session = session
    }

    func fetchState() async throws -> RemoteAppState? {
        var components = URLComponents(
            url: restURL(path: "tomato_clock_state"),
            resolvingAgainstBaseURL: false
        )
        components?.queryItems = [
            URLQueryItem(name: "id", value: "eq.\(config.syncID)"),
            URLQueryItem(name: "select", value: "state,updated_at"),
            URLQueryItem(name: "limit", value: "1")
        ]

        guard let url = components?.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        addCommonHeaders(to: &request)

        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data)

        let rows = try JSONDecoder().decode([RemoteRow].self, from: data)
        guard let row = rows.first else { return nil }
        return RemoteAppState(state: row.state, updatedAt: row.updatedAt)
    }

    func upload(state: AppState, updatedAt: Date) async throws {
        var request = URLRequest(url: restURL(path: "tomato_clock_state"))
        request.httpMethod = "POST"
        addCommonHeaders(to: &request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")

        let stateData = try JSONEncoder().encode(state)
        let stateObject = try JSONSerialization.jsonObject(with: stateData)
        let body: [String: Any] = [
            "id": config.syncID,
            "state": stateObject,
            "updated_at": Self.encodeDate(updatedAt)
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)
        try validate(response: response, data: data)
    }

    private func restURL(path: String) -> URL {
        config.url
            .appendingPathComponent("rest")
            .appendingPathComponent("v1")
            .appendingPathComponent(path)
    }

    private func addCommonHeaders(to request: inout URLRequest) {
        request.setValue(config.anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(config.anonKey)", forHTTPHeaderField: "Authorization")
    }

    private func validate(response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Supabase request failed."
            throw SupabaseSyncError.requestFailed(statusCode: httpResponse.statusCode, message: message)
        }
    }

    private static func encodeDate(_ date: Date) -> String {
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return dateFormatter.string(from: date)
    }
}

enum SupabaseSyncError: Error, LocalizedError {
    case requestFailed(statusCode: Int, message: String)

    var errorDescription: String? {
        switch self {
        case let .requestFailed(statusCode, message):
            "Supabase request failed with status \(statusCode): \(message)"
        }
    }
}
