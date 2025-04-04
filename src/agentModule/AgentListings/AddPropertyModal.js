/** @format */
import React, { useState, useRef, useEffect } from "react";
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
import { useLocation, useHistory } from "react-router-dom";
import { InfoCircleOutlined } from "@ant-design/icons";

import { isAuthenticated } from "../../auth";
import { createNewProperty } from "../apiAgent";
import ImageCardMain from "./ImageCardMain";

// Make sure your path/filename is correct here:
import {
	indianStatesArray,
	closeAreasList, // We need to import the closeAreasList from utils
} from "../utils";

const { TextArea } = Input;
const INDIA_COORDS = { lat: 20.5937, lng: 78.9629 };

/** 
  Example propertyTypes & propertyStatus, typically from utils or your definitions.
  Keeping them inline here for consistency.
*/
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
 * - visible (boolean) : controls modal
 * - onCancel (function) : closes modal
 * - onPropertyCreated (function) : optional callback if you want to handle created property
 */
const AddPropertyModal = ({ visible, onCancel, onPropertyCreated }) => {
	const { user, token } = isAuthenticated() || {};

	const [agentId, setAgentId] = useState("");
	const location = useLocation();
	const history = useHistory();

	useEffect(() => {
		if (!user || !token) return;
		const searchParams = new URLSearchParams(location.search);
		if (searchParams.has("agent")) {
			setAgentId(searchParams.get("agent"));
		} else {
			const fallbackAgent = user._id || "";
			searchParams.set("agent", fallbackAgent);
			history.replace({
				pathname: location.pathname,
				search: searchParams.toString(),
			});
			setAgentId(fallbackAgent);
		}
	}, [user, token, location, history]);

	// ---------- PROPERTY FIELDS ----------
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

	// bathrooms
	const [bathRoomsCount, setBathRoomsCount] = useState(1);

	// propertySize as an object
	const [propertySizeObj, setPropertySizeObj] = useState({
		size: 0,
		unit: "square meter",
	});

	const [propertyTypeVal, setPropertyTypeVal] = useState("apartment");
	const [propertyStatus, setPropertyStatus] = useState("sale");

	// Price & Fees
	const [propertyPrice, setPropertyPrice] = useState(0);
	const [propertyExtraFees, setPropertyExtraFees] = useState(0);

	const [aboutProperty, setAboutProperty] = useState("");
	const [aboutPropertyOtherLang, setAboutPropertyOtherLang] = useState("");

	const [propertyAmenities, setPropertyAmenities] = useState([]);
	const [propertyViews, setPropertyViews] = useState([]);

	// ---------- CLOSE AREAS ----------
	const [closeAreas, setCloseAreas] = useState([]);

	// NEW: For building a close area string
	const [selectedCloseAreaLabel, setSelectedCloseAreaLabel] = useState(""); // e.g. "School"
	const [customCloseAreaName, setCustomCloseAreaName] = useState(""); // e.g. "Mumbai Airport"
	const [closeAreaDistance, setCloseAreaDistance] = useState(""); // e.g. "1 mile"

	// ---------- PROPERTY-LEVEL PHOTOS ----------
	const [propertyPhotos, setPropertyPhotos] = useState([]);

	// ---------- ROOMS ----------
	const [rooms, setRooms] = useState([
		{
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

	// ---------- MAP & LOCATION ----------
	const [markerLat, setMarkerLat] = useState(INDIA_COORDS.lat);
	const [markerLng, setMarkerLng] = useState(INDIA_COORDS.lng);
	const [locationModalVisible, setLocationModalVisible] = useState(false);
	const [manualLat, setManualLat] = useState("");
	const [manualLng, setManualLng] = useState("");
	const [manualInputEnabled, setManualInputEnabled] = useState(false);
	const [addressToGeocode, setAddressToGeocode] = useState("");
	const geocoderRef = useRef(null);

	// LOADING / ERROR
	const [loading, setLoading] = useState(false);
	const [serverError, setServerError] = useState("");

	/** ----------------------------------
	 *   ON LOAD: PREP STATE DROPDOWN OPTIONS
	 ---------------------------------- */
	const stateOptions = indianStatesArray.map((st) => ({
		label: st.name,
		value: st.name,
	}));

	const [cityOptions, setCityOptions] = useState([]);
	useEffect(() => {
		if (!propertyState) {
			setCityOptions([]);
			return;
		}
		const foundState = indianStatesArray.find((s) => s.name === propertyState);
		if (foundState) {
			// set marker to state's lat/lng
			setMarkerLat(foundState.latitude);
			setMarkerLng(foundState.longitude);

			// build city options
			const transformed = (foundState.majorCities || []).map((cityObj) => ({
				label: cityObj.name,
				value: cityObj.name,
				lat: cityObj.latitude,
				lng: cityObj.longitude,
			}));

			// add an "Other" entry
			transformed.push({ label: "Other", value: "other" });
			setCityOptions(transformed);

			// reset city
			setPropertyCity("");
			setOtherCityName("");
		} else {
			setCityOptions([]);
		}
	}, [propertyState]);

	// If user picks a city from the dropdown, auto‐update lat/lng if not "Other"
	useEffect(() => {
		if (!propertyCity || propertyCity === "other") return;
		const chosenCity = cityOptions.find((c) => c.value === propertyCity);
		if (chosenCity) {
			setMarkerLat(chosenCity.lat);
			setMarkerLng(chosenCity.lng);
		}
	}, [propertyCity, cityOptions]);

	/** ----------------------------------
	 *   MAP / GEO SETUP
	 ---------------------------------- */
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

	/** ----------------------------------
	 *   CLOSE AREAS - ADJUSTED BUILDER
	 ---------------------------------- */
	const handleAddCloseArea = () => {
		if (!selectedCloseAreaLabel && !customCloseAreaName) {
			return message.error("Please select or enter a close area name.");
		}
		if (!closeAreaDistance.trim()) {
			return message.error("Please enter distance (e.g. '1 mile').");
		}

		// Always include the label from closeAreasList
		// If custom name is also provided, it goes first, e.g. "Hamada School"
		// If no custom name, we just use "School"
		const finalLabel = customCloseAreaName.trim()
			? `${customCloseAreaName.trim()} ${selectedCloseAreaLabel}`
			: selectedCloseAreaLabel;

		// If user didn't pick from the dropdown but typed custom only, fallback
		// e.g. if the user didn't choose "School" but typed "Doctor" + distance
		// we can do: "Doctor - 3 meters from property"
		// But you explicitly want the label too.
		// So let's ensure we have something for selectedCloseAreaLabel
		// if not provided.
		let labelToUse = finalLabel.trim();
		if (!labelToUse) {
			// fallback if user didn't pick a label from dropdown:
			labelToUse = customCloseAreaName.trim();
		}

		const finalString = `${labelToUse} - ${closeAreaDistance} from property`;

		setCloseAreas([...closeAreas, finalString]);

		// Reset
		setSelectedCloseAreaLabel("");
		setCustomCloseAreaName("");
		setCloseAreaDistance("");
	};

	const handleRemoveCloseArea = (idx) => {
		const updated = [...closeAreas];
		updated.splice(idx, 1);
		setCloseAreas(updated);
	};

	/** ----------------------------------
	 *   ROOMS
	 ---------------------------------- */
	const handleAddRoom = () => {
		setRooms([
			...rooms,
			{
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

	/** ----------------------------------
	 *   SUBMIT => CREATE PROPERTY
	 ---------------------------------- */
	const handleOk = async () => {
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

		// If city = 'other', ensure the user typed a city name
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

		// Build final property object
		const newProperty = {
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
			belongsTo: agentId,

			amenities: propertyAmenities,
			views: propertyViews,
			closeAreas, // array of strings
			propertyPhotos,

			// location
			location: {
				type: "Point",
				coordinates: [markerLng, markerLat],
			},

			// rooms
			roomCountDetails: rooms.map((r) => ({
				roomType: r.roomType || "",
				count: Number(r.count) || 1,
				roomSize: Number(r.roomSize) || 100,
				displayName: r.displayName || "",
				displayName_OtherLanguage: r.displayName_OtherLanguage || "",
				description: r.description || "",
				description_OtherLanguage: r.description_OtherLanguage || "",
				photos: r.photos || [],
				extraAmenities: [],
			})),
		};

		setLoading(true);
		setServerError("");
		try {
			const resp = await createNewProperty(agentId, token, newProperty);
			if (resp.error) {
				setServerError(resp.error);
				message.error(resp.error);
			} else {
				setTimeout(() => {
					window.location.reload(false);
				}, 1500);
				message.success("Property created successfully!");
				if (onPropertyCreated) {
					onPropertyCreated(resp);
				}
				resetForm();
				onCancel();
			}
		} catch (err) {
			console.error("Error creating property:", err);
			message.error("Failed to create property");
		} finally {
			setLoading(false);
		}
	};

	// Reset the form fields & states
	const resetForm = () => {
		setPropertyName("");
		setPropertyName_OtherLanguage("");
		setPropertyState("");
		setPropertyCity("");
		setOtherCityName("");
		setPropertyAddress("");
		setPhone("");
		setPropertyFloors(1);
		setOverallRoomsCount(1);
		setBathRoomsCount(1);
		setPropertySizeObj({ size: 0, unit: "square meter" });
		setPropertyTypeVal("apartment");
		setPropertyStatus("sale");
		setPropertyPrice(0);
		setPropertyExtraFees(0);
		setAboutProperty("");
		setAboutPropertyOtherLang("");
		setPropertyAmenities([]);
		setPropertyViews([]);
		setCloseAreas([]);
		setSelectedCloseAreaLabel("");
		setCustomCloseAreaName("");
		setCloseAreaDistance("");
		setPropertyPhotos([]);
		setRooms([
			{
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
		setMarkerLat(INDIA_COORDS.lat);
		setMarkerLng(INDIA_COORDS.lng);
	};

	return (
		<Modal
			title='Add New Property'
			open={visible}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			okText='Create Property'
			style={{ top: 20 }}
			width={1000}
		>
			{serverError && <ErrorMsg>{serverError}</ErrorMsg>}

			<form>
				{/* PROPERTY PHOTOS */}
				<SectionTitle>Property Photos</SectionTitle>
				<ImageCardMain
					propertyPhotos={propertyPhotos}
					setPropertyDetails={(prev) => {
						if (typeof prev === "function") {
							setPropertyPhotos((old) => {
								const newVal = prev({
									roomCountDetails: [],
									propertyPhotos: old,
								});
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
							<Tooltip title='Add a catchy name, e.g. "Amazing Duplex in Mumbai"'>
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
							<Tooltip title='If you want a Hindi name too'>
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
					{/* State SELECT */}
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

					{/* City SELECT + "Other" */}
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
							placeholder={
								propertyState ? "Select a city" : "Choose State first"
							}
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
							<Tooltip title='How many floors in the main property?'>
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
							<Tooltip title='How many bedrooms does it have?'>
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

				{/* Bathrooms & Property Size */}
				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Bathrooms Count
							<Tooltip title='How many bathrooms?'>
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

				{/* TYPE / STATUS / PRICE */}
				<Row gutter={[16, 16]} style={{ marginTop: 16 }}>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Property Type
							<Tooltip title='e.g. Apartment, House, etc.'>
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
							<Tooltip title='Is this property for sale or rent?'>
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
										? "Enter monthly rent cost in RUPEE"
										: "Enter the total sale price in RUPEE"
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
							<Tooltip title='e.g. maintenance fees, if any'>
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
							<Tooltip title='Short description in English'>
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
							<Tooltip title='Short description in Hindi'>
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
							<Tooltip title='Views like sea view, mountain view, etc.'>
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
				<SectionTitle style={{ marginTop: 24 }}>Close Areas</SectionTitle>

				{/* The new UI for picking a label, name, and distance */}
				<Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Close Area Type
							<Tooltip title='e.g. School, Hospital, etc. from utils'>
								<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
							</Tooltip>
						</label>
						<Select
							style={{ width: "100%" }}
							showSearch
							placeholder='Select e.g. "School"'
							value={selectedCloseAreaLabel || undefined}
							onChange={(val) => setSelectedCloseAreaLabel(val)}
							optionFilterProp='label'
							allowClear
						>
							{closeAreasList.map((areaObj) => (
								<Select.Option
									key={areaObj.label}
									value={areaObj.label}
									label={areaObj.label}
								>
									{areaObj.label}
								</Select.Option>
							))}
						</Select>
					</Col>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Custom Name (optional)
							<Tooltip title='If you want a custom name, e.g. "Hamada"'>
								<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
							</Tooltip>
						</label>
						<Input
							placeholder='e.g. "Mumbai Airport"'
							value={customCloseAreaName}
							onChange={(e) => setCustomCloseAreaName(e.target.value)}
						/>
					</Col>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Distance / Info
							<Tooltip title='e.g. "1 mile", "2.5 km", etc.'>
								<InfoCircleOutlined style={{ marginLeft: 8, color: "#999" }} />
							</Tooltip>
						</label>
						<Input
							placeholder='e.g. "1 mile"'
							value={closeAreaDistance}
							onChange={(e) => setCloseAreaDistance(e.target.value)}
							onPressEnter={(e) => {
								e.preventDefault();
								handleAddCloseArea();
							}}
						/>
					</Col>
				</Row>

				<Row>
					<Col span={24} style={{ textAlign: "right", marginBottom: 10 }}>
						<Button onClick={handleAddCloseArea}>Add Close Area</Button>
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
						key={idx}
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
									<Tooltip title='E.g. living room, bedroom, etc.'>
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
										const updated = [...rooms];
										updated[idx].roomType = val;
										setRooms(updated);
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
									<Tooltip title='Number of this room type'>
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
										const updated = [...rooms];
										updated[idx].count = val;
										setRooms(updated);
									}}
								/>
							</Col>
							<Col span={8}>
								<label style={{ display: "block" }}>
									Room Size (m²)
									<Tooltip title='Approx. size in square meters'>
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
										const updated = [...rooms];
										updated[idx].roomSize = val;
										setRooms(updated);
									}}
								/>
							</Col>
						</Row>

						<Row gutter={[16, 16]} style={{ marginTop: 10 }}>
							<Col span={8}>
								<label style={{ display: "block" }}>
									Display Name (English)
								</label>
								<Input
									placeholder='e.g. Master Bedroom'
									value={room.displayName}
									onChange={(e) => {
										const updated = [...rooms];
										updated[idx].displayName = e.target.value;
										setRooms(updated);
									}}
								/>
							</Col>
							<Col span={8}>
								<label style={{ display: "block" }}>Display Name (Hindi)</label>
								<Input
									placeholder='e.g. मास्टर बेडरूम'
									value={room.displayName_OtherLanguage}
									onChange={(e) => {
										const updated = [...rooms];
										updated[idx].displayName_OtherLanguage = e.target.value;
										setRooms(updated);
									}}
								/>
							</Col>
						</Row>

						<Row gutter={[16, 16]} style={{ marginTop: 10 }}>
							<Col span={8}>
								<label style={{ display: "block" }}>
									Description (English)
								</label>
								<TextArea
									rows={2}
									value={room.description}
									onChange={(e) => {
										const updated = [...rooms];
										updated[idx].description = e.target.value;
										setRooms(updated);
									}}
								/>
							</Col>
							<Col span={8}>
								<label style={{ display: "block" }}>Description (Hindi)</label>
								<TextArea
									rows={2}
									value={room.description_OtherLanguage}
									onChange={(e) => {
										const updated = [...rooms];
										updated[idx].description_OtherLanguage = e.target.value;
										setRooms(updated);
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
									setPropertyDetails={(prev) => {
										if (typeof prev === "function") {
											setRooms((oldRooms) => {
												const newRooms = [...oldRooms];
												const newVal = prev({
													roomCountDetails: [],
													propertyPhotos: newRooms[idx].photos,
												});
												newRooms[idx].photos = newVal.propertyPhotos || [];
												return newRooms;
											});
										} else {
											setRooms((oldRooms) => {
												const newRooms = [...oldRooms];
												newRooms[idx].photos = prev?.propertyPhotos || [];
												return newRooms;
											});
										}
									}}
									roomId={null}
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

				{/* LOCATION COORDINATES */}
				<SectionTitle style={{ marginTop: 24 }}>
					Location Coordinates
				</SectionTitle>
				<Row gutter={[16, 16]}>
					<Col span={8}>
						<label style={{ display: "block" }}>
							Latitude
							<Tooltip title='Latitude of the property location'>
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
							<Tooltip title='Longitude of the property location'>
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
					<Col span={8} style={{ display: "flex", alignItems: "flex-end" }}>
						<Button type='primary' onClick={openLocationModal}>
							Open Map
						</Button>
					</Col>
				</Row>
			</form>

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

export default AddPropertyModal;

/* ------------- STYLED COMPONENTS ------------- */
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
