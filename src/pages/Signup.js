import React, { useState } from "react";
import styled from "styled-components";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { FaFacebookF, FaGoogle } from "react-icons/fa";

const Signup = () => {
	// FORM FIELDS
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState(""); // Optional
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

	// BLUR VALIDATION HANDLER
	const handleBlur = (fieldName) => {
		switch (fieldName) {
			case "fullName":
				validateFullName();
				break;
			case "email":
				validateEmail();
				break;
			case "phone":
				validatePhone(); // phone optional, but check if typed
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

	// VALIDATORS
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
				fullName: "Please enter first and last name",
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
		// Optional: only validate if user typed something
		if (phone) {
			if (phone.length < 5) {
				setErrors((prev) => ({
					...prev,
					phone: "Phone must be at least 5 characters (if provided)",
				}));
			} else {
				setErrors((prev) => ({ ...prev, phone: "" }));
			}
		} else {
			// phone is optional, no error if empty
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

	// CLEAN PHONE INPUT (removing spaces) on each change
	const handlePhoneChange = (e) => {
		const input = e.target.value.replace(/\s/g, "");
		setPhone(input);
	};

	// SUBMIT HANDLER
	const handleSubmit = (e) => {
		e.preventDefault();
		// Trigger all validations
		validateFullName();
		validateEmail();
		validatePhone();
		validatePassword();
		validateConfirmPassword();

		// If any errors remain or required fields are blank, block submission
		const anyError = Object.values(errors).some((err) => err !== "");
		if (anyError || !fullName || !email || !password || !confirmPassword) {
			return;
		}

		// All good => sign up logic here
		console.log("User signing up...");
		console.table({ fullName, email, phone });
	};

	// SOCIAL SIGNUP HANDLERS
	const handleGoogleSignup = () => {
		console.log("Google signup flow triggered");
	};

	const handleFacebookSignup = () => {
		console.log("Facebook signup flow triggered");
	};

	return (
		<SignupWrapper>
			<FormContainer>
				<FormTitle>Create an Account</FormTitle>
				<Subtitle>
					Join us today! Sign up to explore the best real estate deals.
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

					{/* Email (required) */}
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

					{/* Phone (optional) */}
					<FormGroup>
						<Label htmlFor='phone'>Phone (Optional)</Label>
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

					<SubmitButton type='submit'>Sign Up</SubmitButton>
				</StyledForm>

				<OrDivider>OR</OrDivider>

				{/* Social sign-ups */}
				<SocialButtons>
					<GoogleButton onClick={handleGoogleSignup}>
						<FaGoogle style={{ marginRight: "8px" }} />
						Sign up with Google
					</GoogleButton>

					<FacebookButton onClick={handleFacebookSignup}>
						<FaFacebookF style={{ marginRight: "8px" }} />
						Sign up with Facebook
					</FacebookButton>
				</SocialButtons>
			</FormContainer>
		</SignupWrapper>
	);
};

export default Signup;

/* -------------------------------------- */
/*          STYLED COMPONENTS            */
/* -------------------------------------- */

const SignupWrapper = styled.div`
	min-height: 80vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--neutral-light);
	padding: 2rem;
`;

const FormContainer = styled.div`
	width: 100%;
	max-width: 600px;
	background: var(--accent-color-2);
	box-shadow: var(--box-shadow-light);
	border-radius: 8px;
	padding: 1rem;

	@media (max-width: 600px) {
		margin: 1rem;
		padding: 1rem;
	}
`;

const FormTitle = styled.h2`
	text-align: center;
	color: var(--primary-color-dark);
	margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
	text-align: center;
	color: var(--text-color-secondary);
	margin-bottom: 1.5rem;
	font-size: 0.95rem;
`;

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

const OrDivider = styled.div`
	text-align: center;
	font-weight: 600;
	color: var(--darkGrey);
	margin: 1.5rem 0 1rem;
`;

const SocialButtons = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

/* Google button */
const GoogleButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	background: #db4437; /* Google's brand color */
	color: #fff;
	font-size: 0.95rem;
	font-weight: 600;
	padding: 0.75rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: var(--main-transition);

	&:hover {
		background: #c33c31;
	}

	&:active {
		transform: scale(0.98);
	}
`;

/* Facebook button */
const FacebookButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	background: #4267b2; /* Facebook brand color */
	color: #fff;
	font-size: 0.95rem;
	font-weight: 600;
	padding: 0.75rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: var(--main-transition);

	&:hover {
		background: #375694;
	}

	&:active {
		transform: scale(0.98);
	}
`;
