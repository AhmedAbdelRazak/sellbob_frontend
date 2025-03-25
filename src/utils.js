/** @format */
import React from "react";
// Import whichever icons you need from Ant Design
import {
	HomeOutlined,
	ApartmentOutlined,
	HomeTwoTone,
	SafetyOutlined,
	BuildOutlined,
	KeyOutlined,
	LockOutlined,
	CrownOutlined,
	ThunderboltOutlined,
	CarOutlined,
	CustomerServiceOutlined,
	EyeOutlined,
	EnvironmentOutlined,
	DesktopOutlined,
	DollarOutlined,
	CalendarOutlined,
	BankOutlined,
	SmileOutlined,
	CoffeeOutlined,
	UsbOutlined,
	CarryOutOutlined,
	ReadOutlined,
	MedicineBoxOutlined,
	ShopOutlined,
	GatewayOutlined,
	CarTwoTone,
	HeatMapOutlined,
	PropertySafetyTwoTone,
} from "@ant-design/icons";
import { FaPlane, FaTrain } from "react-icons/fa";

/** ---------- PROPERTY TYPES ----------- */
export const propertyTypes = [
	{
		label: "Apartment",
		value: "apartment",
		icon: <ApartmentOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "House",
		value: "house",
		icon: <HomeOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "Shared Apartment",
		value: "shared apartment",
		icon: <HomeTwoTone twoToneColor='#fa541c' />,
	},
	{
		label: "Duplex",
		value: "duplex",
		icon: <BuildOutlined style={{ color: "#722ed1" }} />,
	},
];

/** ---------- PROPERTY STATUS ----------- */
export const propertyStatusOptions = [
	{
		label: "For Sale",
		value: "sale",
		icon: <DollarOutlined style={{ color: "#52c41a" }} />,
	},
	{
		label: "For Rent (Monthly)",
		value: "rent",
		icon: <CalendarOutlined style={{ color: "#eb2f96" }} />,
	},
];

/** ---------- AMENITIES LIST ----------- */
function VerticalAlignMiddleIcon() {
	// Stub for "Elevator" icon if you don't have an official AntD or React Icon
	return <span style={{ color: "#1890ff" }}>⇅</span>;
}

export const propertyAmenitiesList = [
	{
		label: "Elevator",
		icon: <VerticalAlignMiddleIcon />, // placeholder
	},
	{
		label: "Security",
		icon: <LockOutlined style={{ color: "#722ed1" }} />,
	},
	{
		label: "Swimming Pool",
		icon: <SmileOutlined style={{ color: "#13c2c2" }} />,
	},
	{
		label: "Gym",
		icon: <ThunderboltOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "Garden",
		icon: <CoffeeOutlined style={{ color: "#389e0d" }} />,
	},
	{
		label: "Playground",
		icon: <UsbOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "Concierge",
		icon: <CustomerServiceOutlined style={{ color: "#13c2c2" }} />,
	},
	{
		label: "Parking",
		icon: <CarOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "Backup Generator",
		icon: <CarryOutOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "Satellite/Cable TV",
		icon: <DesktopOutlined style={{ color: "#1890ff" }} />,
	},
];

/** ---------- VIEWS LIST ----------- */
export const propertyViewsList = [
	{
		label: "Sea View",
		icon: <EyeOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "Street View",
		icon: <BankOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "Garden View",
		icon: <CoffeeOutlined style={{ color: "#389e0d" }} />,
	},
	{
		label: "City View",
		icon: <EnvironmentOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "Mountain View",
		icon: <CrownOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "Pool View",
		icon: <SmileOutlined style={{ color: "#13c2c2" }} />,
	},
	{
		label: "Courtyard View",
		icon: <HomeOutlined style={{ color: "#722ed1" }} />,
	},
];

/** ---------- ROOM TYPES ----------- */
export const roomTypes = [
	{
		label: "living room",
		icon: <HomeOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "bedroom",
		icon: <KeyOutlined style={{ color: "#722ed1" }} />,
	},
	{
		label: "loft",
		icon: <BankOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "bathroom",
		icon: <SafetyOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "office room",
		icon: <DesktopOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "kitchen",
		icon: <CoffeeOutlined style={{ color: "#389e0d" }} />,
	},
	{
		label: "dining room",
		icon: <SmileOutlined style={{ color: "#13c2c2" }} />,
	},
	{
		label: "studio",
		icon: <UsbOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "guest room",
		icon: <CustomerServiceOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "maid’s room",
		icon: <LockOutlined style={{ color: "#722ed1" }} />,
	},
];

/** ---------- CLOSE AREAS LIST ----------- 
    Each 'label' can match a string in the property "closeAreas" array.
*/
export const closeAreasList = [
	{
		label: "School",
		icon: <ReadOutlined style={{ color: "#52c41a" }} />,
	},
	{
		label: "Hospital",
		icon: <MedicineBoxOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "Clinic",
		icon: <MedicineBoxOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "Gym",
		icon: <ThunderboltOutlined style={{ color: "#fa8c16" }} />,
	},
	{
		label: "Park",
		icon: <CoffeeOutlined style={{ color: "#389e0d" }} />,
	},
	{
		label: "Mall",
		icon: <ShopOutlined style={{ color: "#1890ff" }} />,
	},
	{
		label: "Restaurant",
		icon: <CoffeeOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "Bus Station",
		icon: <EnvironmentOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "Train Station",
		icon: <BankOutlined style={{ color: "#fa541c" }} />,
	},
	{
		label: "Pharmacy",
		icon: <MedicineBoxOutlined style={{ color: "#eb2f96" }} />,
	},
	{
		label: "University",
		icon: <ReadOutlined style={{ color: "#52c41a" }} />,
	},
	{
		label: "Gas Station",
		icon: <GatewayOutlined style={{ color: "darkred" }} />,
	},

	{
		label: "Bus Station",
		icon: <CarTwoTone style={{ color: "darkblue" }} />,
	},

	{
		label: "Train Station",
		icon: <FaTrain style={{ color: "darkblue" }} />,
	},

	{
		label: "Nursing",
		icon: <HeatMapOutlined style={{ color: "darkyellow" }} />,
	},

	{
		label: "Nurse",
		icon: <HeatMapOutlined style={{ color: "darkyellow" }} />,
	},

	{
		label: "Airport",
		icon: <FaPlane style={{ color: "darkgrey" }} />,
	},

	{
		label: "District",
		icon: <PropertySafetyTwoTone style={{ color: "darkgrey" }} />,
	},
];
