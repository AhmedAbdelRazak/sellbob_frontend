/** @format */
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { message, Spin } from "antd";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import { isAuthenticated } from "../../auth";
import { cloudinaryUpload1 } from "../apiAgent";
import imageImage from "../../GeneralImages/UploadImageImage.jpg";

// For React 18 + react-beautiful-dnd
import StrictModeDroppable from "./StrictModeDroppable";

/**
 * PROPS:
 *   - propertyPhotos: array of { public_id, url }
 *   - setPropertyDetails: function(prev => newState) or direct object
 *   - roomId? if you want to identify which room these photos belong to
 */
const ImageCardMain = ({ propertyPhotos = [], setPropertyDetails, roomId }) => {
	const { user, token } = isAuthenticated();
	const [photos, setPhotos] = useState([]);
	const [uploading, setUploading] = useState(false);

	// Sync local "photos" with incoming "propertyPhotos"
	useEffect(() => {
		setPhotos(propertyPhotos);
	}, [propertyPhotos]);

	/* -------------------------------
     UPLOAD IMAGES
  -------------------------------*/
	const fileUploadAndResize = async (e) => {
		let files = e.target.files;
		if (!files) return;

		setUploading(true);
		const allUploaded = [...photos];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			// Max size 4.5 MB
			if (file.size > 4500000) {
				message.error(`"${file.name}" is > 4 MB. Please pick a smaller file.`);
				continue;
			}
			try {
				// Convert to base64
				const reader = new FileReader();
				await new Promise((resolve, reject) => {
					reader.onload = () => resolve();
					reader.onerror = (err) => reject(err);
					reader.readAsDataURL(file);
				});
				const base64Encoded = reader.result;

				// Upload to Cloudinary (or your server)
				const res = await cloudinaryUpload1(user._id, token, {
					image: base64Encoded,
				});
				if (res?.public_id && res?.url) {
					allUploaded.push({ public_id: res.public_id, url: res.url });
				}
			} catch (err) {
				console.error("Upload error:", err);
				message.error(`Failed to upload: ${file.name}`);
			}
		}

		setPhotos(allUploaded);
		setUploading(false);

		// Update parent
		setPropertyDetails((prev) => {
			if (typeof prev === "function") {
				return prev({
					...prev,
					roomCountDetails: prev?.roomCountDetails || [],
					propertyPhotos: allUploaded, // or adapt if you only do room-level
				});
			}
			return {
				...prev,
				propertyPhotos: allUploaded,
			};
		});
	};

	/* -------------------------------
     REMOVE IMAGE
  -------------------------------*/
	const handleImageRemove = (e, public_id) => {
		e.preventDefault();
		e.stopPropagation();

		axios
			.post(
				`${process.env.REACT_APP_API_URL}/admin/removeimage`,
				{ public_id },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			.then((res) => {
				if (res.data) {
					const updatedPhotos = photos.filter((p) => p.public_id !== public_id);
					setPhotos(updatedPhotos);

					// Update parent
					setPropertyDetails((prev) => {
						const updatedRoomCount = (prev?.roomCountDetails || []).map(
							(room) => {
								if (roomId && room._id === roomId) {
									return { ...room, photos: updatedPhotos };
								}
								return room;
							}
						);
						return {
							...prev,
							roomCountDetails: updatedRoomCount,
							propertyPhotos: !roomId ? updatedPhotos : prev?.propertyPhotos,
						};
					});

					message.success("Image removed successfully.");
				}
			})
			.catch((err) => {
				console.error("Error removing image:", err);
				message.error("Failed to remove image");
			});
	};

	/* -------------------------------
     DRAG & DROP REORDER
  -------------------------------*/
	const onDragEnd = (result) => {
		if (!result.destination) return;
		const items = Array.from(photos);
		const [reordered] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reordered);
		setPhotos(items);

		// Update parent
		setPropertyDetails((prev) => {
			const updatedRoomCount = (prev?.roomCountDetails || []).map((room) => {
				if (roomId && room._id === roomId) {
					return { ...room, photos: items };
				}
				return room;
			});
			return {
				...prev,
				roomCountDetails: updatedRoomCount,
				propertyPhotos: !roomId ? items : prev?.propertyPhotos,
			};
		});
	};

	return (
		<Wrapper>
			{uploading && (
				<div className='uploadingSpin'>
					<Spin tip='Processing...' />
				</div>
			)}

			<DragDropContext onDragEnd={onDragEnd}>
				<StrictModeDroppable droppableId='photos' direction='horizontal'>
					{(provided) => (
						<div
							className='photoRow'
							ref={provided.innerRef}
							{...provided.droppableProps}
						>
							{photos.map((photo, index) => (
								<Draggable
									key={photo.public_id}
									draggableId={photo.public_id}
									index={index}
								>
									{(draggableProvided) => (
										<PhotoContainer
											ref={draggableProvided.innerRef}
											{...draggableProvided.draggableProps}
										>
											<CloseBtn
												type='button'
												onClick={(e) => handleImageRemove(e, photo.public_id)}
											>
												&times;
											</CloseBtn>
											<img
												src={photo.url}
												alt='upload'
												{...draggableProvided.dragHandleProps}
											/>
										</PhotoContainer>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</StrictModeDroppable>
			</DragDropContext>

			<div className='uploadContainer'>
				<label className='uploadLabel'>
					<img src={imageImage} alt='uploadIcon' style={{ width: "200px" }} />
					<input
						type='file'
						multiple
						hidden
						accept='images/*'
						onChange={fileUploadAndResize}
					/>
				</label>
				<p className='text-muted'>
					Images must be &lt; 4 MB. Drag &amp; drop to reorder.
				</p>
			</div>
		</Wrapper>
	);
};

export default ImageCardMain;

/* ------------- STYLES ------------- */
const Wrapper = styled.div`
	.photoRow {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		margin-bottom: 15px;
	}
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
`;

const PhotoContainer = styled.div`
	position: relative;
	margin-right: 10px;
	padding: 4px;

	img {
		width: 110px;
		height: 110px;
		object-fit: cover;
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
		user-select: none;
		cursor: grab;
		transition: opacity 0.2s;
		&:hover {
			opacity: 0.85;
		}
	}
`;

const CloseBtn = styled.button`
	position: absolute;
	top: 5px;
	right: 5px;
	background-color: var(--secondary-color-dark, #6f2d00);
	color: var(--mainWhite, #fff);
	border: none;
	border-radius: 50%;
	cursor: pointer;
	font-size: 18px;
	line-height: 18px;
	padding: 2px 7px;
	z-index: 999;

	&:hover {
		background-color: var(--secondary-color, #ffe4cc);
		transition: background-color 0.2s;
	}
`;
