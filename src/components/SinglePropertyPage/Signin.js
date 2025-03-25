import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
// eslint-disable-next-line
import { FaFacebookF, FaUserAlt, FaLock } from "react-icons/fa";
import { message } from "antd";
import { authenticate, signin } from "../../auth";
// import { Redirect } from "react-router-dom";
import axios from "axios";

// Official Google <GoogleLogin>
import { GoogleLogin } from "@react-oauth/google";

/**
 * @param {object} props
 * @param {boolean} props.signInModalOpen - from parent, if you still need it
 * @param {function} props.setSignInModalOpen - from parent, if you still need it
 * @param {function} props.onToggleSignIn - a callback to toggle the sign-in form (new)
 */
const Signin = ({
	signInModalOpen,
	setSignInModalOpen,
	onToggleSignIn, // <-- new prop to toggle
}) => {
	const [emailOrPhone, setEmailOrPhone] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Validation errors
	const [errors, setErrors] = useState({
		emailOrPhone: "",
		password: "",
	});

	// Loading overlay spinner
	const [loading, setLoading] = useState(false);

	// ----------------------------
	// (Optional) store last path in localStorage
	// ----------------------------
	useEffect(() => {
		const referrer = document.referrer;
		if (referrer && referrer.includes(window.location.host)) {
			const path = referrer.split(window.location.host)[1];
			if (path && path !== "/signin" && path !== "/signup") {
				localStorage.setItem("lastPath", path);
			} else {
				localStorage.setItem("lastPath", "/");
			}
		} else {
			localStorage.setItem("lastPath", "/");
		}
	}, []);

	// ----------------------------
	// 2) LOAD FACEBOOK SDK (if not loaded)
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
	// 3) If user is already auth, do NOT redirect
	//    (comment out the redirect logic)
	// ----------------------------
	// const redirectUser = () => {
	//   if (isAuthenticated()) {
	//     return <Redirect to='/' />;
	//   }
	// };

	// ----------------------------
	// 4) FIELD VALIDATION (blur)
	// ----------------------------
	const handleBlur = (field) => {
		if (field === "emailOrPhone") {
			if (!emailOrPhone.trim()) {
				setErrors((prev) => ({
					...prev,
					emailOrPhone: "Please enter email or phone number",
				}));
			} else {
				setErrors((prev) => ({ ...prev, emailOrPhone: "" }));
			}
		}
		if (field === "password") {
			if (!password.trim()) {
				setErrors((prev) => ({
					...prev,
					password: "Password is required",
				}));
			} else {
				setErrors((prev) => ({ ...prev, password: "" }));
			}
		}
	};

	// ----------------------------
	// 5) MANUAL SIGN-IN
	// ----------------------------
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Final presence check
		if (!emailOrPhone.trim()) {
			setErrors((prev) => ({
				...prev,
				emailOrPhone: "Please enter email or phone number",
			}));
		}
		if (!password.trim()) {
			setErrors((prev) => ({
				...prev,
				password: "Password is required",
			}));
		}

		// If no local errors, proceed
		if (emailOrPhone && password) {
			try {
				setLoading(true);
				// Attempt sign in
				const data = await signin({ emailOrPhone, password });
				setLoading(false);

				if (data.error) {
					message.error(data.error);
				} else {
					// Successful sign in
					authenticate(data, () => {
						// Show spinner for 3 seconds, then reload
						setTimeout(() => {
							setLoading(false);
							window.location.reload();
						}, 3000);
					});
				}
			} catch (err) {
				setLoading(false);
				message.error(err.message || "An error occurred. Please try again.");
			}
		}
	};

	// ----------------------------
	// 6) GOOGLE SIGN-IN
	// ----------------------------
	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const { credential } = credentialResponse;
			if (!credential) {
				return message.error("No credential returned from Google.");
			}
			setLoading(true);

			const { data } = await axios.post(
				`${process.env.REACT_APP_API_URL}/google-login`,
				{ idToken: credential }
			);

			setLoading(false);
			if (data.error) {
				message.error(data.error);
			} else {
				// store token
				authenticate(data, () => {
					// show spinner for 3s then reload
					setTimeout(() => {
						setLoading(false);
						window.location.reload();
					}, 3000);
				});
			}
		} catch (error) {
			setLoading(false);
			console.log("Google sign in error:", error);
			message.error("Google sign in failed. Please try again.");
		}
	};

	// ----------------------------
	// 7) FACEBOOK SIGN-IN
	// ----------------------------
	// eslint-disable-next-line
	const handleFacebookSignIn = () => {
		if (!window.FB) {
			return message.error("Facebook SDK not loaded yet. Please try again.");
		}

		window.FB.login(
			async (response) => {
				if (response.status === "connected") {
					const { accessToken, userID } = response.authResponse;
					try {
						setLoading(true);
						const { data } = await axios.post(
							`${process.env.REACT_APP_API_URL}/facebook-login`,
							{ userID, accessToken }
						);
						setLoading(false);

						if (data.error) {
							message.error(data.error);
						} else {
							// store token
							authenticate(data, () => {
								// show spinner for 3s then reload
								setTimeout(() => {
									setLoading(false);
									window.location.reload();
								}, 3000);
							});
						}
					} catch (err) {
						setLoading(false);
						message.error("Facebook sign in failed. Please try again.");
						console.log("Facebook sign in error:", err);
					}
				} else {
					message.error(
						"Facebook login was not successful, user cancelled or blocked."
					);
				}
			},
			{ scope: "email" }
		);
	};

	return (
		<>
			{/**
			 * COMMENTED OUT:
			 * // {redirectUser()}
			 */}

			{/* Loading overlay if loading == true */}
			{loading && (
				<Overlay>
					<Spinner />
					<SigningInText>Signing in...</SigningInText>
				</Overlay>
			)}

			<SigninWrapper>
				<SignInFormContainer>
					<FormTitle>Sign In</FormTitle>
					<FormSubtitle>Welcome back! Please sign in to continue.</FormSubtitle>

					<StyledForm onSubmit={handleSubmit}>
						{/* Email or Phone */}
						<FormGroup>
							<Label htmlFor='emailOrPhone'>
								<IconWrapper>
									<FaUserAlt />
								</IconWrapper>
								Email or Phone
							</Label>
							<Input
								id='emailOrPhone'
								type='text'
								placeholder='e.g. john@example.com or 1234567'
								value={emailOrPhone}
								onChange={(e) => setEmailOrPhone(e.target.value)}
								onBlur={() => handleBlur("emailOrPhone")}
							/>
							{errors.emailOrPhone && (
								<ErrorMsg>{errors.emailOrPhone}</ErrorMsg>
							)}
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

						<SubmitButton type='submit'>Sign In</SubmitButton>
					</StyledForm>

					<OrDivider>OR</OrDivider>

					{/* Social sign-ins */}
					<SocialButtons>
						{/* GOOGLE */}
						<GoogleButton>
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={() => {
									message.error("Google sign in failed. Please try again.");
								}}
							/>
						</GoogleButton>

						{/* FACEBOOK (uncomment if you want) */}
						{/* <FacebookButton onClick={handleFacebookSignIn}>
              <FaFacebookF style={{ marginRight: "8px" }} />
              Sign in with Facebook
            </FacebookButton> */}
					</SocialButtons>

					{/* Toggle to Sign Up? */}
					<ToggleRow>
						<span>Don’t have an account?</span>
						<ToggleLink
							onClick={() => {
								if (onToggleSignIn) onToggleSignIn(false);
							}}
						>
							Sign Up
						</ToggleLink>
					</ToggleRow>
				</SignInFormContainer>
			</SigninWrapper>
		</>
	);
};

export default Signin;

/* --------------------------------------
          STYLED COMPONENTS
-------------------------------------- */
const SigninWrapper = styled.div`
	min-height: 80vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background: var(--neutral-light);
	padding: 2rem;
`;

const SignInFormContainer = styled.div`
	width: 100%;
	max-width: 500px;
	background: var(--accent-color-2);
	box-shadow: var(--box-shadow-light);
	border-radius: 8px;
	padding: 2rem;
`;

const FormTitle = styled.h2`
	text-align: center;
	color: var(--primary-color-dark);
	margin-bottom: 0.25rem;
`;

const FormSubtitle = styled.p`
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
	background: #4267b2; /* Facebook's brand color */
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

const SigningInText = styled.div`
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
