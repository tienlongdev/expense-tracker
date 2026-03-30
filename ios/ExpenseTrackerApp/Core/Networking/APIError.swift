import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case requestFailed(statusCode: Int, message: String)
    case decodingFailed(Error)
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid request URL."
        case .requestFailed(let code, let message):
            return "Server error (\(code)): \(message)"
        case .decodingFailed(let error):
            return "Failed to parse server response: \(error.localizedDescription)"
        case .unknown(let error):
            return error.localizedDescription
        }
    }
}
