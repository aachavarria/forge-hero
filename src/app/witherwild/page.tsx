import type { Metadata } from "next";
import { SCENES } from "@/data/witherwild/scenes";
import WitherwildIntro from "./WitherwildIntro";
import "./witherwild.css";

export const metadata: Metadata = {
  title: "The Witherwild — Introducción de la campaña",
  description:
    "Una introducción cinemática a The Witherwild: Fanewick, Haven, el Mal de la Serpiente, Nikta y la corrupción que se extiende por la tierra.",
};

export default function WitherwildPage() {
  return <WitherwildIntro scenes={SCENES} />;
}
