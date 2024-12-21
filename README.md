# ColorCard

A cross-platform mobile application built with Ionic React and Capacitor.

## Features

- Cross-platform (iOS, Android, Web)
- Built with React and Ionic
- Native functionality through Capacitor

## Prerequisites

- Node.js and npm
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS development)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd ColorCard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Building for Native Platforms

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
```

### Android
```bash
npm run build
npx cap sync android
npx cap open android
```

## Development

The application is built using:
- React for the UI framework
- Ionic for mobile UI components
- Capacitor for native functionality

## License

MIT
