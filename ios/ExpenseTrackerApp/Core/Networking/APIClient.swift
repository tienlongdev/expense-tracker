import Foundation

final class APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        session = URLSession(configuration: config)
        baseURL = AppEnvironment.baseURL

        decoder = JSONDecoder()
        // Backend (ASP.NET Core) returns camelCase JSON — no keyDecodingStrategy needed
        // Dates are kept as String in models; no dateDecodingStrategy required

        encoder = JSONEncoder()
        // Backend expects camelCase — no keyEncodingStrategy needed
    }

    // MARK: - Public Interface

    func get<T: Decodable>(_ path: String, queryItems: [URLQueryItem] = []) async throws -> T {
        let request = try makeRequest(method: "GET", path: path, queryItems: queryItems)
        return try await perform(request)
    }

    func post<B: Encodable, R: Decodable>(_ path: String, body: B) async throws -> R {
        try await sendWithBody(method: "POST", path: path, body: body)
    }

    func put<B: Encodable, R: Decodable>(_ path: String, body: B) async throws -> R {
        try await sendWithBody(method: "PUT", path: path, body: body)
    }

    func patch(_ path: String) async throws {
        let request = try makeRequest(method: "PATCH", path: path)
        try await performNoContent(request)
    }

    func delete(_ path: String) async throws {
        let request = try makeRequest(method: "DELETE", path: path)
        try await performNoContent(request)
    }

    // MARK: - Private

    private func sendWithBody<B: Encodable, R: Decodable>(
        method: String,
        path: String,
        body: B
    ) async throws -> R {
        var request = try makeRequest(method: method, path: path)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)
        return try await perform(request)
    }

    private func makeRequest(
        method: String,
        path: String,
        queryItems: [URLQueryItem] = []
    ) throws -> URLRequest {
        guard var components = URLComponents(
            url: baseURL.appendingPathComponent(path),
            resolvingAgainstBaseURL: false
        ) else {
            throw APIError.invalidURL
        }
        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        return request
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        do {
            let (data, response) = try await session.data(for: request)
            try validateStatus(response, data: data)
            return try decoder.decode(T.self, from: data)
        } catch let e as APIError { throw e }
          catch let e as DecodingError { throw APIError.decodingFailed(e) }
          catch { throw APIError.unknown(error) }
    }

    private func performNoContent(_ request: URLRequest) async throws {
        do {
            let (data, response) = try await session.data(for: request)
            try validateStatus(response, data: data)
        } catch let e as APIError { throw e }
          catch { throw APIError.unknown(error) }
    }

    private func validateStatus(_ response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else {
            throw APIError.unknown(URLError(.badServerResponse))
        }
        guard (200...299).contains(http.statusCode) else {
            let message = extractErrorMessage(from: data) ?? "HTTP \(http.statusCode)"
            throw APIError.requestFailed(statusCode: http.statusCode, message: message)
        }
    }

    private func extractErrorMessage(from data: Data) -> String? {
        // Try to parse {"message": "..."} error response first
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let msg = json["message"] as? String {
            return msg
        }
        return String(data: data, encoding: .utf8)
    }
}
