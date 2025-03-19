/** @format */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { isAuthenticated } from "../../auth";
import { createNewAppointment, updateAppointment } from "../apiAgent";

// antd + dayjs
import {
	Form,
	Input,
	Select,
	DatePicker,
	TimePicker,
	Button,
	Row,
	Col,
	message, // <-- Import message from Ant Design
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;

const NewAppointmentForm = ({
	existingAppt,
	onSave, // callback prop invoked upon successful create/update
	agentProperties = [],
	userId,
}) => {
	const { user, token } = isAuthenticated();
	const isUpdating = !!existingAppt?._id;

	// We'll store the initial form values in state or build them on the fly
	const [initialValues] = useState(() => {
		if (existingAppt) {
			return {
				propertyId: existingAppt.propertyId || "",
				propertyName: existingAppt.propertyName || "",
				agentName: existingAppt.agentName || user?.name || "",
				agentId: userId || existingAppt.agentId || user._id,
				clientName: existingAppt.clientName || "",
				phone: existingAppt.phone || "",
				email: existingAppt.email || "",
				appointmentDate: existingAppt.appointmentDate
					? dayjs(existingAppt.appointmentDate)
					: null,
				appointmentTime: existingAppt.appointmentTime
					? dayjs(existingAppt.appointmentTime, "HH:mm")
					: null,
				appointmentStatus: existingAppt.appointmentStatus || "pending",
				notes: existingAppt.notes || "",
			};
		}
		// New appointment defaults
		return {
			propertyId: "",
			propertyName: "",
			agentName: user?.name || "",
			agentId: userId || user._id,
			clientName: "",
			phone: "",
			email: "",
			appointmentDate: null,
			appointmentTime: null,
			appointmentStatus: "pending",
			notes: "",
		};
	});

	// antd Form instance to programmatically reset or set fields
	const [form] = Form.useForm();

	useEffect(() => {
		if (existingAppt) {
			form.setFieldsValue(initialValues);
		}
	}, [existingAppt, form, initialValues]);

	// When the user selects a property from the dropdown, we also store propertyName
	const handlePropertyChange = (selectedPropertyId) => {
		const prop = agentProperties.find((p) => p._id === selectedPropertyId);
		form.setFieldsValue({
			propertyId: selectedPropertyId,
			propertyName: prop ? prop.propertyName : "",
		});
	};

	const onFinish = (values) => {
		// Convert dayjs objects to strings
		let finalData = { ...values };

		if (values.appointmentDate) {
			finalData.appointmentDate = values.appointmentDate.format("YYYY-MM-DD");
		}
		if (values.appointmentTime) {
			// store the time in HH:mm or 10:00 AM format
			finalData.appointmentTime = values.appointmentTime.format("HH:mm");
		}

		if (isUpdating) {
			// Updating
			const apptId = existingAppt._id;
			updateAppointment(user._id, token, apptId, finalData).then((res) => {
				if (res && !res.error) {
					message.success("Appointment updated successfully!");
					if (typeof onSave === "function") onSave(res);
				} else {
					message.error("Error updating appointment");
				}
			});
		} else {
			// Creating new
			createNewAppointment(user._id, token, finalData).then((res) => {
				if (res && !res.error) {
					message.success("Appointment created successfully!");
					if (typeof onSave === "function") onSave(res);
					// reset the form
					form.resetFields();
				} else {
					message.error("Error creating appointment");
				}
			});
		}
	};

	return (
		<FormWrapper>
			<h3>{isUpdating ? "Update Appointment" : "New Appointment"}</h3>

			<Form
				form={form}
				layout='vertical'
				initialValues={initialValues}
				onFinish={onFinish}
			>
				{/* Hidden fields for agentId and propertyName */}
				<Form.Item name='agentId' hidden>
					<Input type='hidden' />
				</Form.Item>

				<Form.Item name='propertyName' hidden>
					<Input type='hidden' />
				</Form.Item>

				{/* First Row */}
				<Row gutter={16}>
					<Col xs={24} md={8}>
						<Form.Item
							label='Select Property'
							name='propertyId'
							rules={[{ required: false }]}
						>
							<Select
								placeholder='-- Select --'
								onChange={handlePropertyChange}
								allowClear
							>
								{agentProperties.map((prop) => (
									<Option key={prop._id} value={prop._id}>
										{prop.propertyName}
									</Option>
								))}
							</Select>
						</Form.Item>
					</Col>

					<Col xs={24} md={8}>
						<Form.Item
							label='Agent Name'
							name='agentName'
							rules={[{ required: true, message: "Agent name is required" }]}
						>
							<Input placeholder='Agent Name' />
						</Form.Item>
					</Col>

					<Col xs={24} md={8}>
						<Form.Item label='Client Name' name='clientName'>
							<Input placeholder='Client Name' />
						</Form.Item>
					</Col>
				</Row>

				{/* Second Row */}
				<Row gutter={16}>
					<Col xs={24} md={8}>
						<Form.Item label='Phone' name='phone'>
							<Input placeholder='e.g. +971-xxx-xxxxxx' />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item label='Email' name='email'>
							<Input placeholder='client@example.com' />
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item label='Appointment Date' name='appointmentDate'>
							<DatePicker
								style={{ width: "100%" }}
								format='YYYY-MM-DD'
								placeholder='Select date'
							/>
						</Form.Item>
					</Col>
				</Row>

				{/* Third Row */}
				<Row gutter={16}>
					<Col xs={24} md={8}>
						<Form.Item label='Appointment Time' name='appointmentTime'>
							<TimePicker
								style={{ width: "100%" }}
								use12Hours
								format='h:mm A'
								placeholder='Select time'
							/>
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item
							label='Status'
							name='appointmentStatus'
							rules={[{ required: true }]}
						>
							<Select>
								<Option value='pending'>Pending</Option>
								<Option value='confirmed'>Confirmed</Option>
								<Option value='completed'>Completed</Option>
								<Option value='cancelled'>Cancelled</Option>
							</Select>
						</Form.Item>
					</Col>
					<Col xs={24} md={8}>
						<Form.Item label='Notes' name='notes'>
							<Input.TextArea rows={2} placeholder='Any extra details...' />
						</Form.Item>
					</Col>
				</Row>

				{/* Submit Button Row */}
				<Form.Item style={{ textAlign: "right", marginTop: "1rem" }}>
					<Button type='primary' htmlType='submit'>
						{isUpdating ? "Update Appointment" : "Create Appointment"}
					</Button>
				</Form.Item>
			</Form>
		</FormWrapper>
	);
};

export default NewAppointmentForm;

/* ------------- STYLED COMPONENTS ------------- */
const FormWrapper = styled.div`
	max-width: 900px;
	margin: 0 auto;
	background: var(--mainWhite);
	padding: 1rem;
	border: 1px solid var(--border-color-light);
	border-radius: 8px;
	box-shadow: var(--box-shadow-light);

	h3 {
		margin-bottom: 1rem;
		color: var(--text-color-dark);
	}
`;
