import { useState } from 'react';

const ImageUpload = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

  // REPLACE THESE TWO VALUES WITH YOUR CLOUDINARY DETAILS
  const UPLOAD_PRESET = "YOUR_PRESET_NAME_HERE"; // e.g., "my_app_upload"
  const CLOUD_NAME = "YOUR_CLOUD_NAME_HERE";     // e.g., "dxy7..."

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });

      const uploadedImage = await res.json();
      const url = uploadedImage.secure_url;
      
      setImage(url);
      setLoading(false);
      onUploadSuccess(url); // Sends URL to the parent form
      
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '5px' }}>
      <input 
        type="file" 
        onChange={uploadImage} 
        style={{ marginBottom: '10px' }}
      />
      
      {loading && <p style={{ color: 'blue' }}>Uploading to cloud...</p>}
      
      {image && (
        <div>
          <p style={{ color: 'green', fontSize: '12px' }}>Upload Complete!</p>
          <img src={image} style={{ width: '100px', height: '100px', objectFit: 'cover' }} alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
