import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard({ user, onLogout }) {
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState(""); // STRING

  const [notes, setNotes] = useState([]);
  const [studyNote, setStudyNote] = useState(null);
  const [error, setError] = useState("");
  const[tagSearch, setTagSearch] = useState("");
  const[tagStudynotes, setTagStudynotes] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);


  // ================= FETCH NOTES =================
  const fetchNotes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notes", {
        params: { user_id: user.id },
      });

      const sorted = [...res.data.notes].sort((a, b) => {
        if (a.is_starred === b.is_starred) {
          return b.id.localeCompare(a.id);
        }
        return b.is_starred - a.is_starred;
      });

      setNotes(sorted);
    } catch (err) {
      setError("Failed to load notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);


  const handlePdfUpload = async (e) => {
  e.preventDefault();

  if (!pdfFile || !title) {
    alert("Please select a PDF and enter title");
    return;
  }

  const formData = new FormData();
  formData.append("file", pdfFile);
  formData.append("user_id", user.id);
  formData.append("title", title);
  formData.append(
  "tags",
  tags.split(",").map(t => t.trim()).filter(Boolean)
);

  try {
    setLoading(true);

    await axios.post(
      "http://localhost:5000/api/notes/upload-pdf",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setPdfFile(null);
    setTitle("");
    fetchNotes();
  } catch {
    alert("PDF upload failed");
  } finally {
    setLoading(false);
  }
};


  // ================= CREATE NOTE =================
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/notes", {
        user_id: user.id,
        title,
        content,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });

      setTitle("");
      setContent("");
      setTags("");
      fetchNotes();
    } catch {
      setError("Failed to save note");
    } finally {
      setLoading(false);
    }
  };


  // ================= STAR NOTE =================
  const handleToggleStar = async (id) => {
    await axios.post(`http://localhost:5000/api/notes/${id}/toggle-star`);
    fetchNotes();
  };

  // ================= DELETE NOTE =================
  const handleDeleteNote = async (id) => {
    await axios.delete(`http://localhost:5000/api/notes/${id}`);
    fetchNotes();
  };

  // ================= FILTER =================
  const filteredNotes = notes.filter(note => {
    const q = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg p-8">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
              AI Notes Vault
            </h1>

            <div className="flex gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </div>
          </div>

          {/* CREATE NOTE */}
          <div className="bg-indigo-50 dark:bg-gray-800 p-6 rounded mb-8">
            <form onSubmit={handleCreateNote} className="space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-3 border rounded dark:bg-gray-700"
              />

              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (DBMS, OS, CN)"
                className="w-full p-3 border rounded dark:bg-gray-700"
              />

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                className="w-full p-3 border rounded min-h-[120px] dark:bg-gray-700"
              />

              <button
                disabled={loading}
                className="px-5 py-2 bg-indigo-600 text-white rounded"
              >
                {loading ? "Generating..." : "Save Note"}
              </button>
            </form>
          </div>


          <div className="bg-purple-50 dark:bg-gray-800 p-6 rounded mb-8">
  <h2 className="text-xl font-semibold mb-4">
    Upload PDF (AI Summary)
  </h2>

  <form onSubmit={handlePdfUpload} className="space-y-4">
    <input
      type="text"
      placeholder="PDF Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full p-3 border rounded dark:bg-gray-700"
    />

    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setPdfFile(e.target.files[0])}
      className="w-full p-3 border rounded dark:bg-gray-700"
    />

    <input
  type="text"
  placeholder="Tags for PDF (DBMS, OS, CN)"
  value={tags}
  onChange={(e) => setTags(e.target.value)}
  className="w-full p-3 border rounded dark:bg-gray-700"
/>


    <button
      disabled={loading}
      className="px-5 py-2 bg-purple-600 text-white rounded"
    >
      {loading ? "Summarizing PDF..." : "Upload & Summarize PDF"}
    </button>
  </form>
</div>


          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or tags..."
            className="w-full p-3 mb-6 border rounded dark:bg-gray-700"
          />

          {/* ================= TAG STUDY SEARCH ================= */}
<div className="flex gap-3 mb-6">
  <input
    value={tagSearch}
    onChange={(e) => setTagSearch(e.target.value)}
    placeholder="Enter tag to study (e.g. DBMS)"
    className="flex-1 p-3 border rounded dark:bg-gray-700"
  />

  <button
    onClick={() => {
      const matched = notes.filter(note =>
        note.tags?.some(
          tag => tag.toLowerCase() === tagSearch.toLowerCase()
        )
      );

      if (matched.length === 0) {
        alert("No notes found for this tag");
        return;
      }

      setTagStudynotes(matched);
    }}
    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
  >
    📚 Study Tag
  </button>
</div>
          {/* NOTES */}
          <div className="grid gap-4">
            {filteredNotes.map(note => (
              <div key={note.id} className="border rounded p-5 bg-white dark:bg-gray-800">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => handleToggleStar(note.id)}>
                      {note.is_starred ? "⭐" : "☆"}
                    </button>
                    <h3 className="font-bold">{note.title}</h3>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStudyNote(note)}>📖</button>
                    <button onClick={() => handleDeleteNote(note.id)}>🗑️</button>
                  </div>
                </div>

                {note.tags?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs bg-blue-100 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-sm">{note.content}</p>

                {note.summary && (
                  <div className="mt-3 bg-indigo-50 dark:bg-gray-700 p-3 rounded">
                    <b>AI Summary:</b> {note.summary}
                  </div>
                )}

                {note.key_points && note.key_points.length > 0 && (
  <div className="mt-3">
    <p className="font-semibold">Key Takeaways:</p>
    <ul className="list-disc list-inside text-sm">
      {note.key_points.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </ul>
  </div>
)}

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STUDY MODE */}
      {studyNote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-8 rounded max-w-3xl relative">
            <button onClick={() => setStudyNote(null)} className="absolute top-4 right-4">✕</button>
            <h2 className="text-2xl font-bold mb-4">{studyNote.title}</h2>
            <p>{studyNote.content}</p>
          </div>
        </div>
      )}

      {/* ================= TAG STUDY MODE ================= */}
{tagStudynotes && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 max-w-4xl w-full p-8 rounded-xl overflow-y-auto max-h-[90vh] relative">

      <button
        onClick={() => setTagStudynotes(null)}
        className="absolute top-4 right-4 text-xl"
      >
        ✕
      </button>

      <h2 className="text-2xl font-bold mb-6">
        📚 Studying Tag: {tagSearch}
      </h2>

      <div className="space-y-6">
        {tagStudynotes.map((note, index) => (
          <div
            key={note.id}
            className="border rounded-lg p-5 bg-indigo-50 dark:bg-gray-800"
          >
            <h3 className="text-lg font-bold mb-2">
              {index + 1}. {note.title}
            </h3>

            <p className="mb-3 whitespace-pre-line">
              {note.content}
            </p>

            {note.summary && (
              <div className="bg-white dark:bg-gray-700 p-3 rounded">
                <b>AI Summary:</b> {note.summary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Dashboard;
