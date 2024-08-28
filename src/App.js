
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [uploadImages, setUploadedImages] = useState([]);
  const [image, setImage] = useState(null);
  const [sortByDateAscending, setSortByDateAscending] = useState(true);
  const [deletingImages, setDeletingImages] = useState(new Set());

  useEffect(() => {
    axios.get('/images')
      .then(response => {
        setUploadedImages(response.data);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }, []);

  const submitImage = () => {
    if (!image) return;
    const data = new FormData();  
    data.append("file", image);
    data.append("upload_preset", "gagandemoapp");
    data.append("cloud_name", "dxcp5qv1b");

    fetch("https://api.cloudinary.com/v1_1/dxcp5qv1b/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUploadedImages([...uploadImages, {
           url: data.secure_url, 
           public_id: data.public_id 
        }]);
        setImage(null); 
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteImage = useCallback((public_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this image?");
    if (confirmDelete) {
      setDeletingImages(prev => new Set(prev).add(public_id));
      axios.delete(`/images/${public_id}`)
        .then(() => {
          console.log("Image deleted successfully:", public_id);
          const updatedImages = uploadImages.filter(image => image.public_id !== public_id);
          setUploadedImages(updatedImages);
          setDeletingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(public_id);
            return newSet;
          });
        })
        .catch((err) => {
          console.log("Error deleting image:", err);
          setDeletingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(public_id);
            return newSet;
          });
        });
    }
  }, [uploadImages]);

  const toggleSortByDate = () => {
    setSortByDateAscending(!sortByDateAscending);
    const sortedImages = sortByDate([...uploadImages]);
    setUploadedImages(sortedImages);
  };

  const sortByDate = (images) => {
    return images.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortByDateAscending ? dateA - dateB : dateB - dateA;
    });
  };

  return (
    <div className="container">
      <div className="upload-section">
        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <button className="btn" onClick={submitImage}>Upload</button>
        <button className="btn" onClick={toggleSortByDate}>
          {sortByDateAscending ? "Sort by Date Ascending" : "Sort by Date Descending"}
        </button>
      </div>

      <table className="image-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>URL</th>
            <th>Public ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {uploadImages.map((file, index) => (
            <tr key={index}>
              <td>
                <img src={file.url} alt="Uploaded" className="uploaded-image" />
              </td>
              <td>{file.url}</td>
              <td>{file.public_id}</td>
              <td>
                <button 
                  className="btn btn-delete" 
                  onClick={() => deleteImage(file.public_id)} 
                  disabled={deletingImages.has(file.public_id)}
                >
                  {deletingImages.has(file.public_id) ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
