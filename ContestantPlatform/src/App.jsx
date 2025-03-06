import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LoginComponent from "./components/auth/LoginComponent";
import RegistrationForm from "./components/auth/RegisterComponent";
import TeamComponent from "./components/auth/TeamConfirm";
import ChallengeDetail from "./components/challenges/ChallengeDetail";
import ChallengeList from "./components/challenges/ChallengeList";
import ChallengeTopics from "./components/challenges/ChallengeTopics";
import HomePage from "./components/home/HomePage";
import Scoreboard from "./components/scoreboard/Scoreboard";
import CreateTeamComponent from "./components/team/CreateNewTeam";
import JoinTeamComponent from "./components/team/JoinTeam";
import Template from "./components/Template";
import TicketDetailPage from "./components/ticket/TicketDetailPage";
import TicketList from "./components/ticket/TicketListPage";
import UserProfile from "./components/user/UserProfile";
import LockScreen from "./template/Forbidden";
import Swal from "sweetalert2";
import { BASE_URL } from "./constants/ApiConstant";
import ActionLogs from "./components/action_logs/ActionLogComponent";
const socket = io(BASE_URL);

function App() {
  useEffect(() => {
    socket.on("notify", (data) => {
      if (data.notif_type === "alert") {
        Swal.fire({
          title: "Thông báo từ ban quản trị </br>" + data.notif_title,
          text: data.notif_message,
          icon: "info",
          confirmButtonText: "OK",
          timer: 10000,
          timerProgressBar: true,
        });
      } else if (data.notif_type == "toast") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title:
            "Thông báo từ ban quản trị</br>" + data.notif_title || "Thông báo!",
          text: data.notif_message || "Bạn có một thông báo quan trọng.",
          showConfirmButton: false,
          timer: 10000,
          timerProgressBar: true,
          showCloseButton: true,
        });
      }
      // if (data.notif_sound) {
      //   const audio = new Audio("");
      //   audio.play();
      // }
    });

    return () => {
      socket.off("notify");
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Template>
              <HomePage />
            </Template>
          }
        />
        <Route
          path="/register"
          element={<RegistrationForm></RegistrationForm>}
        />
        <Route
          path="/actions_logs"
          element={
            <Template>
              <ActionLogs></ActionLogs>
            </Template>
          }
        />
        <Route path="/login" element={<LoginComponent />} />
        <Route
          path="/team-confirm"
          element={<TeamComponent></TeamComponent>}
        ></Route>
        <Route
          path="/team-create"
          element={<CreateTeamComponent></CreateTeamComponent>}
        ></Route>
        <Route
          path="/team-join"
          element={<JoinTeamComponent></JoinTeamComponent>}
        ></Route>
        <Route
          path="/rankings"
          element={
            <Template>
              <Scoreboard />
            </Template>
          }
        />
        <Route
          path="/topics"
          element={
            <Template title="Topics">
              <ChallengeTopics />
            </Template>
          }
        />
        <Route
          path="/tickets"
          element={
            <Template title="Tickets">
              <TicketList></TicketList>
            </Template>
          }
        />
        <Route
          path="/challenge/:id"
          element={
            <Template>
              <ChallengeDetail />
            </Template>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <Template>
              <TicketDetailPage />
            </Template>
          }
        ></Route>
        <Route
          path="/topic/:categoryName"
          element={
            <Template>
              <ChallengeList />
            </Template>
          }
        />
        <Route
          path="/profile"
          element={
            <Template title="Profile">
              <UserProfile />
            </Template>
          }
        />
        <Route
          path="/forbidden"
          element={
            <Template>
              <LockScreen></LockScreen>
            </Template>
          }
        ></Route>
      </Routes>
    </Router>
  );
}

export default App;
