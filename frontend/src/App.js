import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoSummarizer from './components/VideoSummarizer';

function App() {
    return (
        <Router>
            <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen flex flex-col items-center justify-center">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/summarizer" element={<VideoSummarizer />} />
                </Routes>
            </div>
        </Router>
    );
}

function Home() {
    return (
        <div className="text-center text-white px-6">
            <h1 className="text-4xl font-bold mb-4">Your YouTube Thumbnail Created in Seconds</h1>
            <p className="text-lg mb-8">
                One of the first dedicated AI Image Models to create high-performing YouTube thumbnails in seconds
            </p>
            <a
                href="/summarizer"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
            >
                Create Now
            </a>

        
        </div>
    );
}

export default App;
