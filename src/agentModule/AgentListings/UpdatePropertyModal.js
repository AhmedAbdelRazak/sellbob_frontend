/** @format */
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
	Modal,
	Button,
	Select,
	Input,
	InputNumber,
	message,
	Row,
	Col,
	Tooltip,
} from "antd";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { InfoCircleOutlined } from "@ant-design/icons";

import { isAuthenticated } from "../../auth";
import { updateProperty } from "../apiAgent";
import ImageCardMain from "./ImageCardMain";

// Ensure this path is correct in your project:
import { indianStatesArray } from "../utils";

/** Generates a local ID for new rooms (if they don't have one) */
function generateLocalId() {
	return "local_" + Math.random().toString(36).slice(2);
}

const { TextArea } = Input;
const INDIA_COORDS = { lat: 20.5937, lng: 78.9629 };

const propertyTypes = [
	{ label: "Apartment", value: "apartment" },
	{ label: "House", value: "house" },
	{ label: "Shared Apartment", value: "shared apartment" },
	{ label: "Duplex", value: "duplex" },
];

const propertyStatusOptions = [
	{ label: "For Sale", value: "sale" },
	{ label: "For Rent (Monthly)", value: "rent" },
];

const propertyAmenitiesList = [
	"Elevator",
	"Security",
	"Swimming Pool",
	"Gym",
	"Garden",
	"Playground",
	"Concierge",
	"Parking",
	"Backup Generator",
	"Satellite/Cable TV",
];

const propertyViewsList = [
	"Sea View",
	"Street View",
	"Garden View",
	"City View",
	"Mountain View",
	"Pool View",
	"Courtyard View",
];

const roomTypes = [
	"living room",
	"bedroom",
	"loft",
	"bathroom",
	"office room",
	"kitchen",
	"dining room",
	"studio",
	"guest room",
	"maid’s room",
];

/**
 * PROPS:
 * - visible (boolean)
 * - onCancel (function)
 * - property (object from DB)
 * - onPropertyUpdated (function): callback with updated doc
 */
const UpdatePropertyModal = ({
	visible,
	onCancel,
	property,
	onPropertyUpdated,
}) => {
	const { user, token } = isAuthenticated() || {};

	// ---------- STATE FOR FORM FIELDS ----------
	const [propertyName, setPropertyName] = useState("");
	const [propertyName_OtherLanguage, setPropertyName_OtherLanguage] =
		useState("");

	const [propertyState, setPropertyState] = useState("");
	const [propertyCity, setPropertyCity] = useState("");
	const [otherCityName, setOtherCityName] = useState("");
	const [propertyAddress, setPropertyAddress] = useState("");
	const [phone, setPhone] = useState("");

	const [propertyFloors, setPropertyFloors] = useState(1);
	// We'll label it “Bedrooms Count” in the UI, but keep the same state variable:
	const [overallRoomsCount, setOverallRoomsCount] = useState(1);

	// bathrooms
	const [bathRoomsCount, setBathRoomsCount] = useState(1);

	// propertySize as an object
	const [propertySizeObj, setPropertySizeObj] = useState({
		size: 0,
		unit: "square meter",
	});

	const [propertyTypeVal, setPropertyTypeVal] = useState("apartment");
	const [propertyStatus, setPropertyStatus] = useState("sale");

	// Price & Extra Fees
	const [propertyPrice, setPropertyPrice] = useState(0);
	const [propertyExtraFees, setPropertyExtraFees] = useState(0);

	const [aboutProperty, setAboutProperty] = useState("");
	const [aboutPropertyOtherLang, setAboutPropertyOtherLang] = useState("");

	// Amenities & Views
	const [propertyAmenities, setPropertyAmenities] = useState([]);
	const [propertyViews, setPropertyViews] = useState([]);

	// Close Areas
	const [closeAreas, setCloseAreas] = useState([]);
	const [singleCloseArea, setSingleCloseArea] = useState("");

	// Photos
	const [propertyPhotos, setPropertyPhotos] = useState([]);

	// Rooms
	const [rooms, setRooms] = useState([]);

	// MAP / LOCATION
	const [markerLat, setMarkerLat] = useState(INDIA_COORDS.lat);
	const [markerLng, setMarkerLng] = useState(INDIA_COORDS.lng);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
	const [manualLat, setManualLat] = useState("");
	const [manualLng, setManualLng] = useState("");
	const [manualInputEnabled, setManualInputEnabled] = useState(false);
	const [addressToGeocode, setAddressToGeocode] = useState("");
	const geocoderRef = useRef(null);

	// LOADING & ERROR
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	// **Flag** to track if we are still loading data from DB
	const [isInitialLoad, setIsInitialLoad] = useState(false);

	// We build a list of states from the array
	const stateOptions = indianStatesArray.map((st) => ({
		label: st.name,
		value: st.name,
	}));

	// Will build city options dynamically for the selected state
	const [cityOptions, setCityOptions] = useState([]);

	/* 
    1) On receiving "property": populate local state 
  */
	useEffect(() => {
		if (!property) return;

		// Basic fields
		setPropertyName(property.propertyName || "");
		setPropertyName_OtherLanguage(property.propertyName_OtherLanguage || "");
		setPropertyState(property.propertyState || "");
		setPropertyCity(property.propertyCity || "");
		setOtherCityName("");

		setPropertyAddress(property.propertyAddress || "");
		setPhone(property.phone || "");

		setPropertyFloors(property.propertyFloors || 1);
		setOverallRoomsCount(property.overallRoomsCount || 1);
		setBathRoomsCount(property.bathRoomsCount || 1);

		// propertySize
		setPropertySizeObj(
			property.propertySize || {
				size: 0,
				unit: "square meter",
			}
		);

		setPropertyTypeVal(property.propertyType || "apartment");
		setPropertyStatus(property.propertyStatus || "sale");

		// price & fees
		setPropertyPrice(property.propertyPrice || 0);
		setPropertyExtraFees(property.propertyExtraFees || 0);

		setAboutProperty(property.aboutProperty || "");
		setAboutPropertyOtherLang(property.aboutPropertyOtherLanguange || "");

		// arrays
		setPropertyAmenities(property.amenities || []);
		setPropertyViews(property.views || []);
		setCloseAreas(property.closeAreas || []);
		setPropertyPhotos(property.propertyPhotos || []);

		// rooms
		if (Array.isArray(property.roomCountDetails)) {
			const normalizedRooms = property.roomCountDetails.map((r) =>
				r._id ? r : { ...r, _id: generateLocalId() }
			);
			setRooms(normalizedRooms);
		} else {
			// fallback if no rooms
			setRooms([
				{
					_id: generateLocalId(),
					roomType: "",
					count: 1,
					roomSize: 100,
					displayName: "",
					displayName_OtherLanguage: "",
					description: "",
					description_OtherLanguage: "",
					photos: [],
				},
			]);
		}

		// map location
		if (
			property.location &&
			property.location.coordinates &&
			property.location.coordinates.length === 2
		) {
			setMarkerLng(property.location.coordinates[0]);
			setMarkerLat(property.location.coordinates[1]);
		} else {
			setMarkerLat(INDIA_COORDS.lat);
			setMarkerLng(INDIA_COORDS.lng);
		}

		setIsInitialLoad(true);
	}, [property]);

	/* 
    2) Build city list from propertyState 
  */
	useEffect(() => {
		if (!propertyState) {
			setCityOptions([]);
			setPropertyCity("");
			setOtherCityName("");
			return;
		}

		const foundState = indianStatesArray.find(
			(s) => s.name.toLowerCase() === propertyState.toLowerCase()
		);
		if (!foundState) {
			setCityOptions([]);
			setPropertyCity("");
			setOtherCityName("");
			return;
		}

		// build city dropdown
		const transformedCities = (foundState.majorCities || []).map((city) => ({
			label: city.name,
			value: city.name,
			lat: city.latitude,
			lng: city.longitude,
		}));
		transformedCities.push({ label: "Other", value: "other" });
		setCityOptions(transformedCities);

		// if not initial load => user changed propertyState
		if (!isInitialLoad) {
			setPropertyCity("");
			setOtherCityName("");
			setMarkerLat(foundState.latitude);
			setMarkerLng(foundState.longitude);
			return;
		}

		// initial load => attempt to match city
		setMarkerLat(foundState.latitude);
		setMarkerLng(foundState.longitude);

		if (propertyCity) {
			const match = transformedCities.find(
				(c) => c.value.toLowerCase() === propertyCity.toLowerCase()
			);
			if (match) {
				setPropertyCity(match.value);
				setMarkerLat(match.lat);
				setMarkerLng(match.lng);
			} else {
				// user typed city that isn't in majorCities => "other"
				setPropertyCity("other");
				setOtherCityName(propertyCity);
			}
		}
		setIsInitialLoad(false);
		// eslint-disable-next-line
	}, [propertyState, isInitialLoad]);

	/* 
    3) If user picks city from dropdown 
       => auto-set lat/lng if not "Other"
  */
	useEffect(() => {
		if (!propertyCity || propertyCity === "other") return;
		const chosen = cityOptions.find(
			(c) => c.value.toLowerCase() === propertyCity.toLowerCase()
		);
		if (chosen) {
			setMarkerLat(chosen.lat);
			setMarkerLng(chosen.lng);
		}
	}, [propertyCity, cityOptions]);

	/* MAP / GEO */
	const handleScriptLoad = () => {
		if (window.google && window.google.maps && !geocoderRef.current) {
			geocoderRef.current = new window.google.maps.Geocoder();
		}
	};

	const openLocationModal = () => setLocationModalVisible(true);

	const handleMapClick = (e) => {
		const lat = e.latLng.lat();
		const lng = e.latLng.lng();
		setMarkerLat(lat);
		setMarkerLng(lng);
	};

	const handleLocationModalOk = () => setLocationModalVisible(false);
	const handleLocationModalCancel = () => setLocationModalVisible(false);

	const handleAddressGeocode = () => {
		if (!geocoderRef.current) {
			return message.error("Geocoder not ready.");
		}
		geocoderRef.current.geocode(
			{ address: addressToGeocode },
			(results, status) => {
				if (status === "OK" && results[0]) {
					const loc = results[0].geometry.location;
					setMarkerLat(loc.lat());
					setMarkerLng(loc.lng());
					message.success("Address found! Marker updated.");
				} else {
					message.error("Unable to geocode that address.");
				}
			}
		);
	};

	const handleManualSubmit = () => {
		if (!manualLat || !manualLng) return;
		const lat = parseFloat(manualLat);
		const lng = parseFloat(manualLng);
		if (Number.isNaN(lat) || Number.isNaN(lng)) {
			message.error("Invalid lat/lng values.");
			return;
		}
		setMarkerLat(lat);
		setMarkerLng(lng);
		message.success("Manual coordinates set!");
	};

	/* CLOSE AREAS */
	const handleAddCloseArea = () => {
		if (!singleCloseArea.trim()) {
			return message.error("Please enter a close area");
		}
		setCloseAreas([...closeAreas, singleCloseArea]);
		setSingleCloseArea("");
	};

	const handleRemoveCloseArea = (idx) => {
		const updated = [...closeAreas];
		updated.splice(idx, 1);
		setCloseAreas(updated);
	};

	/* ROOMS */
	const handleAddRoom = () => {
		setRooms((prev) => [
			...prev,
			{
				_id: generateLocalId(),
				roomType: "",
				count: 1,
				roomSize: 100,
				displayName: "",
				displayName_OtherLanguage: "",
				description: "",
				description_OtherLanguage: "",
				photos: [],
			},
		]);
	};

	const handleRemoveRoom = (idx) => {
		const updated = [...rooms];
		updated.splice(idx, 1);
		setRooms(updated);
	};

	/* SUBMIT => UPDATE PROPERTY */
	const handleOk = async () => {
		if (!property) return;

		// Basic validations
		if (!propertyName.trim()) {
			return message.error("Please enter property name (English).");
		}
		if (!propertyState.trim()) {
			return message.error("Please select a state.");
		}
		if (!propertyCity.trim()) {
			return message.error("Please select a city or 'Other'.");
		}

		let finalCity = propertyCity;
		if (propertyCity === "other") {
			if (!otherCityName.trim()) {
				return message.error("Please enter the city name in 'Other City'.");
			}
			finalCity = otherCityName;
		}

		if (!phone.trim()) {
			return message.error("Phone is required.");
		}
		if (!aboutProperty.trim()) {
			return message.error("About property (English) is required.");
		}

		// Build final updated property
		const updatedProperty = {
			propertyName,
			propertyName_OtherLanguage,
			propertyState,
			propertyCity: finalCity,
			propertyAddress,
			phone,
			propertyFloors,
			overallRoomsCount,
			bathRoomsCount,
			propertySize: propertySizeObj,
			propertyType: propertyTypeVal,
			propertyStatus,
			propertyPrice, // numeric
			propertyExtraFees: propertyExtraFees || 0,
			aboutProperty,
			aboutPropertyOtherLanguange: aboutPropertyOtherLang,
			amenities: propertyAmenities,
			views: propertyViews,
			closeAreas,
			propertyPhotos,
			location: {
				type: "Point",
				coordinates: [markerLng, markerLat],
			},
			roomCountDetails: rooms.map((r) => ({
				_id: r._id,
				roomType: r.roomType || "",
				count: Number(r.count) || 1,
				roomSize: Number(r.roomSize) || 100,
				displayName: r.displayName || "",
				displayName_OtherLanguage: r.displayName_OtherLanguage || "",
				description: r.description || "",
				description_OtherLanguage: r.description_OtherLanguage || "",
				photos: r.photos || [],
			})),
		};

		setLoading(true);
		setServerError("");

		try {
			// If belongsTo is user obj or just ID:
			const belongsToId =
				property.belongsTo?._id || property.belongsTo || user._id;

			const resp = await updateProperty(
				property._id,
				belongsToId,
				token,
				updatedProperty
			);

			if (resp.error) {
				setServerError(resp.error);
				message.error(resp.error);
			} else {
				message.success("Property updated successfully!");
				if (onPropertyUpdated) {
					onPropertyUpdated(resp);
				}
			}
		} catch (err) {
			console.error("Error updating property:", err);
			message.error("Failed to update property");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={
				<div
					style={{
						fontSize: "1.6rem",
						fontWeight: "bold",
						color: "var(--primaryBlue)",
						textDecoration: "underline",
					}}
				>
					Update Property
				</div>
			}
			open={visible}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			okText='Save Changes'
			style={{ top: 20 }}
			width={1000}
		>
			{serverError && <ErrorMsg>{serverError}</ErrorMsg>}

			{/* PROPERTY PHOTOS */}
			<SectionTitle>Property Photos</SectionTitle>
			<ImageCardMain
				propertyPhotos={propertyPhotos}
				setPropertyDetails={(prev) => {
					if (typeof prev === "function") {
						setPropertyPhotos((old) => {
							const newVal = prev({ propertyPhotos: old });
							return newVal.propertyPhotos || [];
						});
					} else {
						setPropertyPhotos(prev?.propertyPhotos || []);
					}
				}}
			/>

			{/* BASIC FIELDS */}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<label style={{ display: "block" }}>
						Property Name (English)
						<Tooltip title='Adding a catchy name to your property, e.g. "Amazing Duplex in Mumbai"'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						value={propertyName}
						onChange={(e) => setPropertyName(e.target.value)}
						placeholder='e.g. Beach House'
					/>
				</Col>
				<Col span={12}>
					<label style={{ display: "block" }}>
						Property Name (Hindi)
						<Tooltip title='If you prefer to also name the property in Hindi'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<Input
						value={propertyName_OtherLanguage}
						onChange={(e) => setPropertyName_OtherLanguage(e.target.value)}
						placeholder='e.g. अद्भुत डुप्लेक्स'
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				{/* STATE SELECT */}
				<Col span={8}>
					<label style={{ display: "block" }}>
						State
						<Tooltip title='Select the Indian state where the property is located'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Select
						style={{ width: "100%" }}
						showSearch
						placeholder='Select State'
						value={propertyState || undefined}
						onChange={(val) => setPropertyState(val)}
						options={stateOptions}
						optionFilterProp='label'
						allowClear
					/>
				</Col>

				{/* CITY SELECT + OTHER */}
				<Col span={8}>
					<label style={{ display: "block" }}>
						City
						<Tooltip title='Pick one of the major cities or choose "Other" to type in manually'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Select
						style={{ width: "100%" }}
						disabled={!propertyState}
						showSearch
						placeholder={propertyState ? "Select a city" : "Choose State first"}
						value={propertyCity || undefined}
						onChange={(val) => setPropertyCity(val)}
						options={cityOptions}
						optionFilterProp='label'
						allowClear
					/>
					{propertyCity === "other" && (
						<Input
							style={{ marginTop: 8 }}
							placeholder='Type other city name'
							value={otherCityName}
							onChange={(e) => setOtherCityName(e.target.value)}
						/>
					)}
				</Col>

				<Col span={8}>
					<label style={{ display: "block" }}>
						Phone
						<Tooltip title='Contact phone number for potential buyers/tenants'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						placeholder='Contact phone number'
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Floors
						<Tooltip title='How many floors in the main property? e.g. if the whole building has 8 floors, then add 8 here.'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<InputNumber
						min={1}
						max={1000}
						style={{ width: "100%" }}
						value={propertyFloors}
						onChange={(val) => setPropertyFloors(val)}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Bedrooms Count
						<Tooltip title='How many bedrooms does this house or apartment have?'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<InputNumber
						min={1}
						max={10000}
						style={{ width: "100%" }}
						value={overallRoomsCount}
						onChange={(val) => setOverallRoomsCount(val)}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Address
						<Tooltip title='Street address or landmark description if available'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<Input
						value={propertyAddress}
						onChange={(e) => setPropertyAddress(e.target.value)}
						placeholder='Street address...'
					/>
				</Col>
			</Row>

			{/* BATHROOM & SIZE */}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Bathrooms Count
						<Tooltip title='How many bathrooms does the house/apartment have?'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<InputNumber
						min={1}
						max={100}
						style={{ width: "100%" }}
						value={bathRoomsCount}
						onChange={(val) => setBathRoomsCount(val)}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Size (square meter)
						<Tooltip title='Total size of the property in square meter'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						value={propertySizeObj.size}
						onChange={(val) =>
							setPropertySizeObj((prev) => ({ ...prev, size: val }))
						}
					/>
				</Col>
			</Row>

			{/* TYPE/STATUS/PRICE */}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Type
						<Tooltip title='Select the category of the property, e.g. Apartment, House, etc.'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red" }}>*</span>
					</label>
					<Select
						style={{ width: "100%" }}
						options={propertyTypes}
						value={propertyTypeVal}
						onChange={(val) => setPropertyTypeVal(val)}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Status
						<Tooltip title='Is this property for sale or for rent?'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red" }}>*</span>
					</label>
					<Select
						style={{ width: "100%" }}
						options={propertyStatusOptions}
						value={propertyStatus}
						onChange={(val) => setPropertyStatus(val)}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						{propertyStatus === "rent" ? "Monthly Rent" : "Sale Price"}
						<Tooltip
							title={
								propertyStatus === "rent"
									? "Enter monthly rent cost"
									: "Enter the total sale price in RUPEE"
							}
						>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red" }}>*</span>
					</label>
					{/* 
            Use formatter & parser for comma separators 
            while the underlying state remains numeric
          */}
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						value={propertyPrice}
						onChange={(val) => setPropertyPrice(val)}
						formatter={(value) =>
							value
								? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								: ""
						}
						parser={(value) =>
							value ? parseFloat(value.replace(/[^\d.]/g, "")) || 0 : 0
						}
					/>
				</Col>
			</Row>

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Monthly Extra Fees
						<Tooltip title='Additional monthly charges, e.g. maintenance fees'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<InputNumber
						min={0}
						style={{ width: "100%" }}
						value={propertyExtraFees}
						onChange={(val) => setPropertyExtraFees(val)}
					/>
				</Col>
			</Row>

			{/* ABOUT PROPERTY */}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<label style={{ display: "block" }}>
						About Property (English)
						<Tooltip title='Description about your property in English, e.g. "This is a lovely place."'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red" }}>*</span>
					</label>
					<TextArea
						rows={3}
						value={aboutProperty}
						onChange={(e) => setAboutProperty(e.target.value)}
					/>
				</Col>
				<Col span={12}>
					<label style={{ display: "block" }}>
						About Property (Hindi)
						<Tooltip title='Description about your property in Hindi'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<TextArea
						rows={3}
						value={aboutPropertyOtherLang}
						onChange={(e) => setAboutPropertyOtherLang(e.target.value)}
					/>
				</Col>
			</Row>

			{/* AMENITIES & VIEWS */}
			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<label style={{ display: "block" }}>
						Property Amenities
						<Tooltip title='Select any features available in your property (parking, elevator, gym, etc.)'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<Select
						mode='multiple'
						allowClear
						style={{ width: "100%" }}
						value={propertyAmenities}
						onChange={(vals) => setPropertyAmenities(vals)}
					>
						{propertyAmenitiesList.map((amen) => (
							<Select.Option key={amen} value={amen}>
								{amen}
							</Select.Option>
						))}
					</Select>
				</Col>
				<Col span={12}>
					<label style={{ display: "block" }}>
						Property Views
						<Tooltip title='Select the type of scenic views available (sea view, mountain view, etc.)'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
					</label>
					<Select
						mode='multiple'
						allowClear
						style={{ width: "100%" }}
						value={propertyViews}
						onChange={(vals) => setPropertyViews(vals)}
					>
						{propertyViewsList.map((view) => (
							<Select.Option key={view} value={view}>
								{view}
							</Select.Option>
						))}
					</Select>
				</Col>
			</Row>

			{/* CLOSE AREAS */}
			<SectionTitle style={{ marginTop: 24 }}>
				Close Areas (Optional)
			</SectionTitle>
			<Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
				<Col span={16}>
					<Input
						placeholder='e.g. Nearby School'
						value={singleCloseArea}
						onChange={(e) => setSingleCloseArea(e.target.value)}
						onPressEnter={(e) => {
							e.preventDefault();
							handleAddCloseArea();
						}}
					/>
				</Col>
				<Col span={8}>
					<Button style={{ width: "100%" }} onClick={handleAddCloseArea}>
						Add Close Area
					</Button>
				</Col>
			</Row>
			{closeAreas.length > 0 && (
				<CloseAreasList>
					{closeAreas.map((area, idx) => (
						<li key={idx}>
							<span className='areaLabel'>{area}</span>
							<Button
								type='text'
								danger
								onClick={() => handleRemoveCloseArea(idx)}
								icon={<span style={{ fontWeight: "bold" }}>x</span>}
							>
								Remove
							</Button>
						</li>
					))}
				</CloseAreasList>
			)}

			{/* ROOM DETAILS */}
			<SectionTitle style={{ marginTop: 24 }}>Room Details</SectionTitle>
			{rooms.map((room, idx) => (
				<div
					key={room._id || idx}
					style={{
						border: "1px solid var(--border-color-light)",
						padding: 10,
						marginBottom: 16,
						borderRadius: "6px",
					}}
				>
					<Row gutter={[16, 16]}>
						<Col span={8}>
							<label style={{ display: "block" }}>
								Room Type
								<Tooltip title='E.g. living room, bedroom, kitchen, bathroom, etc.'>
									<InfoCircleOutlined
										style={{ marginLeft: 8, color: "#999" }}
									/>
								</Tooltip>
								<span style={{ color: "red", marginLeft: 4 }}>*</span>
							</label>
							<Select
								style={{ width: "100%" }}
								value={room.roomType}
								onChange={(val) => {
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = { ...updated[idx], roomType: val };
										return updated;
									});
								}}
								placeholder='Choose room type'
							>
								{roomTypes.map((rt) => (
									<Select.Option key={rt} value={rt}>
										{rt}
									</Select.Option>
								))}
							</Select>
						</Col>
						<Col span={8}>
							<label style={{ display: "block" }}>
								Count
								<Tooltip title='How many of this specific room?'>
									<InfoCircleOutlined
										style={{ marginLeft: 8, color: "#999" }}
									/>
								</Tooltip>
								<span style={{ color: "red", marginLeft: 4 }}>*</span>
							</label>
							<InputNumber
								min={1}
								style={{ width: "100%" }}
								value={room.count}
								onChange={(val) => {
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = { ...updated[idx], count: val };
										return updated;
									});
								}}
							/>
						</Col>
						<Col span={8}>
							<label style={{ display: "block" }}>
								Room Size (m²)
								<Tooltip title='Approximate size in square meters'>
									<InfoCircleOutlined
										style={{ marginLeft: 8, color: "#999" }}
									/>
								</Tooltip>
							</label>
							<InputNumber
								min={1}
								style={{ width: "100%" }}
								value={room.roomSize}
								onChange={(val) => {
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = { ...updated[idx], roomSize: val };
										return updated;
									});
								}}
							/>
						</Col>
					</Row>

					<Row gutter={[16, 16]} style={{ marginTop: 10 }}>
						<Col span={8}>
							<label style={{ display: "block" }}>Display Name (English)</label>
							<Input
								placeholder='e.g. Master Bedroom'
								value={room.displayName}
								onChange={(e) => {
									const val = e.target.value;
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = { ...updated[idx], displayName: val };
										return updated;
									});
								}}
							/>
						</Col>
						<Col span={8}>
							<label style={{ display: "block" }}>Display Name (Hindi)</label>
							<Input
								placeholder='e.g. मास्टर बेडरूम'
								value={room.displayName_OtherLanguage}
								onChange={(e) => {
									const val = e.target.value;
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = {
											...updated[idx],
											displayName_OtherLanguage: val,
										};
										return updated;
									});
								}}
							/>
						</Col>
					</Row>

					<Row gutter={[16, 16]} style={{ marginTop: 10 }}>
						<Col span={8}>
							<label style={{ display: "block" }}>Description (English)</label>
							<TextArea
								rows={2}
								value={room.description}
								onChange={(e) => {
									const val = e.target.value;
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = { ...updated[idx], description: val };
										return updated;
									});
								}}
							/>
						</Col>
						<Col span={8}>
							<label style={{ display: "block" }}>Description (Hindi)</label>
							<TextArea
								rows={2}
								value={room.description_OtherLanguage}
								onChange={(e) => {
									const val = e.target.value;
									setRooms((prev) => {
										const updated = [...prev];
										updated[idx] = {
											...updated[idx],
											description_OtherLanguage: val,
										};
										return updated;
									});
								}}
							/>
						</Col>
					</Row>

					<Row style={{ marginTop: 10 }}>
						<Col span={24}>
							<label style={{ display: "block" }}>
								Room Photos
								<Tooltip title='Upload photos specific to this room'>
									<InfoCircleOutlined
										style={{ marginLeft: 8, color: "#999" }}
									/>
								</Tooltip>
							</label>
							<ImageCardMain
								propertyPhotos={room.photos}
								setPropertyDetails={(prevFunc) => {
									if (typeof prevFunc === "function") {
										setRooms((oldRooms) => {
											const updated = [...oldRooms];
											const newVal = prevFunc({
												propertyPhotos: updated[idx].photos,
											});
											updated[idx].photos = newVal.propertyPhotos || [];
											return updated;
										});
									} else {
										setRooms((oldRooms) => {
											const updated = [...oldRooms];
											updated[idx].photos = prevFunc?.propertyPhotos || [];
											return updated;
										});
									}
								}}
							/>
						</Col>
					</Row>

					{rooms.length > 1 && (
						<div style={{ textAlign: "right", marginTop: 10 }}>
							<Button
								danger
								onClick={() => handleRemoveRoom(idx)}
								style={{
									background: "var(--secondary-color-dark)",
									color: "var(--mainWhite)",
								}}
							>
								Remove This Room
							</Button>
						</div>
					)}
				</div>
			))}
			<Button type='dashed' onClick={handleAddRoom}>
				+ Add Room
			</Button>

			{/* LOCATION */}
			<SectionTitle style={{ marginTop: 24 }}>
				Location Coordinates
			</SectionTitle>
			<Row gutter={[16, 16]}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Latitude
						<Tooltip title='Latitude of the property location on map'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						type='number'
						step='0.000001'
						value={markerLat}
						onChange={(e) => setMarkerLat(Number(e.target.value))}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Longitude
						<Tooltip title='Longitude of the property location on map'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						type='number'
						step='0.000001'
						value={markerLng}
						onChange={(e) => setMarkerLng(Number(e.target.value))}
					/>
				</Col>
				<Col
					span={8}
					style={{
						display: "flex",
						alignItems: "flex-end",
					}}
				>
					<Button type='primary' onClick={openLocationModal}>
						Open Map
					</Button>
				</Col>
			</Row>

			{/* MAP MODAL */}
			<Modal
				title='Select Property Coordinates'
				open={locationModalVisible}
				onOk={handleLocationModalOk}
				onCancel={handleLocationModalCancel}
				width={1000}
			>
				<div style={{ marginBottom: 16 }}>
					<Input
						placeholder='Type an address to geocode...'
						value={addressToGeocode}
						onChange={(e) => setAddressToGeocode(e.target.value)}
						style={{ marginBottom: 8 }}
					/>
					<Button onClick={handleAddressGeocode}>Geocode Address</Button>
				</div>
				<div style={{ marginBottom: 16 }}>
					<label style={{ marginRight: 8 }}>
						<input
							type='checkbox'
							checked={manualInputEnabled}
							onChange={(e) => setManualInputEnabled(e.target.checked)}
						/>
						<span style={{ marginLeft: 4 }}>Enter lat/lng manually?</span>
					</label>
					{manualInputEnabled && (
						<div style={{ marginTop: 8 }}>
							<Input
								placeholder='Latitude'
								type='number'
								style={{ marginBottom: 8 }}
								onChange={(e) => setManualLat(e.target.value)}
							/>
							<Input
								placeholder='Longitude'
								type='number'
								style={{ marginBottom: 8 }}
								onChange={(e) => setManualLng(e.target.value)}
							/>
							<Button onClick={handleManualSubmit}>Set Coordinates</Button>
						</div>
					)}
				</div>
				<LoadScript
					googleMapsApiKey={process.env.REACT_APP_MAPS_API_KEY || ""}
					onLoad={handleScriptLoad}
				>
					<GoogleMap
						mapContainerStyle={{ width: "100%", height: "500px" }}
						center={{ lat: markerLat, lng: markerLng }}
						zoom={6}
						onClick={handleMapClick}
						options={{ disableDoubleClickZoom: false }}
					>
						<Marker
							position={{ lat: markerLat, lng: markerLng }}
							draggable
							onDragEnd={(e) => {
								const newLat = e.latLng.lat();
								const newLng = e.latLng.lng();
								setMarkerLat(newLat);
								setMarkerLng(newLng);
							}}
						/>
					</GoogleMap>
				</LoadScript>
			</Modal>
		</Modal>
	);
};

export default UpdatePropertyModal;

/* ------------------ STYLES ------------------ */
const ErrorMsg = styled.div`
	background: #ffe5e5;
	color: #d8000c;
	padding: 0.75rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	font-weight: 600;
`;

const SectionTitle = styled.h3`
	font-weight: bold;
	margin-bottom: 10px;
	margin-top: 24px;
	color: var(--primary-color-dark);
`;

const CloseAreasList = styled.ul`
	list-style: none;
	padding-left: 0;
	margin: 0;

	li {
		margin-bottom: 8px;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.areaLabel {
			flex: 1;
			margin-right: 8px;
		}
	}
`;
