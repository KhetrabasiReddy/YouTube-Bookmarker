
import { useEffect, useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Fetch bookmarks from localStorage
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("yt-bookmark-")
    );
    const loaded = keys.map((key) => ({
      id: key,
      ...JSON.parse(localStorage.getItem(key)),
    }));
    setBookmarks(loaded);
  }, [showBookmarks]);

  const handleSave = () => {
    if (!title || !link || !timestamp) return alert("Fill all fields");
    const id = `yt-bookmark-${Date.now()}`;
    const bookmark = { title, link, timestamp };
    localStorage.setItem(id, JSON.stringify(bookmark));
    alert("Bookmark saved!");
    setTitle("");
    setLink("");
    setTimestamp("");
  };

  const fetchFromYouTube = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.url.includes("youtube.com/watch")) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => {
              const title = document.title.replace(" - YouTube", "");
              const url = location.href;
              const video = document.querySelector("video");
              const timestamp = video ? Math.floor(video.currentTime) : 0;
              return { title, url, timestamp };
            },
          },
          (results) => {
            const { title, url, timestamp } = results[0].result;
            setTitle(title);
            setLink(url);
            setTimestamp(timestamp.toString());
          }
        );
      } else {
        alert("Open a YouTube video first.");
      }
    });
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    const selected = bookmarks.find((b) => b.id === id);
    if (selected) {
      setTitle(selected.title);
      setLink(selected.link);
      setTimestamp(selected.timestamp);
    }
  };

  const handleEdit = () => {
    if (!selectedId) return;
    const updated = { title, link, timestamp };
    localStorage.setItem(selectedId, JSON.stringify(updated));
    alert("Bookmark updated!");
    setSelectedId(null);
    setShowBookmarks(!showBookmarks); // Refresh list
  };

  const handleDelete = () => {
    if (!selectedId) return;
    localStorage.removeItem(selectedId);
    alert("Bookmark deleted!");
    setSelectedId(null);
    setTitle("");
    setLink("");
    setTimestamp("");
    setShowBookmarks(!showBookmarks); // Refresh list
  };

  const handleOpen = () => {
    const urlWithTime = `${link}&t=${timestamp}s`;
    chrome.tabs.create({ url: urlWithTime });
  };

  return (
    <div className="w-[600px] p-4 rounded-xl shadow-lg bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white animate-fade-in">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text animate-slide-in">
        🎥 YouTube Bookmarker
      </h1>

      {/* Button Controls */}
      <div className="flex gap-2 mb-4">
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
          onClick={fetchFromYouTube}
        >
          Fetch from YouTube
        </button>
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
          onClick={() => setShowBookmarks(!showBookmarks)}
        >
          {showBookmarks ? "Hide Bookmarks" : "Show Bookmarks"}
        </button>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input
          className="bg-gray-800 border border-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
          placeholder="Video URL"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <input
          className="bg-gray-800 border border-gray-700 text-white p-2 rounded focus:ring-2 focus:ring-purple-500 transition-all"
          placeholder="Timestamp"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
      </div>

      {/* Bookmark Viewer */}
      {showBookmarks && (
        <div className="flex border border-gray-700 rounded-xl shadow-inner bg-gray-800 h-[300px] animate-fade-in mt-4">
          {/* Left Panel - List */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto bg-black/20 backdrop-blur">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className={`p-2 cursor-pointer hover:bg-purple-900/30 transition-all ${selectedId === b.id ? "bg-purple-800/60 font-semibold" : ""
                  }`}
                onClick={() => handleSelect(b.id)}
              >
                {b.title}
              </div>
            ))}
          </div>

          {/* Right Panel - Details */}
          <div className="w-2/3 p-4 space-y-2 bg-black/20 rounded-r-xl">
            <h3 className="text-md font-bold text-purple-400">Details</h3>
            <p className="text-gray-400">
              <strong>Title:</strong> {title}
            </p>
            <p>
              <strong>URL:</strong>{" "}
              <a href={link} className="text-blue-600 underline" target="_blank">
                {link}
              </a>
            </p>
            <p>
              <strong>Timestamp:</strong> {timestamp}s
            </p>

            <div className="flex gap-2 pt-2">
              <button
                className="bg-yellow-500 px-3 py-1 text-white rounded hover:bg-yellow-600"
                onClick={handleEdit}
              >
                Update
              </button>
              <button
                className="bg-red-500 px-3 py-1 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="bg-indigo-600 px-3 py-1 text-white rounded hover:bg-indigo-700"
                onClick={handleOpen}
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}
      {/* footer */}
      <div className="mt-6 text-center text-sm text-gray-400 border-t border-gray-700 pt-4">
        Made by <span className="text-purple-400 font-semibold">Khetrabasi Reddy</span><br />
        <a
          href="https://www.linkedin.com/in/khetrabasi-reddy-b0ba77224/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          LinkedIn
        </a> •
        <a
          href="https://github.com/KhetrabasiReddy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline"
        >
          GitHub
        </a> •
        <a
          href="https://github.com/KhetrabasiReddy/your-repo-name"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:underline"
        >
          ⭐ Star my project
        </a>
      </div>

    </div>
  );
}

export default App;



