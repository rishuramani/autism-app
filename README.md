# Speech Therapy Assistant

A web-based application for speech therapy assessment and exercises, specifically designed for children with autism.

## Features

- **Patient Intake Form**
  - Comprehensive patient information collection
  - Multi-step form with progress tracking
  - Medical history and developmental information

- **Speech Assessment**
  - Video-based speech evaluation
  - Multiple assessment tasks:
    - Initial sounds
    - Short phrases
    - Conversation topics
  - Real-time recording and playback
  - Automated scoring and results

## Tech Stack

- React
- Vite
- TailwindCSS
- WebRTC (for video/audio recording)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/speech-therapy-app.git
cd speech-therapy-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## Development Notes

- The application requires camera and microphone permissions
- For HTTPS in development (required for media access), use:
  ```bash
  mkcert -install
  mkcert localhost
  ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 