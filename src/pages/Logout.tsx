import { auth } from "app";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const doSignOut = async () => {
      await auth.signOut();
      navigate("/login");
    };
    doSignOut();
  }, [navigate]);

  return null;
}
