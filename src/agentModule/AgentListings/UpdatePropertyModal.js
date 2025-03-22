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
import { GoogleMap, MarkerF, LoadScript } from "@react-google-maps/api";
import { InfoCircleOutlined } from "@ant-design/icons";

import { isAuthenticated } from "../../auth";
import { updateProperty } from "../apiAgent";
import ImageCardMain from "./ImageCardMain";
import { indianStatesArray } from "../utils";

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

	// ---------- FORM FIELDS ----------
	const [propertyName, setPropertyName] = useState("");
	const [propertyName_OtherLanguage, setPropertyName_OtherLanguage] =
		useState("");
	const [propertyState, setPropertyState] = useState("");
	const [propertyCity, setPropertyCity] = useState("");
	const [otherCityName, setOtherCityName] = useState("");
	const [propertyAddress, setPropertyAddress] = useState("");
	const [phone, setPhone] = useState("");
	const [propertyFloors, setPropertyFloors] = useState(1);
	const [overallRoomsCount, setOverallRoomsCount] = useState(1);
	const [bathRoomsCount, setBathRoomsCount] = useState(1);
	const [propertySizeObj, setPropertySizeObj] = useState({
		size: 0,
		unit: "square meter",
	});
	const [propertyTypeVal, setPropertyTypeVal] = useState("apartment");
	const [propertyStatus, setPropertyStatus] = useState("sale");
	const [propertyPrice, setPropertyPrice] = useState(0);
	const [propertyExtraFees, setPropertyExtraFees] = useState(0);
	const [aboutProperty, setAboutProperty] = useState("");
	const [aboutPropertyOtherLang, setAboutPropertyOtherLang] = useState("");
	const [propertyAmenities, setPropertyAmenities] = useState([]);
	const [propertyViews, setPropertyViews] = useState([]);
	const [closeAreas, setCloseAreas] = useState([]);
	const [singleCloseArea, setSingleCloseArea] = useState("");
	const [propertyPhotos, setPropertyPhotos] = useState([]);
	const [rooms, setRooms] = useState([]);

	// ---------- MAP FIELDS ----------
	const [markerLat, setMarkerLat] = useState(INDIA_COORDS.lat);
	const [markerLng, setMarkerLng] = useState(INDIA_COORDS.lng);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
	const [manualLat, setManualLat] = useState("");
	const [manualLng, setManualLng] = useState("");
	const [manualInputEnabled, setManualInputEnabled] = useState(false);
	const [addressToGeocode, setAddressToGeocode] = useState("");
	const geocoderRef = useRef(null);

	// Map center & zoom for better UX
	// eslint-disable-next-line
	const [mapCenter, setMapCenter] = useState(INDIA_COORDS);
	const [mapZoom, setMapZoom] = useState(5);

	// ---------- LOADING / ERROR ----------
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	// City dropdown
	const [cityOptions, setCityOptions] = useState([]);
	const [customCityOption, setCustomCityOption] = useState(null);

	// Guard to skip certain effects while populating
	const [isFillingForm, setIsFillingForm] = useState(false);

	// Build stateOptions from the array
	const stateOptions = indianStatesArray.map((st) => ({
		label: st.name,
		value: st.name,
	}));

	// ---------- 1) Populate from DB ----------
	useEffect(() => {
		if (!property) return;
		setIsFillingForm(true);

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

		setPropertySizeObj(
			property.propertySize || { size: 0, unit: "square meter" }
		);

		setPropertyTypeVal(property.propertyType || "apartment");
		setPropertyStatus(property.propertyStatus || "sale");
		setPropertyPrice(property.propertyPrice || 0);
		setPropertyExtraFees(property.propertyExtraFees || 0);
		setAboutProperty(property.aboutProperty || "");
		setAboutPropertyOtherLang(property.aboutPropertyOtherLanguange || "");
		setPropertyAmenities(property.amenities || []);
		setPropertyViews(property.views || []);
		setCloseAreas(property.closeAreas || []);
		setPropertyPhotos(property.propertyPhotos || []);

		if (Array.isArray(property.roomCountDetails)) {
			const normalizedRooms = property.roomCountDetails.map((r) =>
				r._id ? r : { ...r, _id: generateLocalId() }
			);
			setRooms(normalizedRooms);
		} else {
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

		// Coordinates from DB
		const coords = property.location?.coordinates;
		if (
			Array.isArray(coords) &&
			coords.length === 2 &&
			!(coords[0] === 0 && coords[1] === 0)
		) {
			const dbLng = coords[0];
			const dbLat = coords[1];
			setMarkerLng(dbLng);
			setMarkerLat(dbLat);
			setMapCenter({ lat: dbLat, lng: dbLng });
			setMapZoom(13);
		} else {
			setMarkerLng(INDIA_COORDS.lng);
			setMarkerLat(INDIA_COORDS.lat);
			setMapCenter(INDIA_COORDS);
			setMapZoom(5);
		}

		setIsFillingForm(false);
	}, [property]);

	// ---------- 2) Watch propertyState => build city options ----------
	useEffect(() => {
		if (!propertyState) {
			setCityOptions([]);
			setCustomCityOption(null);
			setPropertyCity("");
			setOtherCityName("");
			return;
		}
		if (isFillingForm) return;

		const foundState = indianStatesArray.find(
			(s) => s.name.toLowerCase() === propertyState.toLowerCase()
		);
		if (!foundState) {
			setCityOptions([]);
			setCustomCityOption(null);
			return;
		}

		const majorCities = (foundState.majorCities || []).map((c) => ({
			label: c.name,
			value: c.name,
			lat: c.latitude,
			lng: c.longitude,
		}));
		majorCities.push({ label: "Other", value: "other" });
		setCityOptions(majorCities);
		setCustomCityOption(null);
	}, [propertyState, isFillingForm]);

	// ---------- 3) After city from DB, check recognized or custom ----------
	useEffect(() => {
		if (!property || !propertyState) return;
		if (isFillingForm) return;

		setIsFillingForm(true);

		const originalCity = property.propertyCity || "";
		if (!originalCity) {
			setIsFillingForm(false);
			return;
		}

		const foundState = indianStatesArray.find(
			(s) => s.name.toLowerCase() === propertyState.toLowerCase()
		);
		if (!foundState) {
			setCustomCityOption({
				label: originalCity,
				value: originalCity,
			});
			setCityOptions([
				{ label: originalCity, value: originalCity },
				{ label: "Other", value: "other" },
			]);
			setPropertyCity(originalCity);
			setIsFillingForm(false);
			return;
		}

		const majorCities = (foundState.majorCities || []).map((c) => ({
			label: c.name,
			value: c.name,
			lat: c.latitude,
			lng: c.longitude,
		}));
		majorCities.push({ label: "Other", value: "other" });

		const matchedCity = majorCities.find(
			(c) => c.value.toLowerCase() === originalCity.toLowerCase()
		);

		if (matchedCity) {
			setCityOptions(majorCities);
			setPropertyCity(matchedCity.value);
			setCustomCityOption(null);
		} else {
			const customOption = { label: originalCity, value: originalCity };
			setCustomCityOption(customOption);
			setCityOptions([customOption, ...majorCities]);
			setPropertyCity(originalCity);
		}

		setIsFillingForm(false);
	}, [property, propertyState, isFillingForm]);

	// ---------- HANDLERS ----------
	const handleStateChange = (val) => {
		setPropertyState(val);
		if (!val) {
			setCityOptions([]);
			setCustomCityOption(null);
			setPropertyCity("");
			setOtherCityName("");
			setMarkerLat(INDIA_COORDS.lat);
			setMarkerLng(INDIA_COORDS.lng);
			setMapCenter(INDIA_COORDS);
			setMapZoom(5);
			return;
		}
		const found = indianStatesArray.find(
			(s) => s.name.toLowerCase() === val.toLowerCase()
		);
		if (found) {
			setMarkerLat(found.latitude || INDIA_COORDS.lat);
			setMarkerLng(found.longitude || INDIA_COORDS.lng);
			setMapCenter({
				lat: found.latitude || INDIA_COORDS.lat,
				lng: found.longitude || INDIA_COORDS.lng,
			});
			setMapZoom(6);
		} else {
			setMarkerLat(INDIA_COORDS.lat);
			setMarkerLng(INDIA_COORDS.lng);
			setMapCenter(INDIA_COORDS);
			setMapZoom(5);
		}
		setPropertyCity("");
		setOtherCityName("");
	};

	const handleCityChange = (val) => {
		setPropertyCity(val);
		if (!val || val === "other") return;
		if (customCityOption && val === customCityOption.value) return;

		const found = cityOptions.find(
			(item) => item.value.toLowerCase() === val.toLowerCase()
		);
		if (found && found.lat && found.lng) {
			setMarkerLat(found.lat);
			setMarkerLng(found.lng);
			setMapCenter({ lat: found.lat, lng: found.lng });
			setMapZoom(10);
		}
	};

	// ---------- MAP UTILITIES ----------
	const handleScriptLoad = () => {
		if (window.google && window.google.maps && !geocoderRef.current) {
			geocoderRef.current = new window.google.maps.Geocoder();
		}
	};

	const openLocationModal = () => setLocationModalVisible(true);
	const handleLocationModalOk = () => setLocationModalVisible(false);
	const handleLocationModalCancel = () => setLocationModalVisible(false);

	const handleMapClick = (e) => {
		const lat = e.latLng.lat();
		const lng = e.latLng.lng();
		setMarkerLat(lat);
		setMarkerLng(lng);
		setMapCenter({ lat, lng });
	};

	const handleAddressGeocode = () => {
		if (!geocoderRef.current) {
			return message.error("Geocoder not ready.");
		}
		geocoderRef.current.geocode(
			{ address: addressToGeocode },
			(results, status) => {
				if (status === "OK" && results[0]) {
					const loc = results[0].geometry.location;
					const lat = loc.lat();
					const lng = loc.lng();
					setMarkerLat(lat);
					setMarkerLng(lng);
					setMapCenter({ lat, lng });
					setMapZoom(14);
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
		setMapCenter({ lat, lng });
		setMapZoom(14);
		message.success("Manual coordinates set!");
	};

	// ---------- CLOSE AREAS ----------
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

	// ---------- ROOMS ----------
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

	// ---------- SUBMIT ----------
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
			return message.error("Please select a city or type one.");
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
			propertyPrice,
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
						<Tooltip title='A short, catchy name for your property'>
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
						onChange={handleStateChange}
						options={stateOptions}
						optionFilterProp='label'
						allowClear
					/>
				</Col>

				<Col span={8}>
					<label style={{ display: "block" }}>
						City
						<Tooltip title='Pick one of the major cities or "Other" to type manually.'>
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
						onChange={handleCityChange}
						options={cityOptions}
						optionFilterProp='label'
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
						<Tooltip title='Contact phone number'>
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
						<Tooltip title='How many floors in the property?'>
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
						<Tooltip title='How many bedrooms does this property have?'>
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

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Bathrooms Count
						<Tooltip title='Number of bathrooms'>
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
						Property Size (sq. meter)
						<Tooltip title='Total size of the property in sqm'>
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

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Property Type
						<Tooltip title='Apartment, House, etc.'>
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
						<Tooltip title='Sale or Rent'>
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
									: "Enter total sale price (in RUPEE)"
							}
						>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red" }}>*</span>
					</label>
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
						<Tooltip title='Any additional monthly charges'>
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

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<label style={{ display: "block" }}>
						About Property (English)
						<Tooltip title="Short description e.g. 'Lovely property in prime area'">
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
						<Tooltip title='Optional Hindi description'>
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

			<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
				<Col span={12}>
					<label style={{ display: "block" }}>
						Property Amenities
						<Tooltip title='Parking, elevator, gym, etc.'>
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
						<Tooltip title='Scenic views: sea, mountain, etc.'>
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
								<Tooltip title='e.g. "living room", "bedroom", "kitchen", etc.'>
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

			{/* LOCATION COORDS */}
			<SectionTitle style={{ marginTop: 24 }}>
				Location Coordinates
			</SectionTitle>
			<Row gutter={[16, 16]}>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Latitude
						<Tooltip title='Latitude on the map'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						type='number'
						step='0.000001'
						value={markerLat}
						onChange={(e) => {
							const val = e.target.value;
							setMarkerLat(val);
							setMapCenter((c) => ({ ...c, lat: val }));
						}}
					/>
				</Col>
				<Col span={8}>
					<label style={{ display: "block" }}>
						Longitude
						<Tooltip title='Longitude on the map'>
							<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
						</Tooltip>
						<span style={{ color: "red", marginLeft: 4 }}>*</span>
					</label>
					<Input
						type='number'
						step='0.000001'
						value={markerLng}
						onChange={(e) => {
							const val = e.target.value;
							setMarkerLng(val);
							setMapCenter((c) => ({ ...c, lng: val }));
						}}
					/>
				</Col>
				<Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
					<Button type='primary' onClick={openLocationModal}>
						Open Map
					</Button>
				</Col>
			</Row>

			{/* MAP MODAL */}

			{process.env.REACT_APP_MAPS_API_KEY &&
				parseFloat(markerLat) &&
				parseFloat(markerLng) && (
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
								center={{
									lat: parseFloat(markerLat) || INDIA_COORDS.lat,
									lng: parseFloat(markerLng) || INDIA_COORDS.lng,
								}}
								zoom={mapZoom}
								onClick={handleMapClick}
								options={{ disableDoubleClickZoom: false }}
							>
								{/* This Marker uses parseFloat just like your SingleHotel example */}
								<MarkerF
									position={{
										lat: parseFloat(markerLat) || INDIA_COORDS.lat,
										lng: parseFloat(markerLng) || INDIA_COORDS.lng,
									}}
									draggable
									onDragEnd={(e) => {
										const newLat = e.latLng.lat();
										const newLng = e.latLng.lng();
										setMarkerLat(newLat);
										setMarkerLng(newLng);
										setMapCenter({ lat: newLat, lng: newLng });
									}}
								/>
							</GoogleMap>
						</LoadScript>
					</Modal>
				)}
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
