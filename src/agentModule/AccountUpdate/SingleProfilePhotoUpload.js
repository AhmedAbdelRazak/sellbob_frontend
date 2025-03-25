/** @format */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { message, Spin } from "antd";
import axios from "axios";
import { isAuthenticated } from "../../auth";
import { cloudinaryUpload1 } from "../apiAgent";
import imageImage from "../../GeneralImages/UploadImageImage.jpg";

/**
 * PROPS:
 *   - profilePhoto: { public_id: string, url: string }
 *   - setProfilePhoto: function(newPhotoObject)
 *
 *   Usage in parent:
 *   <SingleProfilePhotoUpload
 *       profilePhoto={formData.profilePhoto}
 *       setProfilePhoto={handleProfilePhotoUpdate}
 *   />
 */
const SingleProfilePhotoUpload = ({ profilePhoto, setProfilePhoto }) => {
	const { user, token } = isAuthenticated() || {};
	const [photo, setPhoto] = useState(
		profilePhoto || { public_id: "", url: "" }
	);
	const [uploading, setUploading] = useState(false);

	// Keep local state in sync if parent changes the prop
	useEffect(() => {
		setPhoto(profilePhoto || { public_id: "", url: "" });
	}, [profilePhoto]);

	/* -------------------------------
     UPLOAD Single IMAGE
  -------------------------------*/
	const fileUploadAndResize = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Basic size check
		if (file.size > 4500000) {
			return message.error(
				`"${file.name}" is > 4 MB. Please pick a smaller file.`
			);
		}

		setUploading(true);
		try {
			// Convert to base64
			const reader = new FileReader();
			await new Promise((resolve, reject) => {
				reader.onload = () => resolve();
				reader.onerror = (err) => reject(err);
				reader.readAsDataURL(file);
			});
			const base64Encoded = reader.result;

			// Upload to Cloudinary
			const res = await cloudinaryUpload1(user._id, token, {
				image: base64Encoded,
			});
			if (res?.public_id && res?.url) {
				// If there was an existing photo, optionally remove it from Cloudinary
				if (photo.public_id) {
					await removeImageFromCloudinary(photo.public_id);
				}

				// Build new photo object
				const newPhoto = { public_id: res.public_id, url: res.url };

				// Update local state
				setPhoto(newPhoto);

				// Notify parent
				setProfilePhoto(newPhoto);
			}
		} catch (err) {
			console.error("Upload error:", err);
			message.error(`Failed to upload: ${file.name}`);
		} finally {
			setUploading(false);
		}
	};

	/* -------------------------------
     REMOVE IMAGE
  -------------------------------*/
	const handleRemoveImage = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (!photo.public_id) return;

		try {
			setUploading(true);
			await removeImageFromCloudinary(photo.public_id);
			// Clear local
			setPhoto({ public_id: "", url: "" });
			// Notify parent
			setProfilePhoto({ public_id: "", url: "" });
			message.success("Image removed successfully.");
		} catch (err) {
			console.error("Error removing image:", err);
			message.error("Failed to remove image");
		} finally {
			setUploading(false);
		}
	};

	// Helper to remove from Cloudinary
	const removeImageFromCloudinary = async (public_id) => {
		await axios.post(
			`${process.env.REACT_APP_API_URL}/admin/removeimage`,
			{ public_id },
			{ headers: { Authorization: `Bearer ${token}` } }
		);
	};

	return (
		<Wrapper>
			{uploading && (
				<div className='uploadingSpin'>
					<Spin tip='Processing...' />
				</div>
			)}

			{/* Display current image if any */}
			<div className='photoContainer'>
				{photo?.url ? (
					<div className='imageWrapper'>
						<CloseBtn type='button' onClick={handleRemoveImage}>
							&times;
						</CloseBtn>
						<img src={photo.url} alt='profile' />
					</div>
				) : (
					<p>No Photo Uploaded</p>
				)}
			</div>

			{/* Upload button */}
			<div className='uploadContainer'>
				<label className='uploadLabel'>
					<img src={imageImage} alt='uploadIcon' style={{ width: "200px" }} />
					<input
						type='file'
						hidden
						accept='image/*'
						onChange={fileUploadAndResize}
					/>
				</label>
				<p className='text-muted'>Image must be &lt; 4 MB.</p>
			</div>
		</Wrapper>
	);
};

export default SingleProfilePhotoUpload;

/* ------------- STYLES ------------- */
const Wrapper = styled.div`
	.uploadContainer {
		text-align: center;
		margin-bottom: 10px;
	}
	.uploadLabel {
		cursor: pointer;
	}
	.uploadingSpin {
		text-align: center;
		margin-bottom: 1rem;
	}
	.photoContainer {
		margin-bottom: 15px;
		text-align: center;
	}
	.imageWrapper {
		display: inline-block;
		position: relative;
		img {
			width: 120px;
			height: 120px;
			object-fit: cover;
			border-radius: 6px;
			box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
		}
	}
`;

const CloseBtn = styled.button`
	position: absolute;
	top: -10px;
	right: -10px;
	background-color: var(--secondary-color-dark, #6f2d00);
	color: var(--mainWhite, #fff);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	font-size: 18px;
	line-height: 18px;
	width: 28px;
	height: 28px;
	z-index: 999;
	&:hover {
		background-color: var(--secondary-color, #ffe4cc);
		transition: background-color 0.2s;
	}
`;
