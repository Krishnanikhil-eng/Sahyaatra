import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/PageTransition";
import { Home } from "./pages/Home";
import { Places } from "./pages/Places";
import { EnhancedStatePlaces } from "./pages/EnhancedStatePlaces";
import { PlaceDetail } from "./pages/PlaceDetail";
import { AdvancedIndiaMap } from "./components/AdvancedIndiaMap";
import { HTMLMapIndia } from "./components/HTMLMapIndia";
import { WoodenIndiaMap } from "./components/WoodenIndiaMap";
import { InteractiveIndiaSVGMap } from "./components/InteractiveIndiaSVGMap";
import { StateDetail } from "./pages/StateDetail";
import { Trips } from "./pages/Trips";
import { CreateTrip } from "./pages/CreateTrip";
import { TripDetail } from "./pages/TripDetail";
import { Chat } from "./pages/Chat";
import { Budget } from "./pages/Budget";
import { Profile } from "./pages/Profile";
import { Demo } from "./pages/Demo";
import { Help } from "./pages/Help";
import SignInPage from "./pages/SignInPage";
import { VerifyTrip } from "./pages/VerifyTrip";

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/state/:stateCode" element={<EnhancedStatePlaces />} />
          <Route path="/places/detail/:placeId" element={<PlaceDetail />} />
          <Route path="/places/map" element={<AdvancedIndiaMap />} />
          <Route path="/places/map/html" element={<HTMLMapIndia />} />
          <Route path="/places/map/wooden" element={<WoodenIndiaMap />} />
          <Route path="/places/map/svg" element={<InteractiveIndiaSVGMap />} />
          <Route path="/states/:code" element={<StateDetail />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/create" element={<CreateTrip />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/chat/:tripId" element={<Chat />} />
          <Route path="/budget/:tripId" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trip/verify/:token" element={<VerifyTrip />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/help" element={<Help />} />
          <Route path="/signin" element={<SignInPage />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}