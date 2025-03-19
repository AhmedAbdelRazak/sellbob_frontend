import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { signup, authenticate, isAuthenticated, signin } from "../auth";
import { Redirect } from "react-router-dom";

/* 
   NOTE: 
   - phone is mandatory in this example. If you want phone optional, 
     adjust the validation accordingly.
   - You must have "signup", "signin", "authenticate" properly implemented in "../auth".
*/

const ListYourProperty = () => {
	// FORM FIELDS
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// SHOW/HIDE PASSWORD
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// ERRORS
	const [errors, setErrors] = useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	// SERVER ERROR: If signup/signin fails, we display here
	const [serverError, setServerError] = useState("");

	// LOADING: to show spinner overlay
	const [loading, setLoading] = useState(false);

	// FIELD-BY-FIELD VALIDATIONS ON BLUR
	const handleBlur = (fieldName) => {
		switch (fieldName) {
			case "fullName":
				validateFullName();
				break;
			case "email":
				validateEmail();
				break;
			case "phone":
				validatePhone();
				break;
			case "password":
				validatePassword();
				break;
			case "confirmPassword":
				validateConfirmPassword();
				break;
			default:
				break;
		}
	};

	const validateFullName = () => {
		const trimmed = fullName.trim();
		const nameParts = trimmed.split(/\s+/);
		if (!trimmed) {
			setErrors((prev) => ({
				...prev,
				fullName: "Full Name is required",
			}));
		} else if (nameParts.length < 2) {
			setErrors((prev) => ({
				...prev,
				fullName: "Please enter your first and last name",
			}));
		} else {
			setErrors((prev) => ({ ...prev, fullName: "" }));
		}
	};

	const validateEmail = () => {
		if (!email.includes("@") || !email.includes(".com")) {
			setErrors((prev) => ({
				...prev,
				email: "Please enter a valid email (must contain '@' and '.com')",
			}));
		} else {
			setErrors((prev) => ({ ...prev, email: "" }));
		}
	};

	const validatePhone = () => {
		// phone should have min length 5, no spaces
		if (phone.length < 5) {
			setErrors((prev) => ({
				...prev,
				phone: "Phone number should be at least 5 characters",
			}));
		} else {
			setErrors((prev) => ({ ...prev, phone: "" }));
		}
	};

	const validatePassword = () => {
		if (password.length < 5) {
			setErrors((prev) => ({
				...prev,
				password: "Password should be at least 5 characters",
			}));
		} else {
			setErrors((prev) => ({ ...prev, password: "" }));
		}
	};

	const validateConfirmPassword = () => {
		if (confirmPassword !== password) {
			setErrors((prev) => ({
				...prev,
				confirmPassword: "Passwords do not match",
			}));
		} else {
			setErrors((prev) => ({ ...prev, confirmPassword: "" }));
		}
	};

	// Remove spaces from phone
	const handlePhoneChange = (e) => {
		const input = e.target.value.replace(/\s/g, "");
		setPhone(input);
	};

	// REDIRECT IF ALREADY AUTHENTICATED
	const redirectUser = () => {
		if (isAuthenticated()) {
			return <Redirect to='/' />;
		}
	};

	// ------------------------------
	//        SUBMIT HANDLER
	// ------------------------------
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Clear any previous server error
		setServerError("");

		// Validate all fields
		validateFullName();
		validateEmail();
		validatePhone();
		validatePassword();
		validateConfirmPassword();

		// If any local errors remain or required fields are empty, stop
		const anyError = Object.values(errors).some((err) => err !== "");
		if (
			anyError ||
			!fullName ||
			!email ||
			!phone ||
			!password ||
			!confirmPassword
		) {
			return;
		}

		// Additional final checks (optional)
		// For example: password length >= 6, or phone formatting, etc.
		// We'll skip them here, or you can add them as needed

		// Everything is valid => show spinner for user feedback
		setLoading(true);

		try {
			// 1) SIGNUP
			const signupData = await signup({
				name: fullName,
				role: 2000,
				email,
				phone,
				password,
			});

			if (signupData.error) {
				// If signup fails, hide spinner & show error
				setLoading(false);
				setServerError(signupData.error);
				return;
			}

			// 2) SIGNIN
			const signinData = await signin({ emailOrPhone: email, password });
			if (signinData.error) {
				setLoading(false);
				setServerError(signinData.error);
				return;
			}

			// 3) AUTHENTICATE (store token/user in localStorage or cookie)
			authenticate(signinData, () => {
				// do nothing special here
			});

			// Wait 2 seconds while showing "Registering..."
			setTimeout(() => {
				window.location.href = "/agent/dashboard";
			}, 2000);
		} catch (err) {
			setLoading(false);
			setServerError(err.message || "Something went wrong. Please try again.");
		}
	};

	return (
		<>
			{/* If already authenticated, redirect */}
			{redirectUser()}

			{/* Loading Overlay: only visible if loading == true */}
			{loading && (
				<Overlay>
					<Spinner />
					<RegisteringText>Registering...</RegisteringText>
				</Overlay>
			)}

			<FormContainer>
				{/* SERVER ERROR MESSAGE (if any) */}
				{serverError && <ServerError>{serverError}</ServerError>}

				<FormTitle>List Your Property</FormTitle>
				<Subtitle>
					We are pleased to offer you our world-class platform for showcasing
					your property to thousands of prospective clients.
				</Subtitle>

				<StyledForm onSubmit={handleSubmit}>
					{/* Full Name */}
					<FormGroup>
						<Label htmlFor='fullName'>Full Name</Label>
						<Input
							id='fullName'
							type='text'
							placeholder='e.g. John Doe'
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							onBlur={() => handleBlur("fullName")}
						/>
						{errors.fullName && <ErrorMsg>{errors.fullName}</ErrorMsg>}
					</FormGroup>

					{/* Email */}
					<FormGroup>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							type='email'
							placeholder='e.g. john@example.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onBlur={() => handleBlur("email")}
						/>
						{errors.email && <ErrorMsg>{errors.email}</ErrorMsg>}
					</FormGroup>

					{/* Phone */}
					<FormGroup>
						<Label htmlFor='phone'>Phone</Label>
						<Input
							id='phone'
							type='text'
							placeholder='e.g. 1234567'
							value={phone}
							onChange={handlePhoneChange}
							onBlur={() => handleBlur("phone")}
						/>
						{errors.phone && <ErrorMsg>{errors.phone}</ErrorMsg>}
					</FormGroup>

					{/* Password */}
					<FormGroup>
						<Label htmlFor='password'>Password</Label>
						<PasswordWrapper>
							<Input
								id='password'
								type={showPassword ? "text" : "password"}
								placeholder='Enter password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onBlur={() => handleBlur("password")}
							/>
							<EyeIcon
								type='button'
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</EyeIcon>
						</PasswordWrapper>
						{errors.password && <ErrorMsg>{errors.password}</ErrorMsg>}
					</FormGroup>

					{/* Confirm Password */}
					<FormGroup>
						<Label htmlFor='confirmPassword'>Confirm Password</Label>
						<PasswordWrapper>
							<Input
								id='confirmPassword'
								type={showConfirmPassword ? "text" : "password"}
								placeholder='Re-enter password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								onBlur={() => handleBlur("confirmPassword")}
							/>
							<EyeIcon
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
							</EyeIcon>
						</PasswordWrapper>
						{errors.confirmPassword && (
							<ErrorMsg>{errors.confirmPassword}</ErrorMsg>
						)}
					</FormGroup>

					<SubmitButton type='submit'>Submit</SubmitButton>
				</StyledForm>
			</FormContainer>
		</>
	);
};

/* --------------------------------------
          STYLED COMPONENTS
-------------------------------------- */

// Container for entire form
const FormContainer = styled.div`
	max-width: 600px;
	margin: 2rem auto;
	background: white;
	box-shadow: var(--box-shadow-light);
	border-radius: 8px;
	padding: 1.5rem;

	@media (max-width: 600px) {
		margin: 1rem;
		padding: 1rem;
	}
`;

// Title, subtitle, etc.
const FormTitle = styled.h2`
	text-align: center;
	color: var(--primary-color-dark);
	margin-bottom: 0.5rem;
	font-weight: bold;
`;

const Subtitle = styled.p`
	text-align: center;
	color: var(--text-color-secondary);
	font-size: 0.95rem;
	margin-bottom: 1.5rem;
	line-height: 1.4;
`;

// The form itself
const StyledForm = styled.form`
	display: flex;
	flex-direction: column;
`;

const FormGroup = styled.div`
	margin-bottom: 1rem;
`;

const Label = styled.label`
	display: block;
	margin-bottom: 0.3rem;
	color: var(--text-color-dark);
	font-weight: 600;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.6rem;
	border: 1px solid var(--border-color-light);
	border-radius: 4px;
	font-size: 1rem;
	outline: none;
	transition: var(--main-transition);

	&:focus {
		border-color: var(--primary-color-light);
		box-shadow: 0 0 0 2px rgba(32, 33, 44, 0.2);
	}
`;

const PasswordWrapper = styled.div`
	position: relative;
`;

const EyeIcon = styled.button`
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: var(--darkGrey);
	cursor: pointer;
	font-size: 1.2rem;
	display: flex;
	align-items: center;

	&:hover {
		color: var(--primary-color);
	}
`;

const ErrorMsg = styled.span`
	display: block;
	color: red;
	margin-top: 0.3rem;
	font-size: 0.875rem;
`;

const SubmitButton = styled.button`
	background: var(--button-bg-primary);
	color: var(--button-font-color);
	font-weight: 600;
	padding: 0.75rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: var(--main-transition);
	font-size: 1rem;
	margin-top: 0.5rem;

	&:hover {
		background: var(--primary-color-light);
	}

	&:active {
		transform: scale(0.98);
	}
`;

// SERVER ERROR display
const ServerError = styled.div`
	background: #ffe5e5;
	color: #d8000c;
	padding: 0.75rem 1rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	font-weight: 600;
`;

/* -----------------------
   LOADING OVERLAY + SPINNER
------------------------ */
const Overlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 9999; /* on top of everything */
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const spinAnimation = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
	width: 60px;
	height: 60px;
	border: 6px solid var(--neutral-light);
	border-top: 6px solid var(--primary-color);
	border-radius: 50%;
	animation: ${spinAnimation} 1s linear infinite;
	margin-bottom: 1rem;
`;

const RegisteringText = styled.div`
	color: var(--primary-color);
	font-size: 1.1rem;
	font-weight: bold;
`;

export default ListYourProperty;
