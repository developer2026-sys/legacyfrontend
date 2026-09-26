import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";

const primary = "#1669A9";

export default function PartnerTeammemberButton() {
  const navigate = useNavigate();
  const [canInvite, setCanInvite] = useState(true);
  const [checked, setChecked] = useState(false);


  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/partner/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCanInvite(data.accountRole === "client_admin");
      } catch {
        setCanInvite(false);
      } finally {
        setChecked(true);
      }
    };
    checkRole();
  }, []);

  if (!checked || !canInvite) return null;
  return (
    <button
      onClick={() => navigate("/partner-teammember")}
      style={{
        background: "none", border: "none", padding: 0, marginLeft: 4,
        color: primary, fontSize: 12.5, fontWeight: 500, cursor: "pointer",
        textDecoration: "underline", textDecorationColor: "transparent",
        transition: "text-decoration-color .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.textDecorationColor = primary}
      onMouseLeave={e => e.currentTarget.style.textDecorationColor = "transparent"}
    >
      Manage members
    </button>
  );
}