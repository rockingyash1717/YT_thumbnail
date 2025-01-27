import React, { useState } from "react";
import { 
  RefreshCw, 
  Play, 
  Download,
  AlertCircle
} from "lucide-react";

function VideoSummarizer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [currentThumbnail, setCurrentThumbnail] = useState("");
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null); // In seconds
  const [includeHuman, setIncludeHuman] = useState(false);
  const [includeText, setIncludeText] = useState(false);



  // Simple Alert Component
  const Alert = ({ children, variant = "default" }) => (
    <div className={`p-4 rounded-md flex items-center gap-2 ${
      variant === "destructive" ? "bg-red-100 text-red-800" : "bg-gray-100"
    }`}>
      <AlertCircle className="h-4 w-4" />
      <div>{children}</div>
    </div>
  );

  // YouTube URL validation function
  const validateYouTubeUrl = (url) => {
    if (!url) return false;

    // Regular expressions for different YouTube URL formats
    const patterns = {
      // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
      standard: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/,
      // Shortened URL: https://youtu.be/VIDEO_ID
      shortened: /^(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
      // Embedded URL: https://www.youtube.com/embed/VIDEO_ID
      embedded: /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\S*)?$/,
      // Mobile URL: https://m.youtube.com/watch?v=VIDEO_ID
      mobile: /^(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?(?=.*v=([a-zA-Z0-9_-]{11}))(?:\S+)?$/,
    };

    // Test URL against all patterns
    for (const [format, pattern] of Object.entries(patterns)) {
      if (pattern.test(url)) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return {
            isValid: true,
            videoId: match[1],
            format
          };
        }
      }
    }

    return {
      isValid: false,
      error: "Invalid YouTube URL. Please enter a valid YouTube video URL."
    };
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
    
    if (newUrl) {
      const validation = validateYouTubeUrl(newUrl);
      if (!validation.isValid) {
        setUrlError(validation.error);
      } else {
        setUrlError("");
      }
    } else {
      setUrlError("");
    }
  };

  // Handle Video URL Submission
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    
    // Validate URL before submission
    const validation = validateYouTubeUrl(videoUrl);
    if (!validation.isValid) {
      setUrlError(validation.error);
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
    setProgress(10);
    setElapsedTime(null); // Reset elapsed time

    // Start time measurement
    const start = performance.now(); 
   


    try {
      // Fetch Video Summary
      const summaryResponse = await fetch("http://127.0.0.1:5000/summarize", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          video_id: validation.videoId
        })
      });

      setProgress(50);

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch summary');
      }
      const summaryData = await summaryResponse.json();

      // Fetch Current Thumbnail
      const thumbnailResponse = await fetch("http://127.0.0.1:5000/get_current_thumbnail", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: videoUrl,
          video_id: validation.videoId
        })
      });

      setProgress(75);

      if (!thumbnailResponse.ok) {
        throw new Error('Failed to fetch thumbnail');
      }
      const thumbnailData = await thumbnailResponse.json();

      setSummary(summaryData.summary);
      setCurrentThumbnail(thumbnailData.thumbnail_url);
      setProgress(100);

    // End time measurement
    const end = performance.now();
    const timeTaken = (end - start) / 1000; // Convert ms to seconds
    setElapsedTime(timeTaken);

      

    } catch (err) {
      setError("Error processing video. Please try again.");
      console.error(err);
      setEndTime(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Generate New Thumbnails
  const generateThumbnails = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/generate_thumbnails", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary,
          video_url: videoUrl,
          includeHuman: includeHuman,
          includeText: includeText

        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate thumbnails');
      }
      const data = await response.json();
      setGeneratedThumbnails(data.thumbnails);
    } catch (err) {
      setError("Error generating thumbnails.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download Image Functionality
  const downloadImage = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatElapsedTime = (seconds) => {
    // Ensure seconds is an integer
    seconds = Math.round(seconds); 

    // Calculate minutes and seconds
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60; // Remainder is always accurate

    // Format the output properly
    const paddedSecs = secs.toString().padStart(2, '0'); // Adds leading zero if necessary
    return `${mins}m ${paddedSecs}s`;
};
  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-white">Video Summarizer & Thumbnail Generator</h1>
      </header>
  
      <main className="space-y-8">
        {/* Video URL Input Section */}
        <section className="space-y-4">
          <form onSubmit={handleVideoSubmit}>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter YouTube Video URL"
                value={videoUrl}
                onChange={handleUrlChange}
                className={`w-full p-3 border rounded-lg ${urlError ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {urlError && (
                <Alert variant="destructive">
                  {urlError}
                </Alert>
              )}
            </div>
            <button 
              type="submit" 
              disabled={loading || !!urlError}
              className={`mt-4 w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center gap-2
                ${(urlError || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-5 w-5" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Generate Summary</span>
                </>
              )}
            </button>
          </form>
        </section>
  
        {/* Progress Bar */}
        {loading && (
          <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
            <div
              style={{ width: `${progress}%` }}
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
            ></div>
          </div>
        )}
  
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}
  
        {/* Summary Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Video Summary</h3>
          <div className="prose max-w-none">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p className="text-gray-500">Video summary will appear here...</p>
            )}
          </div>
        </section>
        {/* Total Time Display */}
        {elapsedTime && (
          <div className="text-right mt-4 text-gray-700">
            <p>Total Time To Generate Summary: {formatElapsedTime(elapsedTime)}</p>
          </div>
        )}
  
        {/* Current Thumbnail Section */}
        {currentThumbnail && (
          <section className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Current Video Thumbnail</h3>
            <div className="aspect-video relative">
              <img 
                src={currentThumbnail} 
                alt="Current Video Thumbnail" 
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
          </section>
        )}
  
        {/* Thumbnail Generation Section */}
<section className="space-y-6">
  <div className="flex items-center gap-4">
    {/* Include Human Checkbox */}
    <label className="flex items-center gap-2">
      <input 
        type="checkbox" 
        className="w-4 h-4" 
        id="includeHuman" 
        onChange={(e) => setIncludeHuman(e.target.checked)}
      />
      <span className="text-gray-700">Include Human</span>
    </label>

    {/* Include Text Checkbox */}
    <label className="flex items-center gap-2">
      <input 
        type="checkbox" 
        className="w-4 h-4" 
        id="includeText" 
        onChange={(e) => setIncludeText(e.target.checked)}
      />
      <span className="text-gray-700">Include Text</span>
    </label>
  </div>

  <button 
    onClick={generateThumbnails} 
    disabled={!summary}
    className={`w-full bg-green-500 text-white p-3 rounded-lg
      ${!summary ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
  >
    Generate New Thumbnails
  </button>
  {/* Progress Bar */}
  {loading && (
          <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
            <div
              style={{ width: `${progress}%` }}
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
            ></div>
          </div>
      )}

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {generatedThumbnails.map((thumbnail, index) => (
      <div key={index} className="bg-white p-4 rounded-lg shadow space-y-4">
        <img 
          src={thumbnail} 
          alt={`Generated Thumbnail ${index + 1}`} 
          className="rounded-lg w-full"
        />
        <button 
          onClick={() => downloadImage(thumbnail)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" /> 
          <span>Download</span>
        </button>
      </div>
    ))}
  </div>
</section>

  
        
      </main>
    </div>
  );
  
  
}

export default VideoSummarizer;