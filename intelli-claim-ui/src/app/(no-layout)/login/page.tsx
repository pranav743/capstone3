"use client";

import {
  Button,
  Caption,
  Card,
  Checkbox,
  Heading,
  IconButton,
  Text,
  TextField,
} from "@hdfclife-insurance/one-x-ui";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import React, { useState } from "react";
import LoginPageHero from "../../../../public/login-page-hero.png";

interface LoginFormData {
  username: string;
  password: string;
}

const Login = () => {
  const [toggle, setToggle] = useState(false);

  // moved state + handlers here so the form actually uses them
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Accepts either a form submit event or button click event (or undefined)
  const handleLoginSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();

    if (!loginFormData.username || !loginFormData.password) {
      alert("Please enter both username and password");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(loginFormData)
      });

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        alert(data.message);
        return;
      } else {
        window.location.href = "/admin/show-claim";
      }
      // else {
      //   const roles = data.roles;
      //   console.log("User roles:", roles);
      //   if (roles.includes("Admin") || roles.includes("approver")) {
      //     window.location.href = "/admin/show-claim";
      //   } else {
      //     window.location.href = "/user/show-claim";
      //   }
      // }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong!");
    }

    setLoginFormData({ username: "", password: "" });
  };

  return (
    <div className="flex flex-col justify-center lg:min-h-dvh lg:px-10">
      {/* Main content  */}
      <main className="flex justify-center items-center flex-1">
        <div className="w-full space-y-4 max-w-md">
          {/* Login Card  */}
          <Card
            className="border-none"
            classNames={{
              content: "!gap-5 ",
            }}
          >
            <img
              src="/HDFC-Life.svg"
              alt="HDFC Life"
              className="h-8 w-auto self-start"
            />
            <div className="space-y-2 text-start">
              <Heading as="h3">Welcome back,</Heading>
              <Caption className="text-gray-700">Login to get Started</Caption>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <TextField
                variant="underline"
                label="Username"
                placeholder="Username"
                name="username"
                value={loginFormData.username}
                onChange={handleInputChange}
              />
              <TextField
                placeholder="XXXXXX"
                variant="underline"
                label="Password"
                name="password"
                value={loginFormData.password}
                onChange={handleInputChange}
                type={!toggle ? "password" : "text"}
                rightSection={
                  <IconButton
                    variant="link"
                    size="sm"
                    onClick={() => setToggle(!toggle)}
                  >
                    {toggle ? <EyeSlash /> : <Eye />}
                  </IconButton>
                }
              />
              <div className="flex justify-between items-center gap-4">
                <Checkbox label="Remember Me" size="sm" />
                <Button size="xs" variant="link">
                  Forget Password?
                </Button>
              </div>
              {/* keep onClick but also make this a submit so Enter key works */}
              <Button
                type="submit"
                onClick={(e) => handleLoginSubmit(e)}
                size="lg"
                fullWidth
              >
                Login
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default function DashboardLogin() {
  const features = [
    {
      title: "Check policy details",
      image: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none">
          <path
            fill="#fff"
            stroke="#005E9E"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.15"
            d="M37.5 2H8.31l.21 33.83-3.48-9.43v14.08H37.5z"
          ></path>
          <path
            fill="#ED1C24"
            stroke="#005E9E"
            strokeWidth="1.15"
            d="M28.69 25.8a12.6 12.6 0 0 0 4.5-2.18c1.2.94 2.74 1.71 4.49 2.18l.14-.56-.14.56c1.31.35 2.62.5 3.83.45v6.35c0 5-3.58 9.21-8.33 10.18a10.42 10.42 0 0 1-8.33-10.18v-6.35c1.21.05 2.52-.1 3.84-.45Z"
          ></path>
          <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.15"
            d="m28.09 32.5 2.93 3.23 7.25-5.1"
          ></path>
          <path
            fill="#fff"
            stroke="#005E9E"
            strokeWidth="1.15"
            d="M2.1 26.38h6.32V37a3.16 3.16 0 0 1-6.31 0V26.38Z"
          ></path>
          <path
            stroke="#005E9E"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.15"
            d="M5.59 2.5v20.63H2.57m10.03-14h19.6m-19.6 6.23h19.6m-19.6 6.37h19.6m-19.6 6.36h9.25m-9.25 6.37h9.25m18.42-12.59 1.78-5.48m.86 6.81 1.99-2.63"
          ></path>
        </svg>
      ),
    },
    {
      title: "Easy Fund Switch",
      image:
        "https://helixassets.apps-hdfclife.com/visual-icons/themed/Refund-Icon.svg",
    },
    {
      title: "Customer support",
      image: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none">
          <g clipPath="url(#a)">
            <path
              stroke="#005E9E"
              strokeLinecap="square"
              strokeWidth="1.15"
              d="M36.74 12.78H40a5 5 0 0 1 5 5v2.02M34.86 36.1h3.36c.26 0 .5.1.68.27l4.42 4.13a1 1 0 0 0 1.68-.73V20.5M5.95 6.61l23.03-.08m-23.03.08v27.05a1 1 0 0 0 1.67.74l4.8-4.33a1 1 0 0 1 .67-.26h5.62"
            ></path>
            <path
              stroke="#005E9E"
              strokeLinecap="square"
              strokeWidth="1.15"
              d="M14.4 30.06v1.05a5 5 0 0 0 5 5h14.5M29.48 6.53h2a5 5 0 0 1 5 5v13.28a5 5 0 0 1-5 5H19.47"
            ></path>
            <circle
              cx="19.75"
              cy="17.69"
              r="8.01"
              fill="#ED1C24"
              stroke="#005E9E"
              strokeWidth="1.15"
            ></circle>
            <path
              fill="#fff"
              d="M18.68 18.63v-4.3a.94.94 0 1 1 1.88 0v4.3a.94.94 0 1 1-1.88 0"
            ></path>
            <ellipse
              cx="19.62"
              cy="21.3"
              fill="#fff"
              rx="0.94"
              ry="0.96"
            ></ellipse>
            <path
              stroke="#005E9E"
              strokeLinecap="round"
              strokeWidth="1.15"
              d="M12.14 2.46H3.82a2 2 0 0 0-2 2v9.37"
            ></path>
          </g>
          <defs>
            <clipPath id="a">
              <path fill="#fff" d="M45.4 45.4H.6V.6h44.8z"></path>
            </clipPath>
          </defs>
        </svg>
      ),
    },
  ];
  return (
    <div className="justify-between  flex flex-col lg:flex-row">
      <div className="lg:min-h-dvh flex flex-col bg-[#EAF7FF] lg:w-1/2 relative before:[``] before:absolute before:inset-0 before:bg-white/20 before:backdrop-blur-3xl before:z-[-1]">
        <div className="px-6 py-10 lg:px-20 lg:pt-16 2xl:px-24 2xl:pt-24 pb-10 space-y-7 relative z-1">
          <Heading
            fontWeight="bold"
            className="text-3xl/snug max-w-md text-center mx-auto 2xl:text-4xl/snug"
          >
            Access Your Policy Details Instantly
          </Heading>
          <img
            src={LoginPageHero.src}
            className="object-contain w-full lg:size-[420px] mx-auto pb-4"
            alt=""
          />
          <div className="flex justify-center -mt-16 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                classNames={{
                  content: "p-4",
                }}
                className="max-w-40"
              >
                <div className="size-12 mx-auto [&_svg]:h-full [&_svg]:w-full">
                  {index !== 1 ? (
                    feature.image
                  ) : (
                    <img src={feature.image as string} />
                  )}
                </div>
                <Text size="sm" fontWeight="medium" className="text-center">
                  {feature.title}
                </Text>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:w-1/2">
        <Login />
      </div>
    </div>
  );
}
