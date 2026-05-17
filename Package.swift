// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "TomatoClock",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "TomatoClock", targets: ["TomatoClock"])
    ],
    targets: [
        .executableTarget(
            name: "TomatoClock"
        )
    ]
)
