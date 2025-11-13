import { useState, useEffect } from "react";
import axios from "axios";
import { UserInfoData } from "@/app/api/me/route";

interface UseUserInfoDataResult {
  userInfo: UserInfoData | null;
}

const useUserInfo = (): UseUserInfoDataResult => {
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchUserData = async () => {
      try {
        const response = await axios.get<UserInfoData>(`/api/me`, {
          signal: controller.signal,
          withCredentials: true,
        });
        setUserInfo(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log("Request canceled:", err.message);
        } 

        // Don't uncomment - causes unwanted behaviour
        // else {
        //   try {
        //     const logoutResponse = await axios.post("/api/logout", null, {
        //       withCredentials: true,
        //     });
        //     console.error("Logged out:", logoutResponse.data);
        //     window.location.href = "/login";
        //   } catch (logoutErr) {
        //     console.error("Logout failed:", logoutErr);
        //   }
        // }
      }
    };
    fetchUserData();
    return () => {
      controller.abort();
    };
  }, []);

  return { userInfo };
};

export default useUserInfo;
