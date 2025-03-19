import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5"; // icons for show/hide password
import { FaGoogle, FaFacebookF } from "react-icons/fa"; // icons for social sign-in
import { message } from "antd"; // antd message for error
import { authenticate, isAuthenticated, signin } from "../auth";
import { Redirect } from "react-router-dom";

const Signin = () => {
	const [emailOrPhone, setEmailOrPhone] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Basic local validation errors
	const [errors, setErrors] = useState({
		emailOrPhone: "",
		password: "",
	});

	// Loading overlay spinner
	const [loading, setLoading] = useState(false);

	// If user is already authenticated, redirect away
	const redirectUser = () => {
		if (isAuthenticated()) {
			return <Redirect to='/' />;
		}
	};

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
					// Display server error with antd's message
					message.error(data.error);
				} else {
					// Successful sign in
					authenticate(data, () => {
						// Show spinner again for 2 seconds, to simulate "Signing in..."
						setLoading(true);
						console.log(data, "dataaaaaaaaaa");
						setTimeout(() => {
							setLoading(false);
							// Redirect to agent dashboard
							if (data && data.user.role === 1000) {
								window.location.href = "/admin/dashboard";
							} else if (data && data.user.role === 2000) {
								window.location.href = "/agent/dashboard";
							} else {
								window.location.href = "/customer/dashboard";
							}
						}, 2000);
					});
				}
			} catch (err) {
				setLoading(false);
				message.error(err.message || "An error occurred. Please try again.");
			}
		}
	};

	// Social sign-in placeholders
	const handleGoogleSignIn = () => {
		console.log("Google sign in logic here...");
	};

	const handleFacebookSignIn = () => {
		console.log("Facebook sign in logic here...");
	};

	return (
		<>
			{redirectUser()}
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
							<Label htmlFor='emailOrPhone'>Email or Phone</Label>
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

						<SubmitButton type='submit'>Sign In</SubmitButton>
					</StyledForm>

					<OrDivider>OR</OrDivider>

					{/* Social sign-ins */}
					<SocialButtons>
						<GoogleButton onClick={handleGoogleSignIn}>
							<FaGoogle style={{ marginRight: "8px" }} />
							Sign in with Google
						</GoogleButton>

						<FacebookButton onClick={handleFacebookSignIn}>
							<FaFacebookF style={{ marginRight: "8px" }} />
							Sign in with Facebook
						</FacebookButton>
					</SocialButtons>
				</SignInFormContainer>
			</SigninWrapper>
		</>
	);
};

export default Signin;

/* -------------------------------------- */
/*        STYLED COMPONENTS              */
/* -------------------------------------- */

const SigninWrapper = styled.div`
	min-height: 80vh; /* or your preferred height */
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

const SigningInText = styled.div`
	color: var(--primary-color);
	font-size: 1.1rem;
	font-weight: bold;
`;
