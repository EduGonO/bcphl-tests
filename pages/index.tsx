import type { GetServerSideProps } from "next";
import RedesignPage, { getServerSideProps as getRedesignProps } from "./redesign";
import siteSettings from "../config/site-settings.json";

export default RedesignPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const homePageRoute = siteSettings.maintenanceMode
    ? siteSettings.maintenanceHomePageRoute
    : siteSettings.homePageRoute;

  if (homePageRoute !== "/") {
    return {
      redirect: {
        destination: homePageRoute,
        permanent: false,
      },
    };
  }

  return getRedesignProps();
};
