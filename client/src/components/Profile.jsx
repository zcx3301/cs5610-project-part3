import React from "react";
import { useAuthUser } from "../security/AuthContext";
import "../style/profile.css";

export default function Profile() {
  const { user } = useAuthUser();

  return (
    <div className="profile">
      <h1>Profile</h1>
      <div>
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
      </div>
    </div>
  );
}