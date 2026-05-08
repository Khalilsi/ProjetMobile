import { router } from "expo-router";
import CandyCatcher from "../../components/CandyCatsher";

export default function CandyScreen() {
  return <CandyCatcher onBackToWelcome={() => router.back()} />;
}
