import Foundation

enum AppEnvironment {
    /// Override by setting the `API_BASE_URL` key in your target's Info.plist
    /// (e.g. via a .xcconfig file for different schemes).
    /// Default: http://localhost:6000  (Docker compose default port)
    static var baseURL: URL {
        if let str = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           !str.isEmpty,
           let url = URL(string: str) {
            return url
        }
        return URL(string: "http://localhost:6000")!
    }
}
