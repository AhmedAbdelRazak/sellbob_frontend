// sections/PrivacyPolicySection.js
import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const toolbarOptions = [
	[{ header: [1, 2, 3, false] }],
	["bold", "italic", "underline", "strike", { color: [] }],
	[{ list: "ordered" }, { list: "bullet" }],
	["link", "image", "video"],
	["clean"],
];

const PrivacyPolicySection = ({ websiteData, setWebsiteData }) => {
	const handleChange = (value) => {
		setWebsiteData({ ...websiteData, privacyPolicy: value });
	};

	return (
		<div>
			<h3>Privacy Policy</h3>
			<ReactQuill
				value={websiteData.privacyPolicy || ""}
				onChange={handleChange}
				modules={{ toolbar: { container: toolbarOptions } }}
				style={{ height: "450px" }}
			/>
		</div>
	);
};

export default PrivacyPolicySection;
