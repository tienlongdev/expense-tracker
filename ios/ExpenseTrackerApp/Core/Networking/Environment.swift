import Foundation

enum AppEnvironment {

    // ─────────────────────────────────────────────────────────────────────────
    // MARK: Device LAN IP
    // Update this whenever your Mac's Wi-Fi address changes.
    // Run `ipconfig getifaddr en0` in Terminal to get the current value.
    // ─────────────────────────────────────────────────────────────────────────
    private static let deviceLANBaseURL = "http://172.16.2.194:5050"

    // ─────────────────────────────────────────────────────────────────────────
    // MARK: Configured URL (Info.plist override, highest priority)
    // ─────────────────────────────────────────────────────────────────────────

    /// Override by setting the `API_BASE_URL` key in your target's Info.plist
    /// (e.g. via a .xcconfig file for different schemes).
    static var configuredBaseURL: URL? {
        if let str = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
           !str.isEmpty,
           let url = URL(string: str) {
            return url
        }

        // On physical device, fall back to the hardcoded LAN address
        // so the app works without any Info.plist configuration.
        #if !targetEnvironment(simulator)
        if let url = URL(string: deviceLANBaseURL) {
            return url
        }
        #endif

        return nil
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARK: Simulator candidates (auto-discovery)
    // ─────────────────────────────────────────────────────────────────────────

    /// Prefer the host ports already used by this repo:
    /// - Docker Compose backend: 5050
    /// - dotnet run profiles: 5000 / 5135
    static var baseURLCandidates: [URL] {
        if let configuredBaseURL {
            return [configuredBaseURL]
        }

        let candidates = [
            "http://localhost:5050",
            "http://127.0.0.1:5050",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:5135",
            "http://127.0.0.1:5135",
            "http://localhost:6000",
            "http://127.0.0.1:6000"
        ]

        return candidates.compactMap(URL.init(string:))
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MARK: Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// Physical devices cannot reach localhost — but with the LAN fallback
    /// above this guard is only hit if `deviceLANBaseURL` itself is broken.
    static var requiresExplicitDeviceBaseURL: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        // We always provide a LAN URL for physical devices, so no blocking.
        return false
        #endif
    }

    static var deviceBaseURLHelp: String {
        "Cannot connect to the backend. Update `deviceLANBaseURL` in Environment.swift to your Mac's LAN IP (run `ipconfig getifaddr en0`)."
    }

    static func isLoopbackHost(_ url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        return host == "localhost" || host == "127.0.0.1"
    }
}
