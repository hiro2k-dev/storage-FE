import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://62.169.16.171:10040"; // Update with your backend URL
const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk

function FileManager() {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState({});
  const [isDeleting, setIsDeleting] = useState({});

  useEffect(() => {
    fetchFiles();
  }, []);

  // 📄 Fetch Files from Server
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files`);
      setFiles(res.data);
    } catch (err) {
      toast.error("❌ Error fetching files");
    }
  };

  // 📤 Handle File Selection (Supports Folders)
  const handleFileSelection = (event) => {
    const items = event.target.files;
    const fileList = [];
    
    for (let i = 0; i < items.length; i++) {
      fileList.push(items[i]);
    }
    
    setSelectedFiles(fileList);
  };

  // 📤 Upload Multiple Files with Folder Structure
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let progress = {};

    for (const file of selectedFiles) {
      const relativePath = file.webkitRelativePath || file.name; // Preserve folder structure
      progress[relativePath] = 0;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      for (let i = 0; i < totalChunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("filename", relativePath);
        formData.append("chunkIndex", i);
        formData.append("totalChunks", totalChunks);

        await axios.post(`${API_URL}/upload`, formData, {
          onUploadProgress: (progressEvent) => {
            progress[relativePath] = ((i + 1) / totalChunks) * 100;
            setUploadProgress({ ...progress });
          },
        });
      }

      await axios.post(`${API_URL}/merge`, {
        filename: relativePath,
        totalChunks,
      });
    }

    toast.success("✅ Upload complete!");
    setUploadProgress({});
    setIsUploading(false);
    fetchFiles();
  };

  // 📥 Download File with Progress
  const handleDownload = async (filename) => {
    setIsDownloading((prev) => ({ ...prev, [filename]: true }));
    setDownloadProgress((prev) => ({ ...prev, [filename]: 0 }));

    try {
      const res = await axios.get(`${API_URL}/download/${filename}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setDownloadProgress((prev) => ({ ...prev, [filename]: percentCompleted }));
        },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`✅ Download complete: ${filename}`);
    } catch (err) {
      toast.error("❌ Download failed!");
    } finally {
      setIsDownloading((prev) => ({ ...prev, [filename]: false }));
    }
  };

  // 🗑️ Delete File
  const handleDelete = async (filename) => {
    setIsDeleting((prev) => ({ ...prev, [filename]: true }));

    try {
      await axios.delete(`${API_URL}/delete/${filename}`);
      toast.success(`✅ Deleted: ${filename}`);
      fetchFiles();
    } catch (err) {
      toast.error("❌ Failed to delete file!");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [filename]: false }));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center" }}>📂 VPS File Manager</h2>

      {/* File Upload */}
      <div style={uploadContainerStyle}>
        <input type="file" multiple webkitdirectory directory onChange={handleFileSelection} />
        <button onClick={handleUpload} disabled={selectedFiles.length === 0 || isUploading} style={buttonStyle}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Upload Progress Bars */}
      {Object.entries(uploadProgress).map(([filename, progress]) => (
        <div key={filename} style={{ marginTop: 10 }}>
          <p>{filename}</p>
          <div style={progressContainerStyle}>
            <div style={{ ...progressBarStyle, width: `${progress}%` }}></div>
          </div>
        </div>
      ))}

      <h3>📄 File List</h3>

      {/* Table for File List */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>No files available</td>
            </tr>
          ) : (
            files.map((file) => (
              <tr key={file}>
                <td>{file}</td>
                <td>
                  <button onClick={() => handleDownload(file)} disabled={isDownloading[file]} style={buttonStyle}>
                    {isDownloading[file] ? "Downloading..." : "Download"}
                  </button>
                  <button onClick={() => handleDelete(file)} disabled={isDeleting[file]} style={deleteButtonStyle}>
                    {isDeleting[file] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Toast Messages */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

/* Styles */
const containerStyle = { padding: "20px", maxWidth: "100%", width: "95vw", margin: "auto", textAlign: "center" };
const uploadContainerStyle = { display: "flex", justifyContent: "center", gap: "10px", alignItems: "center", marginBottom: "20px" };
const buttonStyle = { padding: "8px 12px", border: "none", background: "#007bff", color: "white", cursor: "pointer", borderRadius: "5px", transition: "0.3s", margin: "0 5px" };
const deleteButtonStyle = { ...buttonStyle, background: "red" };
const progressContainerStyle = { width: "100%", background: "#ddd", borderRadius: "5px", overflow: "hidden", height: "10px", marginTop: "10px" };
const progressBarStyle = { height: "100%", background: "green", transition: "width 0.3s ease-in-out" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px", textAlign: "left" };

export default FileManager;
