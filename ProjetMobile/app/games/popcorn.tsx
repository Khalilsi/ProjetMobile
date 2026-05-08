import { router } from "expo-router";
import PopcornTap from "../../components/ui/PopcornTap";

export default function PopcornScreen() {
  return <PopcornTap onBackToWelcome={() => router.back()} />;
}
