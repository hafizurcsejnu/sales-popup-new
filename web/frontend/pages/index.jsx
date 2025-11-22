import {
  Card,
  Page,
  Layout,
  Image,
  Link,
  Text,
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { DashBoard } from "../components";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page fullWidth>
      <DashBoard/>
    </Page>
  );
}
