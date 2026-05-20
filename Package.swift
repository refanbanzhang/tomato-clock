// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "TomatoClock",
    platforms: [
        .macOS(.v13),
        .iOS(.v16)
    ],
    products: [
        .executable(name: "TomatoClock", targets: ["TomatoClock"]),
        .executable(name: "TomatoClockIOS", targets: ["TomatoClockIOS"]),
        .library(name: "TomatoClockCore", targets: ["TomatoClockCore"]),
        .library(name: "TomatoClockIOSKit", targets: ["TomatoClockIOSKit"])
    ],
    targets: [
        .target(
            name: "TomatoClockCore"
        ),
        .target(
            name: "TomatoClockIOSKit",
            dependencies: ["TomatoClockCore"]
        ),
        .executableTarget(
            name: "TomatoClock",
            dependencies: ["TomatoClockCore"]
        ),
        .executableTarget(
            name: "TomatoClockIOS",
            dependencies: ["TomatoClockIOSKit"]
        )
    ]
)
