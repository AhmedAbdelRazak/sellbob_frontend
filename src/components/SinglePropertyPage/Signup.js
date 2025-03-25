import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
// eslint-disable-next-line
import { FaFacebookF, FaUserAlt, FaPhoneAlt, FaLock } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { signup, signin, authenticate } from "../../auth";
// import { Redirect } from "react-router-dom";  // <-- No longer needed

/**
 * @param {object} props
 * @param {boolean} props.signInModalOpen - from parent, if you still need it
 * @param {function} props.setSignInModalOpen - from parent, if you still need it
 * @param {function} props.onToggleSignIn - a callback to toggle the sign-in form (new)
 */
const Signup = ({
	signInModalOpen,
	setSignInModalOpen,
	onToggleSignIn, // <-- new prop to toggle
}) => {
	// FORM FIELDS
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// SHOW/HIDE PASSWORD
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// FORM ERRORS
	const [errors, setErrors] = useState({
		fullName: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	// SERVER ERROR (backend error messages)
	const [serverError, setServerError] = useState("");

	// LOADING SPINNER
	const [loading, setLoading] = useState(false);

	// ----------------------------
	// 1) (Optional) store last path in localStorage
	// ----------------------------
	useEffect(() => {
		const referrer = document.referrer;
		if (referrer && referrer.includes(window.location.host)) {
			const path = referrer.split(window.location.host)[1];
			if (path && path !== "/signup" && path !== "/signin") {
				localStorage.setItem("lastPath", path);
			} else {
				localStorage.setItem("lastPath", "/");
			}
		} else {
			localStorage.setItem("lastPath", "/");
		}
	}, []);

	// ----------------------------
	// 2) FACEBOOK SDK INIT (Manual)
	// ----------------------------
	useEffect(() => {
		if (!window.FB) {
			window.fbAsyncInit = function () {
				window.FB.init({
					appId: process.env.REACT_APP_FACEBOOK_APP_ID,
					cookie: true,
					xfbml: true,
					version: "v14.0",
				});
			};

			(function (d, s, id) {
				var js,
					fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s);
				js.id = id;
				js.src = "https://connect.facebook.net/en_US/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			})(document, "script", "facebook-jssdk");
		}
	}, []);

	// ----------------------------
	// 3) Validation Functions
	// ----------------------------
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
			setErrors((prev) => ({ ...prev, fullName: "Full Name is required" }));
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
		// If optional, only validate if not empty
		if (phone && phone.length < 5) {
			setErrors((prev) => ({
				...prev,
				phone: "Phone must be at least 5 characters (if provided)",
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

	// clean phone from spaces
	const handlePhoneChange = (e) => {
		const input = e.target.value.replace(/\s/g, "");
		setPhone(input);
	};

	// ----------------------------
	// 4) Normal Signup (Form Submit)
	// ----------------------------
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Clear old server error
		setServerError("");

		// Validate all fields once more
		validateFullName();
		validateEmail();
		validatePhone();
		validatePassword();
		validateConfirmPassword();

		// If any local error or any required field is empty, stop
		const anyError = Object.values(errors).some((err) => err !== "");
		if (anyError || !fullName || !email || !password || !confirmPassword) {
			return;
		}

		// Show loading spinner
		setLoading(true);

		try {
			// 1) Sign up user on backend
			const signupData = await signup({
				name: fullName,
				email,
				phone,
				password,
				role: 0, // normal user
			});

			if (signupData.error) {
				setLoading(false);
				setServerError(signupData.error);
				return;
			}

			// 2) Immediately sign the user in
			const signinData = await signin({ emailOrPhone: email, password });
			if (signinData.error) {
				setLoading(false);
				setServerError(signinData.error);
				return;
			}

			// 3) Save token/user in localStorage
			authenticate(signinData, () => {});

			// 4) Show spinner for 3 seconds, then reload same page
			setTimeout(() => {
				// We can hide the spinner if we want, but not strictly needed
				setLoading(false);

				// No redirect; just reload the page:
				window.location.reload();
			}, 3000);
		} catch (err) {
			console.error("Signup error:", err);
			setLoading(false);
			setServerError(err.message || "Something went wrong. Please try again.");
		}
	};

	// ----------------------------
	// 5) FACEBOOK SIGNUP
	// ----------------------------
	// eslint-disable-next-line
	const handleFacebookSignup = () => {
		if (!window.FB) {
			return alert("Facebook SDK not loaded yet. Please try again.");
		}
		window.FB.login(
			async (response) => {
				if (response.status === "connected") {
					const { accessToken, userID } = response.authResponse;
					try {
						const { data } = await axios.post(
							`${process.env.REACT_APP_API_URL}/facebook-login`,
							{ userID, accessToken }
						);
						if (data.error) {
							return alert(data.error);
						}
						// store in localStorage
						authenticate(data, () => {
							// Wait 3s, then reload
							setTimeout(() => {
								window.location.reload();
							}, 3000);
						});
					} catch (error) {
						console.log("Facebook signup error:", error);
						alert("Facebook signup failed. Please try again.");
					}
				} else {
					alert(
						"Facebook login was not successful, user cancelled or blocked."
					);
				}
			},
			{ scope: "email" }
		);
	};

	// ----------------------------
	// 6) GOOGLE SIGNUP
	// ----------------------------
	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const { credential } = credentialResponse;
			if (!credential) {
				return alert("No credential returned from Google");
			}
			setLoading(true);

			// POST to your backend
			const { data } = await axios.post(
				`${process.env.REACT_APP_API_URL}/google-login`,
				{ idToken: credential }
			);
			setLoading(false);

			if (data.error) {
				return alert(data.error);
			}

			// store in localStorage
			authenticate(data, () => {
				// Wait 3s, then reload
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			});
		} catch (error) {
			console.log("Google signup error:", error);
			alert("Google signup failed. Please try again.");
			setLoading(false);
		}
	};

	return (
		<>
			{/**
			 * COMMENTED OUT: We do NOT want to redirect the user if already authenticated
			 *
			 * if (isAuthenticated()) return <Redirect to="/" />;
			 */}

			{/* Show overlay spinner if loading */}
			{loading && (
				<Overlay>
					<Spinner />
					<RegisteringText>Registering...</RegisteringText>
				</Overlay>
			)}

			<SignupWrapper>
				<FormContainer>
					{/* SERVER ERROR MESSAGE */}
					{serverError && <ServerError>{serverError}</ServerError>}

					<FormTitle>Create an Account</FormTitle>
					<Subtitle>
						Join us today! Sign up to explore the best real estate deals.
					</Subtitle>

					<StyledForm onSubmit={handleSubmit}>
						{/* Full Name */}
						<FormGroup>
							<Label htmlFor='fullName'>
								<IconWrapper>
									<FaUserAlt />
								</IconWrapper>
								Full Name
							</Label>
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
							<Label htmlFor='email'>
								<IconWrapper>
									<MdEmail />
								</IconWrapper>
								Email
							</Label>
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

						{/* Phone (Optional) */}
						<FormGroup>
							<Label htmlFor='phone'>
								<IconWrapper>
									<FaPhoneAlt />
								</IconWrapper>
								Phone (Optional)
							</Label>
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
							<Label htmlFor='password'>
								<IconWrapper>
									<FaLock />
								</IconWrapper>
								Password
							</Label>
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
							<Label htmlFor='confirmPassword'>
								<IconWrapper>
									<FaLock />
								</IconWrapper>
								Confirm Password
							</Label>
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

					<SocialButtons>
						{/* Google OAuth Button */}
						<GoogleButton>
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={() => {
									alert("Google signup error. Try again.");
								}}
							/>
						</GoogleButton>

						{/* <FacebookButton onClick={handleFacebookSignup}>
              <FaFacebookF style={{ marginRight: "8px" }} />
              Sign up with Facebook
            </FacebookButton> */}
					</SocialButtons>

					{/* Toggle to Sign In? */}
					<ToggleRow>
						<span>Already have an account?</span>
						<ToggleLink
							onClick={() => {
								if (onToggleSignIn) onToggleSignIn(true);
							}}
						>
							Sign In
						</ToggleLink>
					</ToggleRow>
				</FormContainer>
			</SignupWrapper>
		</>
	);
};

export default Signup;

/* --------------------------------------
          STYLED COMPONENTS
-------------------------------------- */
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

const ServerError = styled.div`
	background: #ffe5e5;
	color: #d8000c;
	padding: 0.75rem 1rem;
	border-radius: 4px;
	margin-bottom: 1rem;
	font-weight: 600;
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
	display: flex;
	align-items: center;
	margin-bottom: 0.3rem;
	color: var(--text-color-dark);
	font-weight: 600;
`;

const IconWrapper = styled.span`
	display: inline-flex;
	align-items: center;
	margin-right: 6px;
	font-size: 1rem;
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

const GoogleButton = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`;

// eslint-disable-next-line
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

/* Overlay + Spinner */
const Overlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 9999;
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

const ToggleRow = styled.div`
	margin-top: 1rem;
	text-align: center;
	font-size: 0.9rem;
	color: var(--darkGrey);

	span {
		margin-right: 0.3rem;
	}
`;

const ToggleLink = styled.span`
	color: var(--primary-color);
	text-decoration: underline;
	cursor: pointer;
	&:hover {
		color: var(--primary-color-light);
	}
`;
